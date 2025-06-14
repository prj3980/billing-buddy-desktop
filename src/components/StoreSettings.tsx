
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Save, Download } from "lucide-react";
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

const StoreSettings = () => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    website: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    const savedSettings = localStorage.getItem('storeSettings');
    if (savedSettings) {
      setStoreInfo(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('storeSettings', JSON.stringify(storeInfo));
    toast({
      title: "Success",
      description: "Store settings saved successfully!",
    });
  };

  const handleInputChange = (field: keyof StoreInfo, value: string) => {
    setStoreInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your store information and application settings</p>
      </div>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="store">Store Information</TabsTrigger>
          <TabsTrigger value="desktop">Desktop Installation</TabsTrigger>
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
                    placeholder="Your Paint Store Name"
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
              
              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Store Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="desktop" className="space-y-6">
          <DesktopGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreSettings;
