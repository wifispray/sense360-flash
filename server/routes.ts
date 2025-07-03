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

  // CORS preflight for firmware endpoint
  app.options("/api/firmware/:filename", (req, res) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With'
    });
    res.status(204).end();
  });

  // Firmware file serving endpoint - proxies GitHub releases with CORS headers
  app.get("/api/firmware/:filename", async (req, res) => {
    const { filename } = req.params;
    
    // Validate firmware filename
    if (!filename.endsWith('.bin')) {
      return res.status(404).json({
        success: false,
        error: "Invalid firmware file"
      });
    }

    try {
      // Map firmware filenames to GitHub release URLs
      const firmwareUrls: Record<string, string> = {
        'air_quality_monitor.factory.bin': 'https://github.com/wifispray/sense360-flash/releases/download/v1.0.0/air_quality_monitor.factory.bin'
      };
      
      const githubUrl = firmwareUrls[filename];
      if (!githubUrl) {
        return res.status(404).json({
          success: false,
          error: "Firmware file not found"
        });
      }

      // Fetch firmware from GitHub
      const response = await fetch(githubUrl);
      if (!response.ok) {
        throw new Error(`GitHub fetch failed: ${response.status} ${response.statusText}`);
      }

      const firmwareData = await response.arrayBuffer();
      const buffer = Buffer.from(firmwareData);

      // Set CORS headers and appropriate content type
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      });

      res.end(buffer);
    } catch (error) {
      console.error('Firmware fetch error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch firmware file"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
