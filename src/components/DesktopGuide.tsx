
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Download, Chrome, Globe, Wifi, WifiOff } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import PWAInstallPrompt from "./PWAInstallPrompt";
import DataManager from "./DataManager";

const DesktopGuide = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowInstallPrompt(false);
    }
  };

  if (showDataManager) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Data Management</h1>
          <Button variant="outline" onClick={() => setShowDataManager(false)}>
            Back to Installation Guide
          </Button>
        </div>
        <DataManager />
      </div>
    );
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Monitor className="h-6 w-6" />
            Install Paint Store Billing System
            {isInstalled && <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">Installed ✓</span>}
          </CardTitle>
          <CardDescription>
            Install this web application for offline access and better performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PWA Installation Section */}
          {!isInstalled && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                Quick Installation (Recommended)
              </h3>
              <p className="text-gray-700 mb-4">
                Install this app directly from your browser for the best experience. It will work offline and feel like a native desktop app.
              </p>
              <div className="flex items-center gap-4">
                {isInstallable ? (
                  <Button onClick={handleInstall} className="bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Install App Now
                  </Button>
                ) : (
                  <Button onClick={() => setShowInstallPrompt(true)} variant="outline">
                    Show Install Options
                  </Button>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <WifiOff className="h-4 w-4" />
                  <span>Works offline once installed</span>
                </div>
              </div>
            </div>
          )}

          {/* Installation Benefits */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-600" />
              Benefits of Installation
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Works completely offline
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Faster startup and performance
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Data saved locally on your device
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Desktop app experience
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Export invoices and data anytime
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                No internet required after installation
              </li>
            </ul>
          </div>

          {/* Manual Installation Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chrome */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Chrome className="h-5 w-5" />
                  Google Chrome
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Look for install icon (⬇️) in address bar</li>
                  <li>Click "Install" button</li>
                  <li>Or go to Menu → Install Paint Store Billing</li>
                  <li>App will open in its own window</li>
                </ol>
              </CardContent>
            </Card>

            {/* Edge */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Monitor className="h-5 w-5" />
                  Microsoft Edge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Click install icon (⬇️) in address bar</li>
                  <li>Or press Ctrl+Shift+D</li>
                  <li>Click "Install"</li>
                  <li>App appears in Start Menu</li>
                </ol>
              </CardContent>
            </Card>

            {/* Firefox */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5" />
                  Firefox / Safari
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Bookmark this page</li>
                  <li>Use bookmark to access offline</li>
                  <li>Data will be saved in browser</li>
                  <li>Works without internet</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Installation */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile Installation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">iOS (Safari):</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Tap Share button (📤)</li>
                  <li>Scroll and tap "Add to Home Screen"</li>
                  <li>Tap "Add"</li>
                  <li>App icon appears on home screen</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Android (Chrome):</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Tap Menu (⋮) in top right</li>
                  <li>Tap "Add to Home screen"</li>
                  <li>Tap "Add"</li>
                  <li>App icon appears on home screen</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="flex justify-center gap-4">
              <Button onClick={() => setShowDataManager(true)} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Manage Data & Exports
              </Button>
              <Button onClick={() => navigator.share?.({ title: 'Paint Store Billing System', url: window.location.href })}>
                Share App
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Once installed, all your invoices and data will be saved locally on your device and accessible offline.
            </p>
          </div>
        </CardContent>
      </Card>

      {showInstallPrompt && (
        <PWAInstallPrompt onClose={() => setShowInstallPrompt(false)} />
      )}
    </>
  );
};

export default DesktopGuide;
