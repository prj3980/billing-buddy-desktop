
const { build } = require('electron-builder');
const path = require('path');

async function buildElectron() {
  try {
    console.log('Building Electron app for Windows...');
    
    await build({
      targets: [
        {
          target: 'nsis',
          arch: 'x64'
        },
        {
          target: 'msi', 
          arch: 'x64'
        },
        {
          target: 'portable',
          arch: 'x64'
        }
      ],
      config: {
        appId: 'com.lovable.billingbuddy',
        productName: 'Billing Buddy',
        directories: {
          output: 'dist'
        },
        files: [
          'dist/**/*',
          'electron/**/*'
        ],
        win: {
          target: [
            { target: 'nsis', arch: ['x64'] },
            { target: 'msi', arch: ['x64'] },
            { target: 'portable', arch: ['x64'] }
          ],
          icon: 'electron/assets/icon.ico'
        }
      }
    });
    
    console.log('✅ Electron build completed successfully!');
  } catch (error) {
    console.error('❌ Electron build failed:', error);
    process.exit(1);
  }
}

buildElectron();
