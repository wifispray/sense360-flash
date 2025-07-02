import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull().unique(), // Public device identifier
  macAddress: text("mac_address").notNull(), // Private MAC address
  chipType: text("chip_type").notNull(),
  flashSize: text("flash_size"),
  deviceType: text("device_type"),
  lastSeen: timestamp("last_seen").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDeviceSchema = createInsertSchema(devices).pick({
  macAddress: true,
  chipType: true,
  flashSize: true,
  deviceType: true,
});

// Public device schema (without MAC address)
export const publicDeviceSchema = createInsertSchema(devices).pick({
  deviceId: true,
  chipType: true,
  flashSize: true,
  deviceType: true,
  lastSeen: true,
  isActive: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;
export type PublicDevice = z.infer<typeof publicDeviceSchema>;
