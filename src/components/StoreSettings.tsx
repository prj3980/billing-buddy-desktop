
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Store, Save, Printer, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DesktopGuide from "./DesktopGuide";

interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  website: string;
}

interface PrinterSettings {
  defaultPrinter: 'normal' | 'thermal';
  normalPrinterName: string;
  thermalPrinterName: string;
  thermalPaperSize: '58mm' | '80mm';
  autoprint: boolean;
  printCopies: number;
}

const StoreSettings = () => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: 'Jai Mata Di Saintary & Hardware Store',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    website: ''
  });

  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>({
    defaultPrinter: 'normal',
    normalPrinterName: '',
    thermalPrinterName: '',
    thermalPaperSize: '80mm',
    autoprint: false,
    printCopies: 1
  });
  
  const { toast } = useToast();

  useEffect(() => {
    const savedSettings = localStorage.getItem('storeSettings');
    if (savedSettings) {
      setStoreInfo(JSON.parse(savedSettings));
    }

    const savedPrinterSettings = localStorage.getItem('printerSettings');
    if (savedPrinterSettings) {
      setPrinterSettings(JSON.parse(savedPrinterSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('storeSettings', JSON.stringify(storeInfo));
    localStorage.setItem('printerSettings', JSON.stringify(printerSettings));
    toast({
      title: "Success",
      description: "Settings saved successfully!",
    });
  };

  const handleInputChange = (field: keyof StoreInfo, value: string) => {
    setStoreInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePrinterChange = (field: keyof PrinterSettings, value: any) => {
    setPrinterSettings(prev => ({ ...prev, [field]: value }));
  };

  const testPrint = (printerType: 'normal' | 'thermal') => {
    const testContent = `
      <html>
        <head>
          <title>Test Print - ${printerType === 'thermal' ? 'Thermal' : 'Normal'}</title>
          <style>
            body { 
              font-family: ${printerType === 'thermal' ? 'monospace' : 'Arial, sans-serif'}; 
              margin: ${printerType === 'thermal' ? '5px' : '20px'};
              font-size: ${printerType === 'thermal' ? '12px' : '14px'};
              ${printerType === 'thermal' ? 'width: ' + (printerSettings.thermalPaperSize === '58mm' ? '58mm' : '80mm') : ''};
            }
            .header { text-align: center; font-weight: bold; margin-bottom: 10px; }
            .line { border-bottom: 1px dashed #000; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="header">${storeInfo.name || 'Jai Mata Di Saintary & Hardware Store'}</div>
          <div class="header">TEST PRINT - ${printerType.toUpperCase()}</div>
          <div class="line"></div>
          <p>Date: ${new Date().toLocaleDateString('en-IN')}</p>
          <p>Time: ${new Date().toLocaleTimeString('en-IN')}</p>
          <p>Printer Type: ${printerType === 'thermal' ? 'Thermal Printer' : 'Normal Printer'}</p>
          ${printerType === 'thermal' ? `<p>Paper Size: ${printerSettings.thermalPaperSize}</p>` : ''}
          <div class="line"></div>
          <p style="text-align: center;">Print Test Successful!</p>
          <div class="line"></div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(testContent);
      printWindow.document.close();
      printWindow.print();
    }
    
    toast({
      title: "Test Print Sent",
      description: `Test print sent to ${printerType} printer`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your store information and application settings</p>
      </div>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="store">Store Information</TabsTrigger>
          <TabsTrigger value="printing">Printing Settings</TabsTrigger>
          <TabsTrigger value="desktop">Desktop Installation</TabsTrigger>
          <TabsTrigger value="display">Display Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
              <CardDescription>
                This information will appear on your invoices and documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storeName">Store Name *</Label>
                  <Input
                    id="storeName"
                    value={storeInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Jai Mata Di Saintary & Hardware Store"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={storeInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={storeInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Store address"
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={storeInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="store@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="taxId">GST/Tax ID</Label>
                  <Input
                    id="taxId"
                    value={storeInfo.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    placeholder="GST Number"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  value={storeInfo.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourstore.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printing" className="space-y-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="defaultPrinter">Default Printer Type</Label>
                    <Select value={printerSettings.defaultPrinter} onValueChange={(value: 'normal' | 'thermal') => handlePrinterChange('defaultPrinter', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select printer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal Printer (A4)</SelectItem>
                        <SelectItem value="thermal">Thermal Printer (Receipt)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="normalPrinter">Normal Printer Name</Label>
                    <Input
                      id="normalPrinter"
                      value={printerSettings.normalPrinterName}
                      onChange={(e) => handlePrinterChange('normalPrinterName', e.target.value)}
                      placeholder="e.g., HP LaserJet, Canon PIXMA"
                    />
                  </div>

                  <div>
                    <Label htmlFor="thermalPrinter">Thermal Printer Name</Label>
                    <Input
                      id="thermalPrinter"
                      value={printerSettings.thermalPrinterName}
                      onChange={(e) => handlePrinterChange('thermalPrinterName', e.target.value)}
                      placeholder="e.g., EPSON TM-T20, Star TSP650"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="thermalSize">Thermal Paper Size</Label>
                    <Select value={printerSettings.thermalPaperSize} onValueChange={(value: '58mm' | '80mm') => handlePrinterChange('thermalPaperSize', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select paper size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="58mm">58mm (2.25")</SelectItem>
                        <SelectItem value="80mm">80mm (3.15")</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="printCopies">Number of Copies</Label>
                    <Input
                      id="printCopies"
                      type="number"
                      min="1"
                      max="5"
                      value={printerSettings.printCopies}
                      onChange={(e) => handlePrinterChange('printCopies', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoprint"
                      checked={printerSettings.autoprint}
                      onCheckedChange={(checked) => handlePrinterChange('autoprint', checked)}
                    />
                    <Label htmlFor="autoprint">Auto-print after invoice creation</Label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex gap-4">
                  <Button onClick={() => testPrint('normal')} variant="outline">
                    Test Normal Printer
                  </Button>
                  <Button onClick={() => testPrint('thermal')} variant="outline">
                    Test Thermal Printer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="desktop" className="space-y-6">
          <DesktopGuide />
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Display Settings
              </CardTitle>
              <CardDescription>
                Customize the application appearance for desktop use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Desktop Optimized</h3>
                <p className="text-muted-foreground">
                  The application is already optimized for desktop use with:
                </p>
                <ul className="text-sm text-muted-foreground mt-4 space-y-1">
                  <li>• Keyboard shortcuts support</li>
                  <li>• Large screen layouts</li>
                  <li>• Print-friendly interfaces</li>
                  <li>• Offline functionality</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save All Settings
      </Button>
    </div>
  );
};

export default StoreSettings;
