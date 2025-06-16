import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Store, Printer } from "lucide-react";

interface StoreSettingsData {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  website: string;
  printerType: 'normal' | 'thermal';
  thermalSettings: {
    paperWidth: string;
    fontSize: string;
    autoCut: boolean;
    compactMode: boolean;
  };
  printSettings: {
    includeLogo: boolean;
    includeQR: boolean;
    autoPrint: boolean;
  };
}

const StoreSettings = () => {
  const [formData, setFormData] = useState<StoreSettingsData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    website: '',
    printerType: 'normal',
    thermalSettings: {
      paperWidth: '80mm',
      fontSize: 'medium',
      autoCut: false,
      compactMode: false,
    },
    printSettings: {
      includeLogo: false,
      includeQR: false,
      autoPrint: false,
    },
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedSettings = localStorage.getItem('storeSettings');
    if (savedSettings) {
      setFormData(JSON.parse(savedSettings));
    }
  }, []);

  const generateThermalPrintCSS = () => {
    return `
      @media print {
        @page {
          size: 80mm auto;
          margin: 2mm;
        }
        
        * {
          font-family: 'Courier New', monospace !important;
          font-size: 12px !important;
          line-height: 1.2 !important;
          color: black !important;
          background: white !important;
        }
        
        body {
          width: 76mm;
          margin: 0;
          padding: 2mm;
        }
        
        .thermal-header {
          text-align: center;
          border-bottom: 1px dashed black;
          padding-bottom: 2mm;
          margin-bottom: 2mm;
        }
        
        .thermal-header h1 {
          font-size: 14px !important;
          font-weight: bold;
          margin: 0 0 1mm 0;
        }
        
        .thermal-header p {
          font-size: 10px !important;
          margin: 0;
        }
        
        .thermal-section {
          margin: 2mm 0;
          padding: 1mm 0;
        }
        
        .thermal-row {
          display: flex;
          justify-content: space-between;
          margin: 1mm 0;
        }
        
        .thermal-item {
          border-bottom: 1px dotted black;
          padding: 1mm 0;
        }
        
        .thermal-total {
          border-top: 1px dashed black;
          border-bottom: 1px dashed black;
          padding: 2mm 0;
          margin: 2mm 0;
          font-weight: bold;
        }
        
        .thermal-footer {
          text-align: center;
          border-top: 1px dashed black;
          padding-top: 2mm;
          margin-top: 2mm;
          font-size: 10px !important;
        }
        
        .hide-on-thermal {
          display: none !important;
        }
      }
    `;
  };

  const testThermalPrint = () => {
    const thermalContent = `
      <html>
        <head>
          <title>Thermal Printer Test</title>
          <style>
            ${generateThermalPrintCSS()}
          </style>
        </head>
        <body>
          <div class="thermal-header">
            <h1>Jai Mata Di Saintary & Hardware Store</h1>
            <p>Test Print - ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="thermal-section">
            <div class="thermal-row">
              <span>Item:</span>
              <span>Test Product</span>
            </div>
            <div class="thermal-row">
              <span>Qty:</span>
              <span>1</span>
            </div>
            <div class="thermal-row">
              <span>Rate:</span>
              <span>Rs. 100.00</span>
            </div>
          </div>
          
          <div class="thermal-total">
            <div class="thermal-row">
              <span>TOTAL:</span>
              <span>Rs. 100.00</span>
            </div>
          </div>
          
          <div class="thermal-footer">
            <p>Thank you for your business!</p>
            <p>Thermal Printer Test Successful</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(thermalContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSave = () => {
    localStorage.setItem('storeSettings', JSON.stringify(formData));
    toast({
      title: "Settings Saved",
      description: "Store settings have been successfully saved!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Store className="h-6 w-6 text-gray-500" />
        <h2 className="text-2xl font-bold">Store Settings</h2>
      </div>

      {/* Basic Store Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Update your store details for invoices and customer communications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Store Name</Label>
              <Input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="website">Website URL</Label>
              <Input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Store Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full store address"
            />
          </div>

          <div>
            <Label htmlFor="taxId">GST/Tax ID</Label>
            <Input
              type="text"
              id="taxId"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Printer Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Printer Configuration
          </CardTitle>
          <CardDescription>
            Configure your printing preferences for invoices and receipts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Printer Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Default Printer Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`cursor-pointer transition-all ${formData.printerType === 'normal' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                <CardContent className="p-4" onClick={() => setFormData(prev => ({ ...prev, printerType: 'normal' }))}>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="printerType"
                      value="normal"
                      checked={formData.printerType === 'normal'}
                      onChange={(e) => setFormData(prev => ({ ...prev, printerType: e.target.value as 'normal' | 'thermal' }))}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div>
                      <h3 className="font-semibold">Normal Printer (A4/Letter)</h3>
                      <p className="text-sm text-gray-600">Standard desktop/office printers</p>
                      <p className="text-xs text-gray-500">Best for detailed invoices with logos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-all ${formData.printerType === 'thermal' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                <CardContent className="p-4" onClick={() => setFormData(prev => ({ ...prev, printerType: 'thermal' }))}>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="printerType"
                      value="thermal"
                      checked={formData.printerType === 'thermal'}
                      onChange={(e) => setFormData(prev => ({ ...prev, printerType: e.target.value as 'normal' | 'thermal' }))}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div>
                      <h3 className="font-semibold">Thermal Printer (80mm)</h3>
                      <p className="text-sm text-gray-600">Receipt/POS thermal printers</p>
                      <p className="text-xs text-gray-500">Compact receipts, faster printing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Thermal Printer Settings */}
          {formData.printerType === 'thermal' && (
            <div className="space-y-4 p-4 bg-orange-50 rounded-lg border">
              <h4 className="font-semibold text-orange-800">Thermal Printer Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paperWidth">Paper Width</Label>
                  <Select value={formData.thermalSettings.paperWidth} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, thermalSettings: { ...prev.thermalSettings, paperWidth: value } }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="80mm">80mm (Standard)</SelectItem>
                      <SelectItem value="58mm">58mm (Compact)</SelectItem>
                      <SelectItem value="110mm">110mm (Wide)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select value={formData.thermalSettings.fontSize} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, thermalSettings: { ...prev.thermalSettings, fontSize: value } }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (10px)</SelectItem>
                      <SelectItem value="medium">Medium (12px)</SelectItem>
                      <SelectItem value="large">Large (14px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoCut"
                  checked={formData.thermalSettings.autoCut}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    thermalSettings: { ...prev.thermalSettings, autoCut: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600"
                />
                <Label htmlFor="autoCut">Enable Auto-Cut (if supported)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="compactMode"
                  checked={formData.thermalSettings.compactMode}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    thermalSettings: { ...prev.thermalSettings, compactMode: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600"
                />
                <Label htmlFor="compactMode">Compact Mode (Reduced spacing)</Label>
              </div>

              <Button 
                onClick={testThermalPrint} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <Printer className="h-4 w-4 mr-2" />
                Test Thermal Print
              </Button>
            </div>
          )}

          {/* Print Options */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Print Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="printLogo"
                  checked={formData.printSettings.includeLogo}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    printSettings: { ...prev.printSettings, includeLogo: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600"
                />
                <Label htmlFor="printLogo">Include Store Logo</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="printQR"
                  checked={formData.printSettings.includeQR}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    printSettings: { ...prev.printSettings, includeQR: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600"
                />
                <Label htmlFor="printQR">Include QR Code for Digital Receipt</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoPrint"
                  checked={formData.printSettings.autoPrint}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    printSettings: { ...prev.printSettings, autoPrint: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600"
                />
                <Label htmlFor="autoPrint">Auto-print after creating invoice</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
        Save Settings
      </Button>
    </div>
  );
};

export default StoreSettings;
