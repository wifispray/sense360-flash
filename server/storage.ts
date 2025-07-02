import { users, type User, type InsertUser, type Device, type InsertDevice, type PublicDevice } from "@shared/schema";
import { nanoid } from 'nanoid';

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Device management methods
  registerDevice(device: InsertDevice): Promise<PublicDevice>;
  getDeviceById(deviceId: string): Promise<PublicDevice | undefined>;
  getDeviceByMacAddress(macAddress: string): Promise<Device | undefined>;
  updateDeviceLastSeen(deviceId: string): Promise<void>;
  getAllActiveDevices(): Promise<PublicDevice[]>;
  deactivateDevice(deviceId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private devices: Map<number, Device>;
  private devicesByMac: Map<string, Device>;
  private devicesByPublicId: Map<string, Device>;
  currentUserId: number;
  currentDeviceId: number;

  constructor() {
    this.users = new Map();
    this.devices = new Map();
    this.devicesByMac = new Map();
    this.devicesByPublicId = new Map();
    this.currentUserId = 1;
    this.currentDeviceId = 1;
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
  async registerDevice(insertDevice: InsertDevice): Promise<PublicDevice> {
    // Check if device already exists by MAC address
    const existingDevice = this.devicesByMac.get(insertDevice.macAddress);
    if (existingDevice) {
      // Update existing device and mark as active
      existingDevice.chipType = insertDevice.chipType;
      existingDevice.flashSize = insertDevice.flashSize || existingDevice.flashSize;
      existingDevice.deviceType = insertDevice.deviceType || existingDevice.deviceType;
      existingDevice.lastSeen = new Date();
      existingDevice.isActive = true;
      
      return this.deviceToPublic(existingDevice);
    }

    // Create new device
    const id = this.currentDeviceId++;
    const deviceId = nanoid(12); // Generate public device ID
    const device: Device = {
      id,
      deviceId,
      macAddress: insertDevice.macAddress,
      chipType: insertDevice.chipType,
      flashSize: insertDevice.flashSize || null,
      deviceType: insertDevice.deviceType || null,
      lastSeen: new Date(),
      isActive: true,
    };

    this.devices.set(id, device);
    this.devicesByMac.set(insertDevice.macAddress, device);
    this.devicesByPublicId.set(deviceId, device);

    return this.deviceToPublic(device);
  }

  async getDeviceById(deviceId: string): Promise<PublicDevice | undefined> {
    const device = this.devicesByPublicId.get(deviceId);
    return device ? this.deviceToPublic(device) : undefined;
  }

  async getDeviceByMacAddress(macAddress: string): Promise<Device | undefined> {
    return this.devicesByMac.get(macAddress);
  }

  async updateDeviceLastSeen(deviceId: string): Promise<void> {
    const device = this.devicesByPublicId.get(deviceId);
    if (device) {
      device.lastSeen = new Date();
    }
  }

  async getAllActiveDevices(): Promise<PublicDevice[]> {
    return Array.from(this.devices.values())
      .filter(device => device.isActive)
      .map(device => this.deviceToPublic(device));
  }

  async deactivateDevice(deviceId: string): Promise<void> {
    const device = this.devicesByPublicId.get(deviceId);
    if (device) {
      device.isActive = false;
    }
  }

  // Helper method to convert Device to PublicDevice (removes MAC address)
  private deviceToPublic(device: Device): PublicDevice {
    return {
      deviceId: device.deviceId,
      chipType: device.chipType,
      flashSize: device.flashSize,
      deviceType: device.deviceType,
      lastSeen: device.lastSeen,
      isActive: device.isActive,
    };
  }
}

export const storage = new MemStorage();
