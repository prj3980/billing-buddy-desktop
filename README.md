
# Billing Buddy Desktop

A complete billing and inventory management system for hardware stores, built with React and Electron.

## Features

- **Desktop Application**: Works offline with Electron
- **Mobile Interface**: Access via `/mobile` route for invoice creation on mobile devices
- **Mock API**: Includes complete mock API for development and standalone operation
- **Invoice Management**: Create, manage, and track invoices
- **Product Catalog**: Manage products with colors and volumes
- **Multi-platform**: Builds for Windows, macOS, and Linux

## Building the Application

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Electron development (in another terminal)
npm run electron
```

### Building for Production

#### Build Web Assets
```bash
npm run build
```

#### Build Electron Executables

##### Windows
```bash
npx electron-builder --win --x64
```

##### macOS
```bash
npx electron-builder --mac --x64 --arm64
```

##### Linux
```bash
npx electron-builder --linux --x64
```

##### All Platforms
```bash
npx electron-builder --win --mac --linux
```

### Output Files

Built executables will be in the `dist-electron/` directory:

- **Windows**: `*.exe` (installer) and `*.exe` (portable)
- **macOS**: `*.dmg`
- **Linux**: `*.AppImage` and `*.deb`

### GitHub Actions Build

The project includes automated builds via GitHub Actions:

1. **Connect to GitHub**: Use the GitHub integration in Lovable
2. **Push code**: All code will automatically sync to your repository
3. **Automated builds**: GitHub Actions will build for all platforms
4. **Releases**: Tag releases with `v*` to create GitHub releases with binaries

### Configuration Files

- `electron-builder.json`: Electron build configuration
- `electron/main.js`: Main Electron process
- `electron/preload.js`: Preload script for security
- `.github/workflows/build.yml`: GitHub Actions configuration

### Mobile Access

Access the mobile interface at `/mobile` when running the application. The mobile interface includes:

- Complete invoice creation
- Product selection with colors/volumes
- Real-time sync with desktop
- Offline capability

### API Structure

The application includes a mock API service that simulates:

- Product management
- Invoice creation and tracking
- Print status simulation
- Health checks

### Deployment Options

1. **GitHub Releases**: Automated via GitHub Actions
2. **Direct Distribution**: Build locally and distribute executables
3. **Auto-updater**: Can be configured for automatic updates (requires code signing)

### Notes

- The application works completely offline
- No external dependencies required after installation
- Mock data is included for demonstration
- Mobile interface automatically syncs with desktop

## Support

For issues or questions, please refer to the GitHub repository issues section.
