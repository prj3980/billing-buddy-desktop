
# Tauri Setup Guide for Billing Buddy

This guide will help you build the Tauri desktop application with proper code signing.

## Prerequisites

### 1. Install Rust
```bash
# Windows/macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. Install Tauri CLI
```bash
npm install -g @tauri-apps/cli
# or
cargo install tauri-cli
```

### 3. Platform-specific Dependencies

#### Windows
- Install Microsoft C++ Build Tools
- Install Windows SDK

#### macOS
- Install Xcode Command Line Tools: `xcode-select --install`

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run tauri:dev
```

### 3. Build for Production
```bash
npm run tauri:build
```

Built files will be in `src-tauri/target/release/bundle/`

## Code Signing Setup

### For Windows Code Signing

1. **Get a Code Signing Certificate**
   - Purchase from DigiCert, Sectigo, or other CA
   - Or use self-signed for testing (not recommended for distribution)

2. **Add Secrets to GitHub**
   ```
   WINDOWS_CERTIFICATE - Base64 encoded .p12/.pfx file
   WINDOWS_CERTIFICATE_PASSWORD - Certificate password
   TAURI_PRIVATE_KEY - Generated Tauri private key
   TAURI_KEY_PASSWORD - Password for Tauri key
   ```

3. **Generate Tauri Keys**
   ```bash
   tauri signer generate -w ~/.tauri/myapp.key
   ```

### For macOS Code Signing

1. **Apple Developer Account Required**
   - Enroll in Apple Developer Program ($99/year)
   - Generate certificates in Apple Developer Console

2. **Add Secrets to GitHub**
   ```
   APPLE_CERTIFICATE - Base64 encoded certificate
   APPLE_CERTIFICATE_PASSWORD - Certificate password
   APPLE_SIGNING_IDENTITY - Developer ID Application: Your Name
   APPLE_ID - Your Apple ID
   APPLE_PASSWORD - App-specific password
   APPLE_TEAM_ID - Your team ID
   ```

## GitHub Actions Deployment

### 1. Set Up Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `TAURI_PRIVATE_KEY` - Your generated private key
- `TAURI_KEY_PASSWORD` - Password for the private key
- `WINDOWS_CERTIFICATE` - Base64 encoded Windows certificate
- `WINDOWS_CERTIFICATE_PASSWORD` - Certificate password

### 2. Create a Release

1. Tag your commit:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub Actions will automatically:
   - Build for Windows, macOS, and Linux
   - Sign the executables (if certificates are configured)
   - Create a GitHub release with downloadable files

### 3. Manual Build Upload

If you prefer to build locally and upload:

```bash
# Build the app
npm run tauri:build

# Files will be in src-tauri/target/release/bundle/
# Upload the .exe, .msi, .deb, .dmg files to your release
```

## Distribution

### Windows
- `.exe` - Portable executable
- `.msi` - Windows installer
- Both will be code-signed if certificate is configured

### macOS
- `.dmg` - Disk image for installation
- `.app` - Application bundle (inside the DMG)
- Will be notarized if Apple certificates are configured

### Linux
- `.deb` - Debian/Ubuntu package
- `.AppImage` - Portable Linux application

## Troubleshooting

### Build Errors
```bash
# Clear Rust cache
cargo clean

# Update Rust
rustup update

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Certificate Issues
- Ensure certificates are not expired
- Check that certificate passwords are correct
- Verify certificate is properly encoded in base64

### Permission Issues (macOS/Linux)
```bash
chmod +x src-tauri/target/release/bundle/macos/YourApp.app/Contents/MacOS/your-app
```

## File Sizes
Tauri apps are typically:
- Windows: 15-25 MB
- macOS: 20-30 MB  
- Linux: 20-30 MB

Much smaller than Electron equivalents!

## Security Notes

- All API calls are proxied through Rust backend
- File system access is controlled
- Network requests are filtered
- More secure than Electron by default

## Next Steps

1. Test the development build: `npm run tauri:dev`
2. Create a production build: `npm run tauri:build`
3. Set up code signing certificates
4. Configure GitHub Actions secrets
5. Create your first release tag

The built executables will be production-ready and installable on user systems!
