import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Check, AlertCircle, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { espWebTools } from '@/lib/esp-web-tools';
import type { ConnectionStatus, FirmwareVersion, DeviceInfo, FlashingProgress } from '@/types/firmware';

interface FlashingProcessProps {
  connectionStatus: ConnectionStatus;
  selectedFirmware: FirmwareVersion | null;
  deviceInfo: DeviceInfo;
  onConnectionStatusChange: (status: ConnectionStatus) => void;
  onFlashingProgress: (progress: number) => void;
}

export default function FlashingProcess({
  connectionStatus,
  selectedFirmware,
  deviceInfo,
  onConnectionStatusChange,
  onFlashingProgress,
}: FlashingProcessProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashingProgress, setFlashingProgress] = useState<FlashingProgress>({
    percentage: 0,
    stage: 'preparing',
    message: 'Preparing to flash...'
  });
  const [flashComplete, setFlashComplete] = useState(false);
  const { toast } = useToast();

  const handleFlash = async () => {
    if (!deviceInfo.connected || !selectedFirmware) return;

    setIsFlashing(true);
    setFlashComplete(false);
    onConnectionStatusChange('flashing');

    try {
      // Set up progress callback
      espWebTools.onProgress((progress: FlashingProgress) => {
        setFlashingProgress(progress);
        onFlashingProgress(progress.percentage);
      });

      // Start flashing
      await espWebTools.flashFirmware(selectedFirmware.downloadUrl);
      
      setFlashComplete(true);
      onConnectionStatusChange('connected');
      
      toast({
        title: "Flash Complete",
        description: "Firmware has been successfully flashed to your device.",
      });
    } catch (error) {
      console.error('Flashing failed:', error);
      onConnectionStatusChange('error');
      
      toast({
        title: "Flashing Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsFlashing(false);
    }
  };

  const getStepStatus = (step: number) => {
    if (step === 1 && deviceInfo.connected) return 'completed';
    if (step === 2 && selectedFirmware) return 'completed';
    if (step === 3 && flashComplete) return 'completed';
    if (step === 1 && connectionStatus === 'connecting') return 'active';
    if (step === 3 && isFlashing) return 'active';
    return '';
  };

  const getStepIcon = (step: number) => {
    const status = getStepStatus(step);
    if (status === 'completed') {
      return <Check size={16} className="text-white" />;
    }
    if (status === 'active') {
      return <Loader2 size={16} className="text-white animate-spin" />;
    }
    return step;
  };

  const getStepCircleClass = (step: number) => {
    const status = getStepStatus(step);
    if (status === 'completed') {
      return 'w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-medium';
    }
    if (status === 'active') {
      return 'w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium';
    }
    return 'w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-medium';
  };

  const canFlash = deviceInfo.connected && selectedFirmware && !isFlashing;

  const getStatusAlert = () => {
    if (flashComplete) {
      return (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Flash Complete!</strong> Your device will reboot and create a Wi-Fi hotspot for configuration.
          </AlertDescription>
        </Alert>
      );
    }

    if (isFlashing) {
      return (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Flashing in Progress</strong> Please do not disconnect the device during flashing.
          </AlertDescription>
        </Alert>
      );
    }

    if (canFlash) {
      return (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Ready to Flash</strong> Device connected and firmware selected. Click Flash Firmware to begin.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Ready to Flash</strong> Connect your device and select firmware to begin.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Flashing Process</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="space-y-4 mb-6">
              {/* Step 1 */}
              <div className={`flex items-start space-x-3 progress-step border-l-4 pl-4 py-2 ${getStepStatus(1) === 'completed' ? 'border-green-500 bg-green-50' : getStepStatus(1) === 'active' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                <div className={getStepCircleClass(1)}>
                  {getStepIcon(1)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Device Connected</h3>
                  <p className="text-sm text-gray-600">ESP32 device detected and ready</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`flex items-start space-x-3 progress-step border-l-4 pl-4 py-2 ${getStepStatus(2) === 'completed' ? 'border-green-500 bg-green-50' : getStepStatus(2) === 'active' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                <div className={getStepCircleClass(2)}>
                  {getStepIcon(2)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Firmware Selected</h3>
                  <p className="text-sm text-gray-600">
                    {selectedFirmware ? `Selected: ${selectedFirmware.version}` : 'Choose firmware version to install'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`flex items-start space-x-3 progress-step border-l-4 pl-4 py-2 ${getStepStatus(3) === 'completed' ? 'border-green-500 bg-green-50' : getStepStatus(3) === 'active' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                <div className={getStepCircleClass(3)}>
                  {getStepIcon(3)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Flashing Complete</h3>
                  <p className="text-sm text-gray-600">Device will reboot automatically</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleFlash}
              disabled={!canFlash}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isFlashing ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Flashing...</span>
                </>
              ) : flashComplete ? (
                <>
                  <Check size={16} />
                  <span>Flash Complete</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Flash Firmware</span>
                </>
              )}
            </Button>
          </div>
          
          <div>
            {/* Progress Display */}
            {isFlashing && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium mb-3 text-gray-800">Flashing Progress</h3>
                <Progress value={flashingProgress.percentage} className="mb-2" />
                <p className="text-sm text-gray-600">{flashingProgress.message}</p>
              </div>
            )}
            
            {/* Status Messages */}
            <div className="space-y-3">
              {getStatusAlert()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
