import { users, type User, type InsertUser } from "@shared/schema";
import { type Device, type InsertDevice, type FirmwareRelease, type InsertFirmwareRelease, type DeviceAccessLog, type InsertDeviceAccessLog, type DeviceIdentification } from "@shared/device-schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Device management
  getDeviceByMac(macAddress: string): Promise<Device | undefined>;
  registerDevice(device: InsertDevice): Promise<Device>;
  updateDeviceLastSeen(macAddress: string): Promise<void>;
  getAllDevices(): Promise<Device[]>;
  updateDevice(id: number, updates: Partial<InsertDevice>): Promise<Device | undefined>;
  deactivateDevice(id: number): Promise<boolean>;
  
  // Firmware releases
  getAllFirmwareReleases(): Promise<FirmwareRelease[]>;
  getActiveFirmwareReleases(): Promise<FirmwareRelease[]>;
  createFirmwareRelease(release: InsertFirmwareRelease): Promise<FirmwareRelease>;
  updateFirmwareRelease(id: number, updates: Partial<InsertFirmwareRelease>): Promise<FirmwareRelease | undefined>;
  
  // Device access logging
  logDeviceAccess(log: InsertDeviceAccessLog): Promise<DeviceAccessLog>;
  getDeviceAccessLogs(macAddress?: string, limit?: number): Promise<DeviceAccessLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private devices: Map<string, Device>;
  private firmwareReleases: Map<number, FirmwareRelease>;
  private accessLogs: DeviceAccessLog[];
  
  private currentUserId: number;
  private currentDeviceId: number;
  private currentFirmwareId: number;
  private currentLogId: number;

  constructor() {
    this.users = new Map();
    this.devices = new Map();
    this.firmwareReleases = new Map();
    this.accessLogs = [];
    
    this.currentUserId = 1;
    this.currentDeviceId = 1;
    this.currentFirmwareId = 1;
    this.currentLogId = 1;
    
    // Initialize with default firmware release
    this.initializeDefaultData();
  }
  
  private async initializeDefaultData() {
    // Add default firmware release
    const defaultFirmware: FirmwareRelease = {
      id: this.currentFirmwareId++,
      version: "v1.0.0",
      title: "Sense360 Air Quality Monitor v1.0.0",
      status: "stable",
      releaseDate: new Date("2024-12-01"),
      description: "Initial stable release with comprehensive air quality monitoring support for ESP32 devices.",
      downloadUrl: "https://github.com/wifispray/sense360-flash/releases/download/v1.0.0/air_quality_monitor.ota.bin",
      size: "1.2 MB",
      features: ["Temperature monitoring", "Humidity detection", "PM2.5 particle sensing", "Wi-Fi connectivity", "Web interface", "OTA updates"],
      compatibility: "ESP32, ESP32-S2, ESP32-S3, ESP32-C3",
      isActive: true,
      createdAt: new Date(),
    };
    this.firmwareReleases.set(defaultFirmware.id, defaultFirmware);
    
    // Add sample registered device
    const sampleDevice: Device = {
      id: this.currentDeviceId++,
      macAddress: "30:AE:A4:78:90:12",
      deviceType: "ESP32-DevKitC-V4",
      chipFamily: "ESP32",
      flashSize: "4MB",
      sensors: ["Temperature", "Humidity", "PM2.5"],
      description: "Standard ESP32 with basic air quality monitoring",
      isActive: true,
      registeredAt: new Date(),
      lastSeenAt: new Date(),
      notes: "Sample registered device for testing",
    };
    this.devices.set(sampleDevice.macAddress, sampleDevice);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Device management methods
  async getDeviceByMac(macAddress: string): Promise<Device | undefined> {
    return this.devices.get(macAddress);
  }

  async registerDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = this.currentDeviceId++;
    const device: Device = {
      ...insertDevice,
      id,
      isActive: insertDevice.isActive ?? true,
      registeredAt: new Date(),
      lastSeenAt: new Date(),
      notes: insertDevice.notes ?? null,
    };
    this.devices.set(device.macAddress, device);
    return device;
  }

  async updateDeviceLastSeen(macAddress: string): Promise<void> {
    const device = this.devices.get(macAddress);
    if (device) {
      device.lastSeenAt = new Date();
      this.devices.set(macAddress, device);
    }
  }

  async getAllDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async updateDevice(id: number, updates: Partial<InsertDevice>): Promise<Device | undefined> {
    const devices = Array.from(this.devices.entries());
    for (const [macAddress, device] of devices) {
      if (device.id === id) {
        const updatedDevice: Device = { ...device, ...updates };
        this.devices.set(macAddress, updatedDevice);
        return updatedDevice;
      }
    }
    return undefined;
  }

  async deactivateDevice(id: number): Promise<boolean> {
    const devices = Array.from(this.devices.entries());
    for (const [macAddress, device] of devices) {
      if (device.id === id) {
        device.isActive = false;
        this.devices.set(macAddress, device);
        return true;
      }
    }
    return false;
  }

  // Firmware release methods
  async getAllFirmwareReleases(): Promise<FirmwareRelease[]> {
    return Array.from(this.firmwareReleases.values());
  }

  async getActiveFirmwareReleases(): Promise<FirmwareRelease[]> {
    return Array.from(this.firmwareReleases.values()).filter(release => release.isActive);
  }

  async createFirmwareRelease(insertRelease: InsertFirmwareRelease): Promise<FirmwareRelease> {
    const id = this.currentFirmwareId++;
    const release: FirmwareRelease = {
      ...insertRelease,
      id,
      createdAt: new Date(),
    };
    this.firmwareReleases.set(id, release);
    return release;
  }

  async updateFirmwareRelease(id: number, updates: Partial<InsertFirmwareRelease>): Promise<FirmwareRelease | undefined> {
    const release = this.firmwareReleases.get(id);
    if (release) {
      const updatedRelease: FirmwareRelease = { ...release, ...updates };
      this.firmwareReleases.set(id, updatedRelease);
      return updatedRelease;
    }
    return undefined;
  }

  // Device access logging methods
  async logDeviceAccess(insertLog: InsertDeviceAccessLog): Promise<DeviceAccessLog> {
    const id = this.currentLogId++;
    const log: DeviceAccessLog = {
      ...insertLog,
      id,
      accessedAt: new Date(),
    };
    this.accessLogs.push(log);
    return log;
  }

  async getDeviceAccessLogs(macAddress?: string, limit: number = 100): Promise<DeviceAccessLog[]> {
    let logs = this.accessLogs;
    
    if (macAddress) {
      logs = logs.filter(log => log.macAddress === macAddress);
    }
    
    // Sort by most recent first
    logs.sort((a, b) => b.accessedAt.getTime() - a.accessedAt.getTime());
    
    return logs.slice(0, limit);
  }
}

export const storage = new MemStorage();
