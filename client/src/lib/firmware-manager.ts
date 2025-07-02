import type { FirmwareVersion } from '@/types/firmware';

export class FirmwareManager {
  private readonly githubRepo = import.meta.env.VITE_GITHUB_REPO || 'sense360/firmware';
  private readonly githubToken = import.meta.env.VITE_GITHUB_TOKEN;

  async getFirmwareVersions(): Promise<FirmwareVersion[]> {
    try {
      // For demo purposes, return static firmware versions
      // In production, this would fetch from GitHub Releases API
      const mockVersions: FirmwareVersion[] = [
        {
          version: 'v2.1.3',
          title: 'Sense360 Firmware v2.1.3',
          status: 'stable',
          releaseDate: 'March 15, 2024',
          description: 'Enhanced Wi-Fi stability, improved sensor accuracy, and bug fixes.',
          size: '1.2 MB',
          features: ['Wi-Fi Stability', 'Sensor Accuracy', 'Bug Fixes'],
          compatibility: 'ESP32, ESP32-S2, ESP32-C3',
          downloadUrl: 'https://github.com/sense360/firmware/releases/download/v2.1.3/sense360-v2.1.3.bin'
        },
        {
          version: 'v2.1.2',
          title: 'Sense360 Firmware v2.1.2',
          status: 'previous',
          releaseDate: 'February 28, 2024',
          description: 'Power consumption optimizations and OTA update improvements.',
          size: '1.1 MB',
          features: ['Power Optimization', 'OTA Updates', 'Performance'],
          compatibility: 'ESP32, ESP32-S2',
          downloadUrl: 'https://github.com/sense360/firmware/releases/download/v2.1.2/sense360-v2.1.2.bin'
        },
        {
          version: 'v2.2.0-beta',
          title: 'Sense360 Firmware v2.2.0-beta',
          status: 'beta',
          releaseDate: 'March 20, 2024',
          description: 'New features: Bluetooth LE support, enhanced API endpoints (experimental).',
          size: '1.3 MB',
          features: ['Bluetooth LE', 'Enhanced API', 'New Sensors'],
          compatibility: 'ESP32 only',
          downloadUrl: 'https://github.com/sense360/firmware/releases/download/v2.2.0-beta/sense360-v2.2.0-beta.bin'
        }
      ];

      return mockVersions;

      // Production implementation would be:
      /*
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
      };
      
      if (this.githubToken) {
        headers['Authorization'] = `token ${this.githubToken}`;
      }

      const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/releases`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch releases: ${response.statusText}`);
      }

      const releases = await response.json();
      
      return releases.map((release: any) => ({
        version: release.tag_name,
        title: release.name || `Sense360 Firmware ${release.tag_name}`,
        status: release.prerelease ? 'beta' : 'stable',
        releaseDate: new Date(release.published_at).toLocaleDateString(),
        description: release.body || 'No description available',
        size: this.calculateSize(release.assets),
        features: this.extractFeatures(release.body),
        compatibility: this.extractCompatibility(release.body),
        downloadUrl: release.assets.find((asset: any) => asset.name.endsWith('.bin'))?.browser_download_url
      })).filter((fw: FirmwareVersion) => fw.downloadUrl);
      */
    } catch (error) {
      console.error('Failed to fetch firmware versions:', error);
      throw new Error('Failed to load firmware versions');
    }
  }

  private calculateSize(assets: any[]): string {
    const binAsset = assets.find(asset => asset.name.endsWith('.bin'));
    if (binAsset && binAsset.size) {
      const sizeInMB = (binAsset.size / (1024 * 1024)).toFixed(1);
      return `${sizeInMB} MB`;
    }
    return 'Unknown';
  }

  private extractFeatures(body: string): string[] {
    // Simple feature extraction from release notes
    const features = [];
    if (body.toLowerCase().includes('wifi') || body.toLowerCase().includes('wi-fi')) {
      features.push('Wi-Fi Improvements');
    }
    if (body.toLowerCase().includes('sensor')) {
      features.push('Sensor Updates');
    }
    if (body.toLowerCase().includes('bug') || body.toLowerCase().includes('fix')) {
      features.push('Bug Fixes');
    }
    if (body.toLowerCase().includes('bluetooth') || body.toLowerCase().includes('ble')) {
      features.push('Bluetooth Support');
    }
    return features.length > 0 ? features : ['General Improvements'];
  }

  private extractCompatibility(body: string): string {
    if (body.toLowerCase().includes('esp32-s2')) {
      return 'ESP32, ESP32-S2';
    }
    if (body.toLowerCase().includes('esp32-c3')) {
      return 'ESP32, ESP32-S2, ESP32-C3';
    }
    return 'ESP32';
  }
}

export const firmwareManager = new FirmwareManager();
