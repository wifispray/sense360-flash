import { apiRequest } from '@/lib/queryClient';
import type { PublicDevice, InsertDevice } from '@shared/schema';

export interface DeviceRegistrationResponse {
  success: boolean;
  device?: PublicDevice;
  message?: string;
  error?: string;
}

export interface DeviceResponse {
  success: boolean;
  device?: PublicDevice;
  error?: string;
}

export interface DevicesListResponse {
  success: boolean;
  devices?: PublicDevice[];
  count?: number;
  error?: string;
}

export class DeviceAPI {
  
  async registerDevice(deviceData: InsertDevice): Promise<DeviceRegistrationResponse> {
    try {
      const response = await apiRequest('POST', '/api/devices/register', deviceData);
      return await response.json();
    } catch (error) {
      console.error('Device registration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  async getDevice(deviceId: string): Promise<DeviceResponse> {
    try {
      const response = await apiRequest('GET', `/api/devices/${deviceId}`);
      return await response.json();
    } catch (error) {
      console.error('Get device failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get device'
      };
    }
  }

  async getAllActiveDevices(): Promise<DevicesListResponse> {
    try {
      const response = await apiRequest('GET', '/api/devices');
      return await response.json();
    } catch (error) {
      console.error('Get devices failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get devices'
      };
    }
  }

  async pingDevice(deviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiRequest('PATCH', `/api/devices/${deviceId}/ping`);
      return await response.json();
    } catch (error) {
      console.error('Device ping failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ping failed'
      };
    }
  }

  async deactivateDevice(deviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiRequest('DELETE', `/api/devices/${deviceId}`);
      return await response.json();
    } catch (error) {
      console.error('Device deactivation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deactivation failed'
      };
    }
  }
}

export const deviceAPI = new DeviceAPI();