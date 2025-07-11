import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Usb, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { espWebTools } from '@/lib/esp-web-tools';
import { deviceAPI } from '@/lib/device-api';
import type { ConnectionStatus, DeviceInfo } from '@/types/firmware';
import type { PublicDevice } from '@shared/schema';

interface DeviceConnectionProps {
  connectionStatus: ConnectionStatus;
  deviceInfo: DeviceInfo;
  onConnectionStatusChange: (status: ConnectionStatus) => void;
  onDeviceInfoChange: (info: DeviceInfo) => void;
}

interface ExtendedDeviceInfo extends DeviceInfo {
  deviceId?: string; // Public device identifier from backend
}

export default function DeviceConnection({
  connectionStatus,
  deviceInfo,
  onConnectionStatusChange,
  onDeviceInfoChange,
}: DeviceConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [publicDevice, setPublicDevice] = useState<PublicDevice | null>(null);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (deviceInfo.connected) return;

    setIsConnecting(true);
    onConnectionStatusChange('connecting');

    try {
      // Connect to device using ESP Web Tools
      const info = await espWebTools.connectDevice();
      
      // Register device with backend API (MAC address sent privately)
      if (info.macAddress) {
        try {
          const result = await deviceAPI.registerDevice({
            macAddress: info.macAddress,
            chipType: info.chipType || 'ESP32',
            flashSize: info.flashSize,
            deviceType: 'Sense360'
          });

          if (result.success && result.device) {
            setPublicDevice(result.device);
            
            // Update device info without MAC address for user display
            const safeDeviceInfo: DeviceInfo = {
              connected: true,
              chipType: info.chipType,
              flashSize: info.flashSize,
              // MAC address intentionally omitted from user display
            };
            
            onDeviceInfoChange(safeDeviceInfo);
            onConnectionStatusChange('connected');
            
            toast({
              title: "Device Connected",
              description: `${info.chipType || 'ESP32'} device registered and ready for flashing.`,
            });
          } else {
            throw new Error(result.error || 'Device registration failed');
          }
        } catch (apiError) {
          console.error('Device registration failed:', apiError);
          
          // Still allow connection even if registration fails
          onDeviceInfoChange({
            connected: true,
            chipType: info.chipType,
            flashSize: info.flashSize,
          });
          onConnectionStatusChange('connected');
          
          toast({
            title: "Device Connected",
            description: "Device connected but registration failed. You can still flash firmware.",
            variant: "default",
          });
        }
      } else {
        // No MAC address available, connect without registration
        onDeviceInfoChange({
          connected: true,
          chipType: info.chipType,
          flashSize: info.flashSize,
        });
        onConnectionStatusChange('connected');
        
        toast({
          title: "Device Connected",
          description: `${info.chipType || 'ESP32'} device detected and ready for flashing.`,
        });
      }
    } catch (error) {
      console.error('Connection failed:', error);
      onConnectionStatusChange('error');
      onDeviceInfoChange({ connected: false });
      
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to device",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusIndicator = () => {
    switch (connectionStatus) {
      case 'connected':
        return <div className="status-indicator status-connected" />;
      case 'connecting':
        return <div className="status-indicator status-flashing" />;
      case 'flashing':
        return <div className="status-indicator status-flashing" />;
      default:
        return <div className="status-indicator status-disconnected" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return `${deviceInfo.chipType || 'ESP32'} device connected`;
      case 'connecting':
        return 'Connecting to device...';
      case 'flashing':
        return 'Flashing firmware...';
      case 'error':
        return 'Connection failed';
      default:
        return 'No device connected';
    }
  };

  const getButtonContent = () => {
    if (isConnecting) {
      return (
        <>
          <Loader2 className="animate-spin" size={16} />
          <span>Connecting...</span>
        </>
      );
    }
    
    if (deviceInfo.connected) {
      return (
        <>
          <Check size={16} />
          <span>Connected</span>
        </>
      );
    }
    
    return (
      <>
        <Usb size={16} />
        <span>Connect Device</span>
      </>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Device Connection</CardTitle>
          <div className="flex items-center">
            {getStatusIndicator()}
            <span className="text-sm text-gray-600">{getStatusText()}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 mb-4">
              Connect your ESP32-based Sense360 device via USB cable to begin flashing firmware.
            </p>
            <Button
              onClick={handleConnect}
              disabled={isConnecting || deviceInfo.connected}
              className={`flex items-center space-x-2 transition-colors ${
                deviceInfo.connected 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {getButtonContent()}
            </Button>
            
            {deviceInfo.connected && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Device Information</p>
                <p className="text-sm text-green-700">Chip: {deviceInfo.chipType || 'ESP32'}</p>
                {publicDevice?.deviceId && (
                  <p className="text-sm text-green-700">Device ID: {publicDevice.deviceId}</p>
                )}
                {deviceInfo.flashSize && (
                  <p className="text-sm text-green-700">Flash: {deviceInfo.flashSize}</p>
                )}
                <p className="text-xs text-green-600 mt-1">
                  ✓ Device registered and ready for firmware updates
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2 text-gray-800">Connection Requirements</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <Check className="text-green-500 w-4 h-4 mr-2" />
                Chrome, Edge, or Opera browser
              </li>
              <li className="flex items-center">
                <Check className="text-green-500 w-4 h-4 mr-2" />
                USB cable connected to device
              </li>
              <li className="flex items-center">
                <Check className="text-green-500 w-4 h-4 mr-2" />
                Device in bootloader mode
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
