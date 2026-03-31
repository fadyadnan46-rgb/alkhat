import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('user'), // 'admin' or 'user'
  name: text("name").notNull(),
  email: text("email"),
  profilePicture: text("profile_picture"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: text("vin").notNull(),
  lot: text("lot").notNull(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  fuelType: text("fuel_type").default(''),
  destination: text("destination").notNull(),
  status: text("status").default('At Auction'),
  auction: text("auction").default(''),
  branch: text("branch").default(''),
  hasTitle: boolean("has_title").notNull().default(false),
  hasKey: boolean("has_key").notNull().default(false),
  note: text("note").default(''),
  adminNote: text("admin_note").default(''),
  assignedToUserId: varchar("assigned_to_user_id").references(() => users.id, { onDelete: 'set null' }),
  
  // Logistics
  containerNumber: text("container_number"),
  bookingNumber: text("booking_number"),
  etd: text("etd"),
  eta: text("eta"),
  
  // Photos and invoices (stored as JSON arrays)
  loadingPhotos: jsonb("loading_photos").default(sql`'[]'`),
  unloadingPhotos: jsonb("unloading_photos").default(sql`'[]'`),
  warehousePhotos: jsonb("warehouse_photos").default(sql`'[]'`),
  auctionPhotos: jsonb("auction_photos").default(sql`'[]'`),
  invoices: jsonb("invoices").default(sql`'[]'`),
  
  // Timestamp for ordering
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true });
export const selectVehicleSchema = createSelectSchema(vehicles);
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export interface InvoiceDocument {
  url: string;
  type: 'invoice' | 'carfax';
}

// Config table - stores system configuration
export const config = pgTable("config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // 'makes', 'models', 'destinations'
  value: jsonb("value").notNull(), // JSON array or object
});

export const insertConfigSchema = createInsertSchema(config).omit({ id: true });
export const selectConfigSchema = createSelectSchema(config);
export type InsertConfig = z.infer<typeof insertConfigSchema>;
export type Config = typeof config.$inferSelect;
