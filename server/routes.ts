import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDeviceSchema, insertFirmwareReleaseSchema, insertDeviceAccessLogSchema, deviceIdentificationSchema } from "@shared/device-schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Device identification endpoint (public)
  app.post("/api/devices/identify", async (req: Request, res: Response) => {
    try {
      const { macAddress } = req.body;
      
      if (!macAddress || typeof macAddress !== 'string') {
        return res.status(400).json({ error: "MAC address is required" });
      }
      
      // Log access attempt
      await storage.logDeviceAccess({
        macAddress,
        accessType: 'connection',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || 'Unknown',
        success: true,
      });
      
      // Update last seen if device exists
      await storage.updateDeviceLastSeen(macAddress);
      
      const device = await storage.getDeviceByMac(macAddress);
      
      if (device && device.isActive) {
        const identification: z.infer<typeof deviceIdentificationSchema> = {
          deviceType: device.deviceType,
          chipFamily: device.chipFamily,
          flashSize: device.flashSize,
          sensors: device.sensors,
          description: device.description,
          isRegistered: true,
        };
        return res.json(identification);
      }
      
      // Return generic ESP32 info for unregistered devices
      return res.json({
        deviceType: "ESP32-Generic",
        chipFamily: "ESP32",
        flashSize: "4MB",
        sensors: ["Unknown"],
        description: "Unregistered ESP32 device",
        isRegistered: false,
      });
      
    } catch (error) {
      console.error('Device identification error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get active firmware releases (public)
  app.get("/api/firmware/releases", async (_req: Request, res: Response) => {
    try {
      const releases = await storage.getActiveFirmwareReleases();
      res.json(releases);
    } catch (error) {
      console.error('Firmware releases error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Log device access (public)
  app.post("/api/devices/log-access", async (req: Request, res: Response) => {
    try {
      const logData = insertDeviceAccessLogSchema.parse({
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || 'Unknown',
      });
      
      const log = await storage.logDeviceAccess(logData);
      res.json({ success: true, logId: log.id });
    } catch (error) {
      console.error('Access logging error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin routes for device management
  app.get("/api/admin/devices", async (_req: Request, res: Response) => {
    try {
      const devices = await storage.getAllDevices();
      res.json(devices);
    } catch (error) {
      console.error('Get devices error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/devices", async (req: Request, res: Response) => {
    try {
      const deviceData = insertDeviceSchema.parse(req.body);
      const device = await storage.registerDevice(deviceData);
      res.json(device);
    } catch (error) {
      console.error('Device registration error:', error);
      res.status(500).json({ error: "Invalid device data" });
    }
  });

  app.put("/api/admin/devices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertDeviceSchema.partial().parse(req.body);
      const device = await storage.updateDevice(id, updates);
      
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      
      res.json(device);
    } catch (error) {
      console.error('Device update error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/devices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deactivateDevice(id);
      
      if (!success) {
        return res.status(404).json({ error: "Device not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Device deactivation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/logs", async (req: Request, res: Response) => {
    try {
      const { macAddress, limit } = req.query;
      const logs = await storage.getDeviceAccessLogs(
        macAddress as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(logs);
    } catch (error) {
      console.error('Access logs error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
