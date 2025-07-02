import { pgTable, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Device registry table for secure MAC address management
export const devices = pgTable("devices", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  macAddress: text("mac_address").notNull().unique(),
  deviceType: text("device_type").notNull(),
  chipFamily: text("chip_family").notNull(),
  flashSize: text("flash_size").notNull(),
  sensors: jsonb("sensors").$type<string[]>().notNull(),
  description: text("description").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at"),
  notes: text("notes"),
});

// Firmware releases table
export const firmwareReleases = pgTable("firmware_releases", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  version: text("version").notNull().unique(),
  title: text("title").notNull(),
  status: text("status").notNull(), // 'stable', 'beta', 'previous'
  releaseDate: timestamp("release_date").notNull(),
  description: text("description").notNull(),
  downloadUrl: text("download_url").notNull(),
  size: text("size").notNull(),
  features: jsonb("features").$type<string[]>().notNull(),
  compatibility: text("compatibility").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Device access logs for security tracking
export const deviceAccessLogs = pgTable("device_access_logs", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  macAddress: text("mac_address").notNull(),
  accessType: text("access_type").notNull(), // 'connection', 'flash', 'erase'
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  accessedAt: timestamp("accessed_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  registeredAt: true,
  lastSeenAt: true,
});

export const selectDeviceSchema = createSelectSchema(devices);

export const insertFirmwareReleaseSchema = createInsertSchema(firmwareReleases).omit({
  id: true,
  createdAt: true,
});

export const selectFirmwareReleaseSchema = createSelectSchema(firmwareReleases);

export const insertDeviceAccessLogSchema = createInsertSchema(deviceAccessLogs).omit({
  id: true,
  accessedAt: true,
});

export const selectDeviceAccessLogSchema = createSelectSchema(deviceAccessLogs);

// Type definitions
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;

export type InsertFirmwareRelease = z.infer<typeof insertFirmwareReleaseSchema>;
export type FirmwareRelease = typeof firmwareReleases.$inferSelect;

export type InsertDeviceAccessLog = z.infer<typeof insertDeviceAccessLogSchema>;
export type DeviceAccessLog = typeof deviceAccessLogs.$inferSelect;

// Device identification response (public-safe)
export const deviceIdentificationSchema = z.object({
  deviceType: z.string(),
  chipFamily: z.string(),
  flashSize: z.string(),
  sensors: z.array(z.string()),
  description: z.string(),
  isRegistered: z.boolean(),
});

export type DeviceIdentification = z.infer<typeof deviceIdentificationSchema>;