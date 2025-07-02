# Sense360 Flash - ESP32 Firmware Flashing Tool

A professional, browser-based firmware flashing tool for Sense360 ESP32 devices. Built with modern web technologies and designed for ease of use.

## Features

- **One-Click Flashing**: Simple firmware installation process
- **Multiple Firmware Support**: Select from stable, beta, and previous versions
- **Device Detection**: Automatic ESP32 device recognition via Web Serial API
- **Progress Tracking**: Real-time flashing progress with visual indicators
- **Wi-Fi Setup Guide**: Step-by-step captive portal configuration instructions
- **Troubleshooting**: Comprehensive help for common issues
- **Professional UI**: Clean, Google-inspired design with Sense360 branding

## Supported Hardware

- **MCU**: ESP32-S3-WROOM-1-N16R8
- **Sensors**: 
  - Hi-Link LD2412 Radar Module
  - MiCS-4514 Gas Sensor
  - LTR-303ALS-01 Optical Sensor
  - Sensirion SGP41, SCD41, SPS30 Air Quality Sensors
- **Additional Components**: WS2812B LEDs, PWM Fan Control

## Browser Requirements

- Chrome 89+ (recommended)
- Microsoft Edge 89+
- Opera 75+
- Any Chromium-based browser with Web Serial API support

*Note: Firefox and Safari are not currently supported due to Web Serial API limitations.*

## Development

### Prerequisites
- Node.js 20+
- npm

### Setup
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
```

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions on deploying to GitHub Pages.

## Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Build Tool**: Vite
- **Flashing**: ESP Web Tools integration
- **Deployment**: GitHub Pages with automated CI/CD

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section in the app
- Review the deployment guide
- Open an issue on GitHub

---

Built with ❤️ for the Sense360 community