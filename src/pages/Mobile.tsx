
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, Send, Save, Wifi, WifiOff } from "lucide-react";

interface InvoiceItem {
  id: string;
  productName: string;
  colorCode: string;
  volume: string;
  finalName: string;
  quantity: number;
  rate: number;
  total: number;
}

interface MobileInvoice {
  id: string;
  customerDetails: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  gstEnabled: boolean;
  notes: string;
  status: 'draft' | 'sending' | 'sent' | 'printed' | 'failed';
}

const Mobile = () => {
  const [invoice, setInvoice] = useState<MobileInvoice>({
    id: '',
    customerDetails: {
      name: '',
      phone: '',
      address: '',
      email: ''
    },
    items: [{
      id: '1',
      productName: '',
      colorCode: '',
      volume: '',
      finalName: '',
      quantity: 1,
      rate: 0,
      total: 0
    }],
    subtotal: 0,
    tax: 0,
    total: 0,
    gstEnabled: true,
    notes: '',
    status: 'draft'
  });

  const [isOnline, setIsOnline] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();

  // Check connection status every 3 seconds
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          timeout: 2000 
        } as any);
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 3000);
    return () => clearInterval(interval);
  }, []);

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('mobileDraft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setInvoice(parsedDraft);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (invoice.customerDetails.name || invoice.items.some(item => item.productName)) {
      localStorage.setItem('mobileDraft', JSON.stringify(invoice));
    }
  }, [invoice]);

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
    const tax = invoice.gstEnabled ? subtotal * 0.18 : 0;
    const total = subtotal + tax;

    setInvoice(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [invoice.items, invoice.gstEnabled]);

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].rate;
    }
    
    if (field === 'productName' || field === 'colorCode' || field === 'volume') {
      const { productName, colorCode, volume } = updatedItems[index];
      updatedItems[index].finalName = `${productName} ${colorCode} ${volume}`.trim();
    }

    setInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productName: '',
      colorCode: '',
      volume: '',
      finalName: '',
      quantity: 1,
      rate: 0,
      total: 0
    };
    setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (index: number) => {
    if (invoice.items.length > 1) {
      const updatedItems = invoice.items.filter((_, i) => i !== index);
      setInvoice(prev => ({ ...prev, items: updatedItems }));
    }
  };

  const saveDraft = () => {
    localStorage.setItem('mobileDraft', JSON.stringify(invoice));
    toast({
      title: "Draft Saved",
      description: "Invoice saved locally on device",
    });
  };

  const submitInvoice = async () => {
    if (!invoice.customerDetails.name || !invoice.customerDetails.phone) {
      toast({
        title: "Validation Error",
        description: "Customer name and phone are required",
        variant: "destructive"
      });
      return;
    }

    if (invoice.items.some(item => !item.productName || item.quantity <= 0 || item.rate <= 0)) {
      toast({
        title: "Validation Error", 
        description: "All items must have valid product name, quantity and rate",
        variant: "destructive"
      });
      return;
    }

    if (!isOnline) {
      toast({
        title: "Connection Error",
        description: "No connection to PC. Invoice saved as draft.",
        variant: "destructive"
      });
      saveDraft();
      return;
    }

    setIsSubmitting(true);
    setInvoice(prev => ({ ...prev, status: 'sending' }));

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...invoice,
          id: Date.now().toString(),
          date: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setInvoice(prev => ({ ...prev, status: 'sent', id: result.invoiceId }));
        
        // Poll for print status
        setTimeout(() => pollPrintStatus(result.invoiceId), 1000);
        
        toast({
          title: "Invoice Sent",
          description: `Invoice ${result.invoiceNumber} submitted to PC`,
        });
        
        // Clear draft
        localStorage.removeItem('mobileDraft');
        
      } else {
        throw new Error('Failed to submit invoice');
      }
    } catch (error) {
      setInvoice(prev => ({ ...prev, status: 'failed' }));
      toast({
        title: "Submission Failed",
        description: "Failed to send invoice to PC. Saved as draft.",
        variant: "destructive"
      });
      saveDraft();
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollPrintStatus = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/status/${invoiceId}`);
      if (response.ok) {
        const status = await response.json();
        if (status.printed) {
          setInvoice(prev => ({ ...prev, status: 'printed' }));
          toast({
            title: "Invoice Printed",
            description: `Invoice ${status.invoiceNumber} printed successfully`,
          });
          setLastSyncTime(new Date());
        } else {
          // Continue polling
          setTimeout(() => pollPrintStatus(invoiceId), 2000);
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  const resetForm = () => {
    setInvoice({
      id: '',
      customerDetails: { name: '', phone: '', address: '', email: '' },
      items: [{
        id: '1',
        productName: '',
        colorCode: '',
        volume: '',
        finalName: '',
        quantity: 1,
        rate: 0,
        total: 0
      }],
      subtotal: 0,
      tax: 0,
      total: 0,
      gstEnabled: true,
      notes: '',
      status: 'draft'
    });
    localStorage.removeItem('mobileDraft');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mobile Invoice
              </CardTitle>
              <div className="flex items-center gap-2">
                {isOnline ? 
                  <Wifi className="h-5 w-5 text-green-600" /> : 
                  <WifiOff className="h-5 w-5 text-red-600" />
                }
                <span className="text-xs text-gray-500">
                  {isOnline ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>
            {lastSyncTime && (
              <p className="text-xs text-gray-500">
                Last sync: {lastSyncTime.toLocaleTimeString()}
              </p>
            )}
          </CardHeader>
        </Card>

        {/* Customer Details */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerName" className="text-base">Name *</Label>
              <Input
                id="customerName"
                value={invoice.customerDetails.name}
                onChange={(e) => setInvoice(prev => ({
                  ...prev,
                  customerDetails: { ...prev.customerDetails, name: e.target.value }
                }))}
                className="h-12 text-base"
                placeholder="Customer name"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone" className="text-base">Phone *</Label>
              <Input
                id="customerPhone"
                value={invoice.customerDetails.phone}
                onChange={(e) => setInvoice(prev => ({
                  ...prev,
                  customerDetails: { ...prev.customerDetails, phone: e.target.value }
                }))}
                className="h-12 text-base"
                placeholder="Phone number"
                type="tel"
              />
            </div>
            <div>
              <Label htmlFor="customerAddress" className="text-base">Address</Label>
              <Textarea
                id="customerAddress"
                value={invoice.customerDetails.address}
                onChange={(e) => setInvoice(prev => ({
                  ...prev,
                  customerDetails: { ...prev.customerDetails, address: e.target.value }
                }))}
                className="min-h-20 text-base"
                placeholder="Customer address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Items</CardTitle>
              <Button onClick={addItem} size="sm" className="h-10 w-10 p-0">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoice.items.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Item {index + 1}</span>
                  {invoice.items.length > 1 && (
                    <Button 
                      onClick={() => removeItem(index)} 
                      variant="destructive" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div>
                  <Label className="text-base">Product Name</Label>
                  <Input
                    value={item.productName}
                    onChange={(e) => updateItem(index, 'productName', e.target.value)}
                    className="h-12 text-base"
                    placeholder="Product name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-base">Color</Label>
                    <Input
                      value={item.colorCode}
                      onChange={(e) => updateItem(index, 'colorCode', e.target.value)}
                      className="h-12 text-base"
                      placeholder="Color"
                    />
                  </div>
                  <div>
                    <Label className="text-base">Volume</Label>
                    <Input
                      value={item.volume}
                      onChange={(e) => updateItem(index, 'volume', e.target.value)}
                      className="h-12 text-base"
                      placeholder="Volume"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-base">Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="h-12 text-base"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label className="text-base">Rate (₹)</Label>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      className="h-12 text-base"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-base font-medium">Total: ₹{item.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-3 text-base">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.gstEnabled && (
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>₹{invoice.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total:</span>
                <span>₹{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={invoice.notes}
              onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-20 text-base"
              placeholder="Additional notes..."
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3 pb-6">
          <Button
            onClick={submitInvoice}
            disabled={isSubmitting}
            className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Invoice to PC
              </span>
            )}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={saveDraft}
              variant="outline"
              className="h-12 text-base"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              className="h-12 text-base"
            >
              Reset Form
            </Button>
          </div>
        </div>

        {/* Status Display */}
        {invoice.status !== 'draft' && (
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  invoice.status === 'sending' ? 'bg-yellow-100 text-yellow-800' :
                  invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  invoice.status === 'printed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {invoice.status === 'sending' && <div className="w-3 h-3 border border-yellow-600 border-t-transparent rounded-full animate-spin" />}
                  Status: {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </div>
                {invoice.id && (
                  <p className="text-xs text-gray-500 mt-2">
                    Invoice ID: {invoice.id}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Mobile;
