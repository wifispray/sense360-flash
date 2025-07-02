import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertDeviceSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Device management API routes
  // All routes prefixed with /api

  // Register/update device - accepts MAC address privately, returns public device ID
  app.post("/api/devices/register", async (req, res) => {
    try {
      const deviceData = insertDeviceSchema.parse(req.body);
      const publicDevice = await storage.registerDevice(deviceData);
      
      res.json({
        success: true,
        device: publicDevice,
        message: "Device registered successfully"
      });
    } catch (error) {
      console.error("Device registration error:", error);
      res.status(400).json({
        success: false,
        error: error instanceof z.ZodError ? "Invalid device data" : "Registration failed",
        details: error instanceof z.ZodError ? error.errors : undefined
      });
    }
  });

  // Get device information by public device ID (no MAC address exposed)
  app.get("/api/devices/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const device = await storage.getDeviceById(deviceId);
      
      if (!device) {
        return res.status(404).json({
          success: false,
          error: "Device not found"
        });
      }

      await storage.updateDeviceLastSeen(deviceId);
      
      res.json({
        success: true,
        device
      });
    } catch (error) {
      console.error("Get device error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve device"
      });
    }
  });

  // Get all active devices (admin endpoint - no MAC addresses)
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getAllActiveDevices();
      res.json({
        success: true,
        devices,
        count: devices.length
      });
    } catch (error) {
      console.error("Get devices error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve devices"
      });
    }
  });

  // Update device last seen timestamp
  app.patch("/api/devices/:deviceId/ping", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const device = await storage.getDeviceById(deviceId);
      
      if (!device) {
        return res.status(404).json({
          success: false,
          error: "Device not found"
        });
      }

      await storage.updateDeviceLastSeen(deviceId);
      
      res.json({
        success: true,
        message: "Device activity updated"
      });
    } catch (error) {
      console.error("Device ping error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update device activity"
      });
    }
  });

  // Deactivate device
  app.delete("/api/devices/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const device = await storage.getDeviceById(deviceId);
      
      if (!device) {
        return res.status(404).json({
          success: false,
          error: "Device not found"
        });
      }

      await storage.deactivateDevice(deviceId);
      
      res.json({
        success: true,
        message: "Device deactivated successfully"
      });
    } catch (error) {
      console.error("Device deactivation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to deactivate device"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString()
    });
  });

  // Firmware file serving endpoint (for demo purposes)
  app.get("/api/firmware/:filename", (req, res) => {
    const { filename } = req.params;
    
    // Validate firmware filename
    if (!filename.endsWith('.bin') || !filename.startsWith('sense360-')) {
      return res.status(404).json({
        success: false,
        error: "Firmware file not found"
      });
    }

    // For demo purposes, create a firmware-like binary file
    // In production, this would serve actual ESP32 firmware files
    const firmwareSize = 1024 * 1024; // 1MB demo firmware
    const firmwareData = Buffer.alloc(firmwareSize);
    
    // Add some binary-like header data
    firmwareData.writeUInt32LE(0xE9000000, 0); // ESP32 firmware magic number
    firmwareData.writeUInt32LE(firmwareSize, 4); // File size
    
    // Add firmware version string at offset 16
    const versionString = filename.replace('sense360-', '').replace('.bin', '');
    firmwareData.write(versionString, 16);
    
    // Fill with some demo data pattern
    for (let i = 32; i < firmwareSize; i += 4) {
      firmwareData.writeUInt32LE(0x12345678 + (i % 0xFF), i);
    }

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': firmwareData.length.toString(),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(firmwareData);
  });

  const httpServer = createServer(app);

  return httpServer;
}


