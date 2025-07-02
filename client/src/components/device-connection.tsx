import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Usb, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { espWebTools } from '@/lib/esp-web-tools';
import type { ConnectionStatus, DeviceInfo } from '@/types/firmware';

interface DeviceConnectionProps {
  connectionStatus: ConnectionStatus;
  deviceInfo: DeviceInfo;
  onConnectionStatusChange: (status: ConnectionStatus) => void;
  onDeviceInfoChange: (info: DeviceInfo) => void;
}

export default function DeviceConnection({
  connectionStatus,
  deviceInfo,
  onConnectionStatusChange,
  onDeviceInfoChange,
}: DeviceConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    console.log('🔌 Connect button clicked!');
    console.log('📱 Device info:', deviceInfo);
    console.log('🔄 Connection status:', connectionStatus);
    
    if (deviceInfo.connected) {
      console.log('✅ Device already connected, skipping');
      return;
    }

    console.log('🚀 Starting connection process...');
    setIsConnecting(true);
    onConnectionStatusChange('connecting');

    try {
      console.log('📡 Calling espWebTools.connectDevice()...');
      const info = await espWebTools.connectDevice();
      console.log('✅ Connection successful:', info);
      
      onDeviceInfoChange(info);
      onConnectionStatusChange('connected');
      
      toast({
        title: "Device Connected",
        description: `ESP32 device detected and ready for flashing.`,
      });
    } catch (error) {
      console.error('❌ Connection failed:', error);
      onConnectionStatusChange('error');
      onDeviceInfoChange({ connected: false });
      
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to device",
        variant: "destructive",
      });
    } finally {
      console.log('🏁 Connection process finished');
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
              onClick={(e) => {
                console.log('Raw button click event:', e);
                handleConnect();
              }}
              disabled={isConnecting || deviceInfo.connected}
              className={`flex items-center space-x-2 transition-colors ${
                deviceInfo.connected 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {getButtonContent()}
            </Button>
            
            {deviceInfo.connected && deviceInfo.macAddress && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Device Information</p>
                <p className="text-sm text-green-700">Chip: {deviceInfo.chipType}</p>
                <p className="text-sm text-green-700">MAC: {deviceInfo.macAddress}</p>
                {deviceInfo.flashSize && (
                  <p className="text-sm text-green-700">Flash: {deviceInfo.flashSize}</p>
                )}
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
