# Sense360 Flash - ESP32 Firmware Flashing Tool

## Overview

Sense360 Flash is a custom-branded, browser-based ESP32 firmware flashing tool built on modern web technologies. The application provides a clean, minimalist interface for flashing ESP32 devices with Sense360 firmware, featuring one-click installation, multiple firmware version support, and built-in Wi-Fi provisioning through ESPHome's captive portal functionality.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom Sense360 branding
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and React hooks for local state
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Development Server**: Custom Vite integration for full-stack development

### Key Design Decisions

**Monorepo Structure**: The application uses a shared directory structure with `client/`, `server/`, and `shared/` directories to enable code sharing between frontend and backend while maintaining clear separation of concerns.

**ESP Web Tools Integration**: The application leverages ESP Web Tools for direct browser-to-device communication using the Web Serial API, eliminating the need for additional software installation.

**Static Firmware Management**: Firmware versions are managed through manual uploads to GitHub Releases, providing a simple deployment workflow without requiring complex CI/CD infrastructure.

## Key Components

### Device Connection (`DeviceConnection`)
- Handles ESP32 device detection and connection via Web Serial API
- Provides user feedback for connection status and device information
- Implements error handling for common connection issues

### Firmware Selection (`FirmwareSelection`)
- Displays available firmware versions with metadata (version, status, features)
- Supports stable, beta, and previous release categories
- Fetches firmware information from GitHub Releases API (mock data in current implementation)

### Flashing Process (`FlashingProcess`)
- Manages the firmware flashing workflow with progress tracking
- Implements real-time progress updates during flash operations
- Handles flashing errors and retry mechanisms

### Post-Flash Instructions (`PostFlashInstructions`)
- Provides step-by-step Wi-Fi configuration guidance
- Explains the captive portal setup process
- Includes visual aids and clear instructions for users

### Troubleshooting (`Troubleshooting`)
- Comprehensive troubleshooting guide for common issues
- Covers device detection, browser permissions, and flashing errors
- Provides actionable solutions for each problem category

## Data Flow

1. **Device Detection**: User connects ESP32 device via USB
2. **Browser Permission**: Web Serial API requests device access
3. **Firmware Selection**: User chooses from available firmware versions
4. **Flashing Process**: Firmware is downloaded and flashed to device
5. **Progress Tracking**: Real-time updates show flashing progress
6. **Post-Flash Setup**: Device creates Wi-Fi hotspot for configuration
7. **Wi-Fi Provisioning**: User connects to captive portal for setup

## External Dependencies

### Frontend Dependencies
- **ESP Web Tools**: Browser-based ESP32 flashing capabilities
- **Radix UI**: Accessible UI component primitives
- **TanStack Query**: Server state management and caching
- **Lucide React**: Modern icon library
- **Google Fonts**: Typography (Google Sans font family)

### Backend Dependencies
- **Drizzle ORM**: Type-safe database operations
- **Neon Database**: Serverless PostgreSQL hosting
- **Express.js**: Web server framework
- **Zod**: Runtime type validation

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint**: Code linting and formatting

## Deployment Strategy

### GitHub Pages Deployment (Configured)
- **Frontend**: Static site generation via Vite build to `dist/public`
- **Hosting**: GitHub Pages with automated CI/CD pipeline
- **Workflow**: GitHub Actions automatically builds and deploys on push to main branch
- **Files**: `.github/workflows/deploy.yml` configured for automatic deployment

### Deployment Files Created
- `DEPLOYMENT_GUIDE.md` - Complete step-by-step deployment instructions
- `README.md` - Project documentation and overview
- `.github/workflows/deploy.yml` - GitHub Actions CI/CD pipeline
- GitHub Pages configuration ready for public repositories

### Production Considerations
- **Static Hosting**: Optimized for GitHub Pages (no backend required for basic functionality)
- **Firmware Management**: Uses GitHub Releases API for firmware distribution
- **Custom Domain**: Configurable through GitHub Pages settings
- **HTTPS**: Automatically provided by GitHub Pages (required for Web Serial API)

### Deployment Process
1. Push code to GitHub repository
2. GitHub Actions automatically builds the project
3. Static files deployed to GitHub Pages
4. Site available at `https://username.github.io/repository-name/`
5. Firmware files managed through GitHub Releases

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **July 03, 2025**: Real Firmware Integration & CORS Fix
  - Updated FirmwareManager to use real v1.0.0 firmware from GitHub releases
  - Replaced demo firmware with actual air_quality_monitor.factory.bin (913 KB)
  - Implemented backend proxy for local development with CORS headers
  - Added automatic environment detection for GitHub Pages vs local deployment
  - Configured CORS proxy (allorigins.win) for GitHub Pages static deployment
  - Fixed firmware download URL to use correct filename (factory.bin not ota.bin)
  - Rebuilt and updated GitHub Pages deployment with working firmware downloads
  - Optimized for ESP32-S3 compatibility with factory default features

- **July 02, 2025**: Device Management API Implementation
  - Added secure backend API for device management
  - MAC addresses stored privately, never exposed to end users
  - Generated unique public device IDs for identification
  - Created device registration, retrieval, and management endpoints
  - Added device admin interface for viewing registered devices
  - Updated frontend to use backend API instead of displaying MAC addresses
  - Added navigation between Flash Tool and Device Admin pages
  - Implemented privacy-first architecture for sensitive device information

## Changelog

Changelog:
- July 02, 2025. Initial setup
- July 02, 2025. Device Management API with MAC address privacy