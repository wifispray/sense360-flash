import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, Smartphone, Settings, CheckCircle } from 'lucide-react';

export default function PostFlashInstructions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">After Flashing</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3 text-gray-800 flex items-center">
              <Wifi className="mr-2" size={18} />
              Wi-Fi Setup
            </h3>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Device will reboot and create a Wi-Fi hotspot named <strong>"Sense360-XXXXXX"</strong></span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <span>Connect your phone or computer to this hotspot</span>
                  <div className="mt-1 flex items-center space-x-2">
                    <Smartphone size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">Look for the network in your Wi-Fi settings</span>
                  </div>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>Browser will automatically open the configuration page</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <span>Enter your home Wi-Fi credentials to complete setup</span>
                  <div className="mt-1 flex items-center space-x-2">
                    <Settings size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">Configure network settings and device preferences</span>
                  </div>
                </div>
              </li>
            </ol>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium mb-2 text-green-800 flex items-center">
              <CheckCircle className="mr-2" size={18} />
              Setup Complete!
            </h3>
            <p className="text-sm text-green-700 mb-3">Your Sense360 device is now ready to use.</p>
            
            <div className="text-sm text-gray-700">
              <p className="mb-2 font-medium">Next steps:</p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Configure device settings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Set up automation rules</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Monitor sensor data</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Enable OTA updates</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <div className="text-xs text-blue-800">
                <strong>Tip:</strong> If the captive portal doesn't open automatically, navigate to 
                <Badge variant="outline" className="mx-1 text-xs">192.168.4.1</Badge>
                in your browser.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

