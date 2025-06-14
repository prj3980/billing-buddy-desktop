
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Download, Chrome, Globe } from "lucide-react";

const DesktopGuide = () => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Monitor className="h-6 w-6" />
          Install Paint Store Billing System on Desktop
        </CardTitle>
        <CardDescription>
          Follow these steps to install this web application as a desktop app on your computer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
                <li>Open Chrome and visit this website</li>
                <li>Click the install icon (⬇️) in the address bar</li>
                <li>Or go to Menu → More Tools → Create Shortcut</li>
                <li>Check "Open as window"</li>
                <li>Click "Create"</li>
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
                <li>Open Edge and visit this website</li>
                <li>Click the install icon (⬇️) in the address bar</li>
                <li>Or press Ctrl+Shift+D</li>
                <li>Click "Install"</li>
                <li>App will appear in Start Menu</li>
              </ol>
            </CardContent>
          </Card>

          {/* Firefox */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5" />
                Mozilla Firefox
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Open Firefox and visit this website</li>
                <li>Click Menu (☰) → More Tools</li>
                <li>Select "Install this site as an app"</li>
                <li>Enter app name</li>
                <li>Click "Install"</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Installation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">iOS (Safari):</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open Safari and visit this website</li>
                <li>Tap the Share button (📤)</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add"</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Android (Chrome):</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open Chrome and visit this website</li>
                <li>Tap Menu (⋮) in top right</li>
                <li>Tap "Add to Home screen"</li>
                <li>Tap "Add"</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-semibold text-lg mb-3">✅ Benefits of Desktop Installation</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <li>• Faster startup and performance</li>
            <li>• Works offline (once cached)</li>
            <li>• Dedicated window without browser UI</li>
            <li>• Appears in taskbar and app launcher</li>
            <li>• Desktop notifications</li>
            <li>• Professional look and feel</li>
          </ul>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => window.print()} 
            variant="outline"
            className="mr-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Print Instructions
          </Button>
          <Button onClick={() => navigator.share?.({ title: 'Paint Store Billing System', url: window.location.href })}>
            Share App
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DesktopGuide;
