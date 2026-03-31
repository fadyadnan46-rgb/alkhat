import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertVehicleSchema } from "@shared/schema";
import { z } from "zod";
import { requireAuth, requireAdmin } from "./middleware/auth";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { fileURLToPath } from "url";

// Get project root directory - works in both dev and production
const getProjectRoot = () => {
  // In production, dist/index.cjs runs from dist folder
  // In development, server/routes.ts runs from server folder
  if (process.env.NODE_ENV === 'production') {
    return process.cwd();
  }
  return process.cwd();
};

const uploadDir = path.join(getProjectRoot(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
console.log("Upload directory:", uploadDir);

const storage_multer = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and PDF are allowed.'));
    }
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ==================== FILE DOWNLOAD API ====================
  // API route for serving uploaded files as binary
  app.get("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    console.log("File request:", filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log("File not found:", filePath);
      return res.status(404).json({ error: "File not found" });
    }
    
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    
    if (contentTypes[ext]) {
      res.setHeader('Content-Type', contentTypes[ext]);
    }
    
    res.sendFile(filePath);
  });
  
  // API route for getting file as base64 (for inline viewing)
  app.get("/api/files-base64/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    console.log("Base64 file request:", filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log("File not found:", filePath);
      return res.status(404).json({ error: "File not found" });
    }
    
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const base64 = fileBuffer.toString('base64');
      const ext = path.extname(filename).toLowerCase();
      
      const mimeTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      };
      
      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      
      res.json({
        data: base64,
        mimeType: mimeType,
        filename: filename
      });
    } catch (error) {
      console.error("Error reading file:", error);
      res.status(500).json({ error: "Error reading file" });
    }
  });
  
  // ==================== AUTH ROUTES ====================
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Store user in session
      const { password: _, ...userWithoutPassword } = user;
      (req.session as any).user = userWithoutPassword;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  // Check if user is authenticated (for session validation on page load)
  app.get("/api/auth/me", (req, res) => {
    const user = (req.session as any).user;
    if (user) {
      res.json({ user, authenticated: true });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  // ==================== USER ROUTES ====================
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userWithHashedPassword = { ...userData, password: hashedPassword };
      
      const user = await storage.createUser(userWithHashedPassword);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const updates = { ...req.body };
      
      // If password is being updated, hash it first
      if (updates.password && updates.password.trim() !== '') {
        updates.password = await bcrypt.hash(updates.password, 10);
      } else {
        // Don't update password if empty or not provided
        delete updates.password;
      }
      
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Profile picture upload
  app.post("/api/users/:id/profile-picture", requireAuth, upload.single('profilePicture'), async (req, res) => {
    try {
      const userId = req.params.id;
      const currentUser = (req.session as any).user;
      
      // Only allow users to update their own profile picture or admins to update anyone's
      if (currentUser.role !== 'admin' && currentUser.id !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const profilePictureUrl = `/api/files/${req.file.filename}`;
      const user = await storage.updateUser(userId, { profilePicture: profilePictureUrl });
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      
      // Update session if updating current user
      if (currentUser.id === userId) {
        (req.session as any).user = userWithoutPassword;
      }
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Profile picture upload error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== VEHICLE ROUTES ====================
  app.get("/api/vehicles", requireAuth, async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/vehicles", requireAdmin, async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      
      // Check for duplicate VIN
      const existingVehicle = await storage.getVehicleByVin(vehicleData.vin);
      if (existingVehicle) {
        return res.status(400).json({ error: "A vehicle with this VIN already exists", code: "DUPLICATE_VIN" });
      }
      
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/vehicles/:id", requireAdmin, async (req, res) => {
    try {
      const vehicle = await storage.updateVehicle(req.params.id, req.body);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/vehicles/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteVehicle(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vehicle photos upload
  app.post("/api/vehicles/:id/photos/:type", requireAdmin, upload.array('photos', 100), async (req, res) => {
    try {
      const vehicleId = req.params.id;
      const photoType = req.params.type as 'loadingPhotos' | 'unloadingPhotos' | 'warehousePhotos' | 'auctionPhotos';
      
      if (!['loadingPhotos', 'unloadingPhotos', 'warehousePhotos', 'auctionPhotos'].includes(photoType)) {
        return res.status(400).json({ error: "Invalid photo type" });
      }
      
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      const newPhotoUrls = files.map(file => `/api/files/${file.filename}`);
      const existingPhotos = (vehicle[photoType] as string[]) || [];
      const updatedPhotos = [...existingPhotos, ...newPhotoUrls];
      
      const updatedVehicle = await storage.updateVehicle(vehicleId, { [photoType]: updatedPhotos });
      res.json(updatedVehicle);
    } catch (error) {
      console.error('Vehicle photo upload error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vehicle invoice upload (supports multiple invoices with document type)
  app.post("/api/vehicles/:id/invoices", requireAdmin, upload.array('invoices', 100), async (req, res) => {
    try {
      const vehicleId = req.params.id;
      const documentType = req.body.documentType || 'invoice';
      
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      const newInvoices = files.map(file => ({
        url: `/api/files/${file.filename}`,
        type: documentType as 'invoice' | 'carfax'
      }));
      
      const existingInvoices = (vehicle.invoices as any[]) || [];
      const updatedInvoices = [...existingInvoices, ...newInvoices];
      
      const updatedVehicle = await storage.updateVehicle(vehicleId, { invoices: updatedInvoices });
      res.json(updatedVehicle);
    } catch (error) {
      console.error('Invoice upload error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete a specific invoice
  app.delete("/api/vehicles/:id/invoices", requireAdmin, async (req, res) => {
    try {
      const vehicleId = req.params.id;
      const { invoiceUrl } = req.body;
      
      if (!invoiceUrl) {
        return res.status(400).json({ error: "Invoice URL is required" });
      }
      
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      const existingInvoices = (vehicle.invoices as any[]) || [];
      const updatedInvoices = existingInvoices.filter(inv => {
        const url = typeof inv === 'string' ? inv : inv.url;
        return url !== invoiceUrl;
      });
      
      const updatedVehicle = await storage.updateVehicle(vehicleId, { invoices: updatedInvoices });
      res.json(updatedVehicle);
    } catch (error) {
      console.error('Invoice delete error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== CONFIG ROUTES ====================
  app.get("/api/config", requireAuth, async (req, res) => {
    try {
      const configs = await storage.getAllConfig();
      // Transform to frontend format
      const configObj: any = {};
      for (const cfg of configs) {
        configObj[cfg.key] = cfg.value;
      }
      res.json(configObj);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/config/:key", requireAuth, async (req, res) => {
    try {
      const cfg = await storage.getConfig(req.params.key);
      if (!cfg) {
        return res.status(404).json({ error: "Config not found" });
      }
      res.json(cfg);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/config/:key", requireAdmin, async (req, res) => {
    try {
      const { value } = req.body;
      const cfg = await storage.setConfig(req.params.key, value);
      res.json(cfg);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
