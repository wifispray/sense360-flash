import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { firmwareManager } from '@/lib/firmware-manager';
import type { FirmwareVersion } from '@/types/firmware';

interface FirmwareSelectionProps {
  selectedFirmware: FirmwareVersion | null;
  onFirmwareSelect: (firmware: FirmwareVersion) => void;
  disabled?: boolean;
}

export default function FirmwareSelection({
  selectedFirmware,
  onFirmwareSelect,
  disabled = false,
}: FirmwareSelectionProps) {
  const [firmwareVersions, setFirmwareVersions] = useState<FirmwareVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFirmwareVersions();
  }, []);

  const loadFirmwareVersions = async () => {
    try {
      setLoading(true);
      const versions = await firmwareManager.getFirmwareVersions();
      setFirmwareVersions(versions);
    } catch (error) {
      console.error('Failed to load firmware versions:', error);
      toast({
        title: "Failed to Load Firmware",
        description: "Unable to load firmware versions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFirmwareChange = (version: string) => {
    const firmware = firmwareVersions.find(fw => fw.version === version);
    if (firmware) {
      onFirmwareSelect(firmware);
    }
  };

  const getStatusBadge = (status: FirmwareVersion['status']) => {
    switch (status) {
      case 'stable':
        return <Badge className="bg-green-100 text-green-800">Latest Stable</Badge>;
      case 'beta':
        return <Badge className="bg-orange-100 text-orange-800">Beta Release</Badge>;
      case 'previous':
        return <Badge variant="secondary">Previous Stable</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className={disabled ? 'opacity-50' : ''}>
        <CardHeader>
          <CardTitle className="text-xl">Firmware Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <Skeleton className="h-6 w-1/2 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={disabled ? 'opacity-50' : ''}>
      <CardHeader>
        <CardTitle className="text-xl">Firmware Selection</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RadioGroup
              value={selectedFirmware?.version || ''}
              onValueChange={handleFirmwareChange}
              disabled={disabled}
              className="space-y-4"
            >
              {firmwareVersions.map((firmware) => (
                <div
                  key={firmware.version}
                  className={`border border-gray-200 rounded-lg p-4 transition-colors cursor-pointer hover:border-blue-500 hover:bg-blue-50 ${
                    selectedFirmware?.version === firmware.version ? 'border-blue-500 bg-blue-50' : ''
                  } ${disabled ? 'cursor-not-allowed' : ''}`}
                  onClick={() => !disabled && handleFirmwareChange(firmware.version)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800">{firmware.title}</h3>
                      {getStatusBadge(firmware.status)}
                    </div>
                    <RadioGroupItem value={firmware.version} id={firmware.version} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Released: {firmware.releaseDate}</p>
                  <p className="text-sm text-gray-600">{firmware.description}</p>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium mb-3 text-gray-800">Firmware Details</h3>
            <div className="space-y-2 text-sm">
              {selectedFirmware ? (
                <>
                  <p><strong>Size:</strong> {selectedFirmware.size}</p>
                  <p><strong>Features:</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    {selectedFirmware.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <p><strong>Compatibility:</strong> {selectedFirmware.compatibility}</p>
                </>
              ) : (
                <p className="text-gray-600">Select a firmware version to view details</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
