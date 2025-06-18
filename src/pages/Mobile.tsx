
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, Send, Save, Wifi, WifiOff, Trash2, IndianRupee } from "lucide-react";

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
  invoiceNumber: string;
  customerDetails: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
  storeInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
    website: string;
    logo?: string;
    paymentQR?: string;
  };
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'unpaid';
  notes: string;
  watermarkId: string;
  gstEnabled: boolean;
  submitStatus: 'draft' | 'sending' | 'sent' | 'printed' | 'failed';
}

const Mobile = () => {
  const [invoice, setInvoice] = useState<MobileInvoice>({
    id: '',
    invoiceNumber: '',
    customerDetails: {
      name: '',
      phone: '',
      address: '',
      email: ''
    },
    storeInfo: {
      name: 'Jai Mata Di Saintary & Hardware Store',
      address: 'Hardware Store Address',
      phone: '+91 12345 67890',
      email: 'store@hardware.com',
      taxId: 'GST123456789',
      website: 'www.hardware.com'
    },
    date: new Date().toISOString().split('T')[0],
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
    status: 'unpaid',
    notes: '',
    watermarkId: '',
    gstEnabled: true,
    submitStatus: 'draft'
  });

  const [products, setProducts] = useState<Array<{name: string, colors: string[], volumes: string[]}>>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState<string>('');
  const { toast } = useToast();

  // Get next invoice number from PC
  const getNextInvoiceNumber = async () => {
    try {
      const response = await fetch('/api/invoices/next-number');
      if (response.ok) {
        const data = await response.json();
        setNextInvoiceNumber(data.nextInvoiceNumber);
      }
    } catch (error) {
      console.error('Failed to get next invoice number:', error);
    }
  };

  // Load products from PC
  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      // Fallback to localStorage
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    }
  };

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        });
        setIsOnline(response.ok);
        if (response.ok) {
          await getNextInvoiceNumber();
          await loadProducts();
        }
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

  // Auto-save draft
  useEffect(() => {
    if (invoice.customerDetails.name || invoice.items.some(item => item.productName)) {
      localStorage.setItem('mobileDraft', JSON.stringify(invoice));
    }
  }, [invoice]);

  // Calculate totals
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

  const createInvoice = async () => {
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
    setInvoice(prev => ({ ...prev, submitStatus: 'sending' }));

    try {
      const completeInvoice = {
        ...invoice,
        id: Date.now().toString(),
        watermarkId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString()
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeInvoice),
      });

      if (response.ok) {
        const result = await response.json();
        setInvoice(prev => ({ 
          ...prev, 
          submitStatus: 'sent', 
          id: result.invoiceId,
          invoiceNumber: result.invoiceNumber 
        }));
        
        setTimeout(() => pollPrintStatus(result.invoiceId), 1000);
        
        toast({
          title: "Invoice Created",
          description: `Invoice ${result.invoiceNumber} submitted to PC`,
        });
        
        localStorage.removeItem('mobileDraft');
        await getNextInvoiceNumber(); // Refresh next invoice number
        
      } else {
        throw new Error('Failed to submit invoice');
      }
    } catch (error) {
      setInvoice(prev => ({ ...prev, submitStatus: 'failed' }));
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
          setInvoice(prev => ({ ...prev, submitStatus: 'printed' }));
          toast({
            title: "Invoice Printed",
            description: `Invoice ${status.invoiceNumber} printed successfully`,
          });
        } else {
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
      invoiceNumber: '',
      customerDetails: { name: '', phone: '', address: '', email: '' },
      storeInfo: {
        name: 'Jai Mata Di Saintary & Hardware Store',
        address: 'Hardware Store Address',
        phone: '+91 12345 67890',
        email: 'store@hardware.com',
        taxId: 'GST123456789',
        website: 'www.hardware.com'
      },
      date: new Date().toISOString().split('T')[0],
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
      status: 'unpaid',
      notes: '',
      watermarkId: '',
      gstEnabled: true,
      submitStatus: 'draft'
    });
    localStorage.removeItem('mobileDraft');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Create Invoice</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {isOnline ? 
                    <Wifi className="h-5 w-5 text-green-600" /> : 
                    <WifiOff className="h-5 w-5 text-red-600" />
                  }
                  <span className="text-sm text-gray-600">
                    {isOnline ? 'Connected to PC' : 'Offline Mode'}
                  </span>
                </div>
                {nextInvoiceNumber && (
                  <div className="text-sm text-gray-600">
                    Next: <span className="font-medium">{nextInvoiceNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={invoice.customerDetails.name}
                    onChange={(e) => setInvoice(prev => ({
                      ...prev,
                      customerDetails: { ...prev.customerDetails, name: e.target.value }
                    }))}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    value={invoice.customerDetails.phone}
                    onChange={(e) => setInvoice(prev => ({
                      ...prev,
                      customerDetails: { ...prev.customerDetails, phone: e.target.value }
                    }))}
                    placeholder="Enter phone number"
                    type="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email Address</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={invoice.customerDetails.email || ''}
                    onChange={(e) => setInvoice(prev => ({
                      ...prev,
                      customerDetails: { ...prev.customerDetails, email: e.target.value }
                    }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="customerAddress">Address</Label>
                  <Textarea
                    id="customerAddress"
                    value={invoice.customerDetails.address}
                    onChange={(e) => setInvoice(prev => ({
                      ...prev,
                      customerDetails: { ...prev.customerDetails, address: e.target.value }
                    }))}
                    placeholder="Enter customer address"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoice.date}
                    onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="gst-toggle">Include GST (18%)</Label>
                  <Switch
                    id="gst-toggle"
                    checked={invoice.gstEnabled}
                    onCheckedChange={(checked) => setInvoice(prev => ({ ...prev, gstEnabled: checked }))}
                  />
                </div>
                <div>
                  <Label>Payment Status</Label>
                  <RadioGroup
                    value={invoice.status}
                    onValueChange={(value: 'paid' | 'unpaid') => 
                      setInvoice(prev => ({ ...prev, status: value }))
                    }
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paid" id="paid" />
                      <Label htmlFor="paid">Paid</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unpaid" id="unpaid" />
                      <Label htmlFor="unpaid">Unpaid</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Invoice Items</CardTitle>
                  <Button onClick={addItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoice.items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Item {index + 1}</span>
                      {invoice.items.length > 1 && (
                        <Button 
                          onClick={() => removeItem(index)} 
                          variant="destructive" 
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label>Product Name *</Label>
                        <Select
                          value={item.productName}
                          onValueChange={(value) => updateItem(index, 'productName', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select or enter product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product, i) => (
                              <SelectItem key={i} value={product.name}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Color Code</Label>
                          <Select
                            value={item.colorCode}
                            onValueChange={(value) => updateItem(index, 'colorCode', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Color" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.find(p => p.name === item.productName)?.colors.map((color, i) => (
                                <SelectItem key={i} value={color}>
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Volume</Label>
                          <Select
                            value={item.volume}
                            onValueChange={(value) => updateItem(index, 'volume', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Volume" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.find(p => p.name === item.productName)?.volumes.map((volume, i) => (
                                <SelectItem key={i} value={volume}>
                                  {volume}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            min="1"
                          />
                        </div>
                        <div>
                          <Label>Rate (₹) *</Label>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded flex justify-between items-center">
                        <span>Total:</span>
                        <span className="font-medium flex items-center">
                          <IndianRupee className="h-4 w-4" />
                          {item.total.toFixed(2)}
                        </span>
                      </div>
                      
                      {item.finalName && (
                        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                          <span className="text-sm text-blue-800 font-medium">
                            Final Name: {item.finalName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Invoice Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {invoice.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {invoice.gstEnabled && (
                    <div className="flex justify-between">
                      <span>GST (18%):</span>
                      <span className="flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {invoice.tax.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Total:</span>
                    <span className="flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {invoice.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={invoice.notes}
              onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes or terms..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={createInvoice}
            disabled={isSubmitting}
            className="flex-1"
            size="lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Invoice...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Create Invoice
              </span>
            )}
          </Button>
          
          <Button onClick={saveDraft} variant="outline" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          
          <Button onClick={resetForm} variant="outline" size="lg">
            Reset
          </Button>
        </div>

        {/* Status Display */}
        {invoice.submitStatus !== 'draft' && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  invoice.submitStatus === 'sending' ? 'bg-yellow-100 text-yellow-800' :
                  invoice.submitStatus === 'sent' ? 'bg-blue-100 text-blue-800' :
                  invoice.submitStatus === 'printed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {invoice.submitStatus === 'sending' && <div className="w-3 h-3 border border-yellow-600 border-t-transparent rounded-full animate-spin" />}
                  Status: {invoice.submitStatus.charAt(0).toUpperCase() + invoice.submitStatus.slice(1)}
                </div>
                {invoice.invoiceNumber && (
                  <p className="text-sm text-gray-600 mt-2 font-medium">
                    Invoice Number: {invoice.invoiceNumber}
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
