
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';

// Check if running in Tauri
export const isTauri = () => {
  return window.__TAURI__ !== undefined;
};

// Tauri-specific functions
export const tauriCommands = {
  greet: async (name: string): Promise<string> => {
    return await invoke('greet', { name });
  },
  
  closeSplashscreen: async () => {
    return await invoke('close_splashscreen');
  },
  
  minimizeWindow: async () => {
    if (isTauri()) {
      return await appWindow.minimize();
    }
  },
  
  maximizeWindow: async () => {
    if (isTauri()) {
      return await appWindow.maximize();
    }
  },
  
  closeWindow: async () => {
    if (isTauri()) {
      return await appWindow.close();
    }
  }
};

// Initialize Tauri-specific features
export const initializeTauri = async () => {
  if (isTauri()) {
    console.log('Running in Tauri environment');
    
    // Set up window controls
    document.addEventListener('DOMContentLoaded', () => {
      // Add window controls if needed
    });
    
    // Handle app-specific initialization
    try {
      await tauriCommands.closeSplashscreen();
    } catch (error) {
      console.log('No splashscreen to close');
    }
  }
};
