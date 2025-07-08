
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Monitor, X } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

interface PWAInstallPromptProps {
  onClose: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onClose }) => {
  const { isInstallable, installApp } = usePWA();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      onClose();
    }
  };

  if (!isInstallable) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Install App
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Install Billing Buddy for offline access and better performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Monitor className="h-4 w-4" />
          <span>Works offline once installed</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Smartphone className="h-4 w-4" />
          <span>Native app experience</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleInstall} className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Install Now
          </Button>
          <Button variant="outline" onClick={onClose}>
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;
