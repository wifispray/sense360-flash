import { useState, useEffect } from 'react';
import { Microchip, Wifi, HelpCircle } from 'lucide-react';
import DeviceConnection from '@/components/device-connection';
import FirmwareSelection from '@/components/firmware-selection';
import FlashingProcess from '@/components/flashing-process';
import PostFlashInstructions from '@/components/post-flash-instructions';
import Troubleshooting from '@/components/troubleshooting';
import type { ConnectionStatus, FirmwareVersion, DeviceInfo } from '@/types/firmware';

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({ connected: false });
  const [selectedFirmware, setSelectedFirmware] = useState<FirmwareVersion | null>(null);
  const [flashingProgress, setFlashingProgress] = useState(0);

  // Update page title
  useEffect(() => {
    document.title = 'Sense360 Flash - ESP32 Firmware Flashing Tool';
  }, []);

  const handleConnectionStatusChange = (status: ConnectionStatus) => {
    setConnectionStatus(status);
  };

  const handleDeviceInfoChange = (info: DeviceInfo) => {
    setDeviceInfo(info);
  };

  const handleFirmwareSelect = (firmware: FirmwareVersion) => {
    setSelectedFirmware(firmware);
  };

  const handleFlashingProgress = (progress: number) => {
    setFlashingProgress(progress);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Status indicator */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center">
            <div className="flex items-center text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' || connectionStatus === 'flashing' ? 'bg-yellow-500' : 
                'bg-gray-400'
              }`} />
              {connectionStatus === 'connected' ? 'Device Connected' : 
               connectionStatus === 'connecting' ? 'Connecting...' :
               connectionStatus === 'flashing' ? 'Flashing...' :
               'Not Connected'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Device Connection */}
          <DeviceConnection
            connectionStatus={connectionStatus}
            deviceInfo={deviceInfo}
            onConnectionStatusChange={handleConnectionStatusChange}
            onDeviceInfoChange={handleDeviceInfoChange}
          />

          {/* Firmware Selection */}
          <FirmwareSelection
            selectedFirmware={selectedFirmware}
            onFirmwareSelect={handleFirmwareSelect}
            disabled={!deviceInfo.connected}
          />

          {/* Flashing Process */}
          <FlashingProcess
            connectionStatus={connectionStatus}
            selectedFirmware={selectedFirmware}
            deviceInfo={deviceInfo}
            onConnectionStatusChange={handleConnectionStatusChange}
            onFlashingProgress={handleFlashingProgress}
          />

          {/* Post-Flash Instructions */}
          <PostFlashInstructions />

          {/* Troubleshooting */}
          <Troubleshooting />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              <p>&copy; 2024 Sense360. Built with ESP Web Tools.</p>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Documentation</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Support</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
