import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deviceAPI } from '@/lib/device-api';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

export default function DeviceAdmin() {
  const { toast } = useToast();
  
  const { data: deviceData, isLoading, error } = useQuery({
    queryKey: ['/api/devices'],
    queryFn: async () => {
      const result = await deviceAPI.getAllActiveDevices();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch devices');
      }
      return result;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleDeactivateDevice = async (deviceId: string) => {
    try {
      const result = await deviceAPI.deactivateDevice(deviceId);
      if (result.success) {
        toast({
          title: "Device Deactivated",
          description: "Device has been deactivated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
      } else {
        throw new Error(result.error || 'Deactivation failed');
      }
    } catch (error) {
      toast({
        title: "Deactivation Failed",
        description: error instanceof Error ? error.message : "Failed to deactivate device",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Loading devices...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading devices</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const devices = deviceData?.devices || [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
          <p className="text-gray-600">Manage registered ESP32 devices (MAC addresses are kept private)</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {devices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 mb-2">No devices registered yet</p>
              <p className="text-sm text-gray-400">
                Connect your ESP32 device on the main page to register it
              </p>
            </CardContent>
          </Card>
        ) : (
          devices.map((device) => (
            <Card key={device.deviceId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Device ID: {device.deviceId}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={device.isActive ? "default" : "secondary"}>
                      {device.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      onClick={() => handleDeactivateDevice(device.deviceId)}
                      variant="destructive"
                      size="sm"
                      disabled={!device.isActive}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Chip Type</p>
                    <p className="text-sm text-gray-600">{device.chipType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Device Type</p>
                    <p className="text-sm text-gray-600">{device.deviceType || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Flash Size</p>
                    <p className="text-sm text-gray-600">{device.flashSize || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Last Seen</p>
                    <p className="text-sm text-gray-600">
                      {device.lastSeen 
                        ? formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-700">
                    🔒 Device MAC address is stored securely and not displayed for privacy
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {devices.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Privacy Notice</h3>
          <p className="text-sm text-gray-600">
            MAC addresses are stored securely in the backend and are never displayed to users. 
            Each device is assigned a unique public device ID for identification while maintaining privacy.
          </p>
        </div>
      )}
    </div>
  );
}