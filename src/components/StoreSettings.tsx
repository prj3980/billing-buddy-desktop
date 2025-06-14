
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  taxId: string;
  website: string;
}

const StoreSettings: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: '',
    address: '',
    phone: '',
    taxId: '',
    website: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedStoreInfo = localStorage.getItem('storeSettings');
    if (savedStoreInfo) {
      const parsed = JSON.parse(savedStoreInfo);
      setStoreInfo(parsed);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('storeSettings', JSON.stringify(storeInfo));
    toast({
      title: "Success",
      description: "Store information saved successfully!",
    });
  };

  const handleInputChange = (field: keyof StoreInfo, value: string) => {
    setStoreInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground">Manage your business information for invoices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            This information will appear on all your invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storeName">Business Name *</Label>
              <Input
                id="storeName"
                value={storeInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your Business Name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={storeInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={storeInfo.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="www.yourbusiness.com"
              />
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID / GST Number</Label>
              <Input
                id="taxId"
                value={storeInfo.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="27AAACT2727Q1ZZ"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Business Address</Label>
            <Textarea
              id="address"
              value={storeInfo.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Business St, City, State, PIN"
              rows={3}
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Store Information
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreSettings;
