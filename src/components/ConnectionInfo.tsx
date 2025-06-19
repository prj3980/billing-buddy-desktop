
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Wifi, Copy, QrCode, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ConnectionInfo = () => {
  const [localIP, setLocalIP] = useState<string>('192.168.1.100');
  const [mobileUrl, setMobileUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Get current host for mobile URL
    const currentHost = window.location.host;
    const mobileAccessUrl = `${window.location.protocol}//${currentHost}/mobile`;
    setMobileUrl(mobileAccessUrl);

    // Try to detect local IP (simplified for demo)
    detectLocalIP();
  }, []);

  const detectLocalIP = async () => {
    try {
      // This is a simplified IP detection - in real scenario you'd use a proper method
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        setLocalIP(hostname);
      }
    } catch (error) {
      console.log('Could not detect local IP');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      });
    });
  };

  const generateQRCode = () => {
    // For demo purposes, show instructions to generate QR code
    toast({
      title: "QR Code",
      description: "Use any QR code generator with the mobile URL",
    });
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Smartphone className="h-5 w-5" />
          Mobile Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="font-medium text-sm">Mobile URL</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1 break-all">
              {mobileUrl}
            </code>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => copyToClipboard(mobileUrl)}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium text-gray-800">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Ensure mobile device is on same WiFi network</li>
              <li>Open browser on mobile device</li>
              <li>Navigate to the URL above</li>
              <li>Create invoices on mobile - they'll sync to PC</li>
              <li>PC will auto-print and update status</li>
            </ol>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={generateQRCode}
            className="flex-1"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => window.open(mobileUrl, '_blank')}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Test Mobile
          </Button>
        </div>

        <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
          <strong>Note:</strong> For local network access, replace 'localhost' with your PC's IP address (e.g., 192.168.1.100:5173/mobile)
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionInfo;
