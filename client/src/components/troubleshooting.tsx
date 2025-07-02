import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Shield, 
  XCircle, 
  Usb, 
  Chrome, 
  Download,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function Troubleshooting() {
  const troubleshootingItems = [
    {
      icon: <AlertTriangle className="text-orange-600" size={20} />,
      title: "Device Not Detected",
      description: "If your device isn't showing up:",
      solutions: [
        "Try a different USB cable (data cable, not charging-only)",
        "Hold the BOOT button while connecting USB",
        "Check that you're using a supported browser (Chrome, Edge, Opera)",
        "Install CP210x or CH340 USB drivers if needed",
        "Try a different USB port on your computer"
      ]
    },
    {
      icon: <Shield className="text-orange-600" size={20} />,
      title: "Browser Permissions",
      description: "Permission issues:",
      solutions: [
        "Allow USB device access when prompted by the browser",
        'Enable "Experimental Web Platform Features" in Chrome flags',
        "Use HTTPS or localhost for Web Serial API access",
        "Clear browser cache and cookies if experiencing issues",
        "Disable browser extensions that might interfere"
      ]
    },
    {
      icon: <XCircle className="text-red-600" size={20} />,
      title: "Flashing Errors",
      description: "If flashing fails:",
      solutions: [
        "Hold BOOT button during the entire flashing process",
        "Lower the flash speed in advanced options (if available)",
        "Try erasing flash memory first before flashing",
        "Ensure stable USB connection throughout the process",
        "Close other applications that might use the serial port"
      ]
    },
    {
      icon: <Chrome className="text-blue-600" size={20} />,
      title: "Browser Compatibility",
      description: "Supported browsers and versions:",
      solutions: [
        "Google Chrome 89+ (recommended)",
        "Microsoft Edge 89+",
        "Opera 75+",
        "Chromium-based browsers with Web Serial API support",
        "Note: Firefox and Safari are not currently supported"
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <HelpCircle className="mr-2" size={24} />
          Troubleshooting
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {troubleshootingItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </h3>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              <ul className="text-sm text-gray-600 space-y-2">
                {item.solutions.map((solution, solutionIndex) => (
                  <li key={solutionIndex} className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5">•</span>
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Additional Help Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center">
              <HelpCircle className="mr-2" size={18} />
              Need More Help?
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              If you're still experiencing issues, try these additional resources:
            </p>
            <div className="space-y-2 text-sm">
              <a 
                href="#" 
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink size={14} className="mr-2" />
                View detailed documentation
              </a>
              <a 
                href="#" 
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink size={14} className="mr-2" />
                Visit support forum
              </a>
              <a 
                href="#" 
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink size={14} className="mr-2" />
                Report an issue on GitHub
              </a>
            </div>
          </div>

          {/* Quick Checklist */}
          <Alert className="bg-green-50 border-green-200">
            <AlertTriangle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Quick Checklist:</strong> Ensure you have a data USB cable, supported browser, 
              device in bootloader mode, and necessary permissions granted.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
