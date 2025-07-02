import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Device, FirmwareRelease, DeviceAccessLog } from "@shared/device-schema";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    macAddress: "",
    deviceType: "",
    chipFamily: "ESP32",
    flashSize: "4MB",
    sensors: [] as string[],
    description: "",
    notes: "",
  });

  // Fetch devices
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ["/api/admin/devices"],
  });

  // Fetch access logs
  const { data: accessLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/logs"],
  });

  // Device registration mutation
  const registerDeviceMutation = useMutation({
    mutationFn: (deviceData: typeof newDevice) =>
      apiRequest("/api/admin/devices", {
        method: "POST",
        body: JSON.stringify({
          ...deviceData,
          sensors: deviceData.sensors.filter(s => s.trim()),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/devices"] });
      setIsAddDeviceOpen(false);
      setNewDevice({
        macAddress: "",
        deviceType: "",
        chipFamily: "ESP32",
        flashSize: "4MB",
        sensors: [],
        description: "",
        notes: "",
      });
      toast({
        title: "Success",
        description: "Device registered successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register device",
        variant: "destructive",
      });
    },
  });

  // Device deactivation mutation
  const deactivateDeviceMutation = useMutation({
    mutationFn: (deviceId: number) =>
      apiRequest(`/api/admin/devices/${deviceId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/devices"] });
      toast({
        title: "Success",
        description: "Device deactivated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to deactivate device",
        variant: "destructive",
      });
    },
  });

  const handleSensorChange = (index: number, value: string) => {
    const updatedSensors = [...newDevice.sensors];
    updatedSensors[index] = value;
    setNewDevice({ ...newDevice, sensors: updatedSensors });
  };

  const addSensorField = () => {
    setNewDevice({ ...newDevice, sensors: [...newDevice.sensors, ""] });
  };

  const removeSensorField = (index: number) => {
    const updatedSensors = newDevice.sensors.filter((_, i) => i !== index);
    setNewDevice({ ...newDevice, sensors: updatedSensors });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Device Management Admin
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage ESP32 device registrations and monitor access logs
        </p>
      </div>

      <Tabs defaultValue="devices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="devices">Registered Devices</TabsTrigger>
          <TabsTrigger value="logs">Access Logs</TabsTrigger>
          <TabsTrigger value="firmware">Firmware Releases</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Registered Devices</h2>
            <Dialog open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen}>
              <DialogTrigger asChild>
                <Button>Register New Device</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Register New Device</DialogTitle>
                  <DialogDescription>
                    Add a new ESP32 device to the system registry
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="macAddress" className="text-right">
                      MAC Address
                    </Label>
                    <Input
                      id="macAddress"
                      value={newDevice.macAddress}
                      onChange={(e) => setNewDevice({ ...newDevice, macAddress: e.target.value })}
                      placeholder="XX:XX:XX:XX:XX:XX"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deviceType" className="text-right">
                      Device Type
                    </Label>
                    <Input
                      id="deviceType"
                      value={newDevice.deviceType}
                      onChange={(e) => setNewDevice({ ...newDevice, deviceType: e.target.value })}
                      placeholder="ESP32-DevKitC-V4"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="chipFamily" className="text-right">
                      Chip Family
                    </Label>
                    <Select value={newDevice.chipFamily} onValueChange={(value) => setNewDevice({ ...newDevice, chipFamily: value })}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ESP32">ESP32</SelectItem>
                        <SelectItem value="ESP32-S2">ESP32-S2</SelectItem>
                        <SelectItem value="ESP32-S3">ESP32-S3</SelectItem>
                        <SelectItem value="ESP32-C3">ESP32-C3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="flashSize" className="text-right">
                      Flash Size
                    </Label>
                    <Select value={newDevice.flashSize} onValueChange={(value) => setNewDevice({ ...newDevice, flashSize: value })}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2MB">2MB</SelectItem>
                        <SelectItem value="4MB">4MB</SelectItem>
                        <SelectItem value="8MB">8MB</SelectItem>
                        <SelectItem value="16MB">16MB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right mt-2">Sensors</Label>
                    <div className="col-span-3 space-y-2">
                      {newDevice.sensors.map((sensor, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={sensor}
                            onChange={(e) => handleSensorChange(index, e.target.value)}
                            placeholder="Temperature, Humidity, PM2.5..."
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSensorField(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSensorField}
                      >
                        Add Sensor
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newDevice.description}
                      onChange={(e) => setNewDevice({ ...newDevice, description: e.target.value })}
                      placeholder="Device description..."
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={newDevice.notes}
                      onChange={(e) => setNewDevice({ ...newDevice, notes: e.target.value })}
                      placeholder="Internal notes..."
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={() => registerDeviceMutation.mutate(newDevice)}
                    disabled={registerDeviceMutation.isPending}
                  >
                    {registerDeviceMutation.isPending ? "Registering..." : "Register Device"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              {devicesLoading ? (
                <div className="p-8 text-center">Loading devices...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>MAC Address</TableHead>
                      <TableHead>Device Type</TableHead>
                      <TableHead>Chip</TableHead>
                      <TableHead>Sensors</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devices.map((device: Device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-mono text-sm">
                          {device.macAddress}
                        </TableCell>
                        <TableCell>{device.deviceType}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {device.chipFamily}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {device.sensors.map((sensor, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {sensor}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={device.isActive ? "default" : "secondary"}>
                            {device.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {device.lastSeenAt 
                            ? formatDistanceToNow(new Date(device.lastSeenAt), { addSuffix: true })
                            : "Never"
                          }
                        </TableCell>
                        <TableCell>
                          {device.isActive && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deactivateDeviceMutation.mutate(device.id)}
                              disabled={deactivateDeviceMutation.isPending}
                            >
                              Deactivate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <h2 className="text-2xl font-semibold">Device Access Logs</h2>
          <Card>
            <CardContent className="p-0">
              {logsLoading ? (
                <div className="p-8 text-center">Loading access logs...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>MAC Address</TableHead>
                      <TableHead>Access Type</TableHead>
                      <TableHead>Success</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessLogs.map((log: DeviceAccessLog) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {formatDistanceToNow(new Date(log.accessedAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.macAddress}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.accessType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.success ? "default" : "destructive"}>
                            {log.success ? "Success" : "Failed"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.ipAddress || "Unknown"}
                        </TableCell>
                        <TableCell className="text-sm text-red-600">
                          {log.errorMessage || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="firmware" className="space-y-6">
          <h2 className="text-2xl font-semibold">Firmware Management</h2>
          <Card>
            <CardHeader>
              <CardTitle>Firmware Releases</CardTitle>
              <CardDescription>
                Firmware releases are managed through GitHub releases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                To add new firmware releases, create a new release in your GitHub repository 
                and upload the firmware binary files. The system will automatically detect 
                and serve the latest releases.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}