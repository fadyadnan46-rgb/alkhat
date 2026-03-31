import { storage } from "./storage";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Check if admin already exists
    const existingAdmin = await storage.getUserByUsername("Admin");
    
    if (!existingAdmin) {
      // Create admin user with hashed password
      const hashedPassword = await bcrypt.hash("123", 10);
      const admin = await storage.createUser({
        username: "Admin",
        password: hashedPassword,
        role: "admin",
        name: "Administrator",
        email: "admin@alkhat.com",
      });
      console.log("✅ Created admin user:", admin.username);
    } else {
      // Update existing admin password
      const hashedPassword = await bcrypt.hash("123", 10);
      await storage.updateUser(existingAdmin.id, { password: hashedPassword });
      console.log("ℹ️  Admin user password updated");
    }

    // Seed config data
    const configData = {
      makes: ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes", "Nissan", "Hyundai"],
      models: {
        "Toyota": ["Camry", "Corolla", "RAV4", "Highlander"],
        "Honda": ["Accord", "Civic", "CR-V", "Pilot"],
        "Ford": ["F-150", "Mustang", "Explorer", "Edge"],
        "Chevrolet": ["Silverado", "Malibu", "Equinox", "Tahoe"],
        "BMW": ["3 Series", "5 Series", "X3", "X5"],
        "Mercedes": ["C-Class", "E-Class", "GLE", "GLC"],
        "Nissan": ["Altima", "Rogue", "Sentra", "Pathfinder"],
        "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe"]
      },
      destinations: ["Dubai", "Jeddah", "Riyadh", "Kuwait", "Doha", "Abu Dhabi", "Muscat", "Manama"]
    };

    for (const [key, value] of Object.entries(configData)) {
      const existing = await storage.getConfig(key);
      if (!existing) {
        await storage.setConfig(key, value);
        console.log(`✅ Seeded config: ${key}`);
      } else {
        console.log(`ℹ️  Config ${key} already exists`);
      }
    }

    console.log("✨ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
