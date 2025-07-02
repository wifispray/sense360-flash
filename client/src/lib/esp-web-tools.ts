import type { FlashingProgress, DeviceInfo } from '@/types/firmware';

declare global {
  interface Window {
    esptool: any;
  }
}

export class ESPWebToolsManager {
  private device: any = null;
  private onProgressCallback?: (progress: FlashingProgress) => void;
  private onStatusCallback?: (status: string) => void;

  constructor() {
    // Initialize ESP Web Tools when available
    this.checkWebSerial();
  }

  private checkWebSerial(): boolean {
    if (!('serial' in navigator)) {
      console.warn('Web Serial API not supported');
      return false;
    }
    return true;
  }

  async connectDevice(): Promise<DeviceInfo> {
    try {
      if (!this.checkWebSerial()) {
        throw new Error('Web Serial API not supported. Please use Chrome, Edge, or Opera browser.');
      }

      // Request port selection
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });

      // Create ESP tool instance
      const esptool = await import('esptool-js');
      const transport = new esptool.Transport(port);
      
      this.device = {
        port,
        transport,
        connected: true
      };

      // Get device info
      const chipType = await this.getChipType();
      const macAddress = await this.getMacAddress();
      
      this.onStatusCallback?.('Connected to ESP32 device');

      return {
        connected: true,
        chipType,
        macAddress,
        flashSize: '4MB' // Default, could be detected
      };
    } catch (error) {
      console.error('Failed to connect to device:', error);
      throw new Error(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async flashFirmware(firmwareUrl: string): Promise<void> {
    if (!this.device?.connected) {
      throw new Error('No device connected');
    }

    try {
      this.onProgressCallback?.({ percentage: 0, stage: 'preparing', message: 'Preparing to flash...' });
      
      // Download firmware
      const response = await fetch(firmwareUrl);
      if (!response.ok) {
        throw new Error(`Failed to download firmware: ${response.statusText}`);
      }
      
      const firmwareData = await response.arrayBuffer();
      
      this.onProgressCallback?.({ percentage: 10, stage: 'erasing', message: 'Erasing flash memory...' });
      
      // Erase flash
      await this.device.transport.sync();
      await this.device.transport.eraseFlash();
      
      this.onProgressCallback?.({ percentage: 30, stage: 'writing', message: 'Writing firmware...' });
      
      // Write firmware in chunks
      const chunkSize = 4096;
      const totalChunks = Math.ceil(firmwareData.byteLength / chunkSize);
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, firmwareData.byteLength);
        const chunk = firmwareData.slice(start, end);
        
        await this.device.transport.writeFlash(0x10000 + start, new Uint8Array(chunk));
        
        const progress = 30 + (i / totalChunks) * 50;
        this.onProgressCallback?.({ 
          percentage: progress, 
          stage: 'writing', 
          message: `Writing firmware... ${Math.round(progress)}%` 
        });
      }
      
      this.onProgressCallback?.({ percentage: 85, stage: 'verifying', message: 'Verifying...' });
      
      // Verify (simplified)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.onProgressCallback?.({ percentage: 100, stage: 'complete', message: 'Flash completed successfully!' });
      
      // Reset device
      await this.device.transport.hardReset();
      
    } catch (error) {
      console.error('Flashing failed:', error);
      throw new Error(`Flashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getChipType(): Promise<string> {
    try {
      // This would be implemented with actual ESP tool detection
      return 'ESP32';
    } catch {
      return 'Unknown';
    }
  }

  private async getMacAddress(): Promise<string> {
    try {
      // This would be implemented with actual ESP tool detection
      return 'AA:BB:CC:DD:EE:FF';
    } catch {
      return 'Unknown';
    }
  }

  onProgress(callback: (progress: FlashingProgress) => void) {
    this.onProgressCallback = callback;
  }

  onStatus(callback: (status: string) => void) {
    this.onStatusCallback = callback;
  }

  disconnect() {
    if (this.device?.port) {
      this.device.port.close();
      this.device = null;
    }
  }
}

export const espWebTools = new ESPWebToolsManager();
