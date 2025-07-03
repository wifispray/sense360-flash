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
          version: 'v1.0.0',
          title: 'Sense360 Air Quality Monitor Factory',
          status: 'stable',
          releaseDate: 'July 2025',
          description: 'Factory firmware for air quality monitor.',
          size: '913 KB',
          features: ['Factory default', 'Air Quality', 'ESP32-S3'],
          compatibility: 'ESP32-S3',
          downloadUrl: '/api/firmware/air_quality_monitor.factory.bin'
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

