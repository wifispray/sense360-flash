export interface FirmwareVersion {
  version: string;
  title: string;
  status: 'stable' | 'beta' | 'previous';
  releaseDate: string;
  description: string;
  size: string;
  features: string[];
  compatibility: string;
  downloadUrl: string;
}

export interface FlashingProgress {
  percentage: number;
  stage: 'preparing' | 'erasing' | 'writing' | 'verifying' | 'complete';
  message: string;
}

export interface DeviceInfo {
  connected: boolean;
  chipType?: string;
  macAddress?: string;
  flashSize?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'flashing' | 'error';
