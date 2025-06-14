import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, ArrowLeft, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  basePrice?: number;
  hasVariableColors: boolean;
  predefinedColors?: string[];
  volumes?: string[];
  unit: 'liters' | 'kg' | 'pieces';
}

interface InvoiceItem {
  id: string;
  productName: string;
  colorCode: string;
  volume: string;
  finalName: string;
  quantity: number;
  rate: number;
  total: number;
  unit: string;
}

interface InvoiceBuilderProps {
  onClose: () => void;
}

const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [gstEnabled, setGstEnabled] = useState<boolean>(false);
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [customColorCode, setCustomColorCode] = useState<string>('');
  const [selectedVolume, setSelectedVolume] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [rate, setRate] = useState<number>(0);

  // Generate invoice number in ddmmyy + 3-digit sequence format
  const generateInvoiceNumber = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    const datePrefix = `${day}${month}${year}`;
    
    // Get existing invoices for today
    const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const todayInvoices = existingInvoices.filter((inv: any) => 
      inv.invoiceNumber.startsWith(datePrefix)
    );
    
    const sequenceNumber = String(todayInvoices.length + 1).padStart(3, '0');
    return `${datePrefix}${sequenceNumber}`;
  };

  useEffect(() => {
    // Load products from local storage
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: generateInvoiceNumber(),
    date: new Date().toISOString().split('T')[0],
    customerDetails: {
      name: '',
      phone: '',
      address: ''
    },
    items: [] as InvoiceItem[],
    notes: ''
  });

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      });
      return;
    }

    if (!quantity || quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!rate || rate <= 0) {
      toast({
        title: "Error",
        description: "Rate must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    // Use custom color code if provided, otherwise use selected predefined color
    const finalColorCode = customColorCode || selectedColor;
    
    const newItem: InvoiceItem = {
      id: `item_${Date.now()}`,
      productName: product.name,
      colorCode: finalColorCode,
      volume: selectedVolume,
      finalName: `${product.name} ${finalColorCode} ${selectedVolume}`.trim(),
      quantity: quantity,
      rate: rate,
      total: quantity * rate,
      unit: product.unit,
    };

    setInvoiceData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setSelectedProduct(null);
    setSelectedColor('');
    setCustomColorCode('');
    setSelectedVolume('');
    setQuantity(1);
    setRate(0);
  };

  const handleUpdateItem = (itemId: string, field: string, value: any) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, [field]: value, total: field === 'quantity' || field === 'rate' ? (field === 'quantity' ? value : item.quantity) * (field === 'rate' ? value : item.rate) : item.total }
          : item
      ),
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };

  const calculateTotals = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = gstEnabled ? subtotal * 0.18 : 0; // 18% GST only if enabled
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSaveInvoice = (status: 'draft' | 'sent' | 'paid' = 'draft') => {
    if (!invoiceData.customerDetails.name.trim()) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      return;
    }

    if (invoiceData.items.length === 0) {
      toast({
        title: "Error",
        description: "At least one item is required",
        variant: "destructive",
      });
      return;
    }

    const { subtotal, tax, total } = calculateTotals();
    
    const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const storeInfo = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    
    const newInvoice = {
      id: `inv_${Date.now()}`,
      ...invoiceData,
      storeInfo,
      subtotal,
      tax,
      total,
      gstEnabled,
      status
    };
    
    savedInvoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(savedInvoices));
    
    toast({
      title: "Success",
      description: `Invoice ${status === 'draft' ? 'saved as draft' : 'created'} successfully!`,
    });
    
    onClose();
  };

  const { subtotal, tax, total } = calculateTotals();
  const selectedProductData = products.find(p => p.id === selectedProduct);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create Invoice</h1>
              <p className="text-muted-foreground">Build your invoice step by step</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSaveInvoice('draft')}>
              Save as Draft
            </Button>
            <Button onClick={() => handleSaveInvoice('sent')}>
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Invoice Header */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={invoiceData.date}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="gst-enabled"
                checked={gstEnabled}
                onCheckedChange={setGstEnabled}
              />
              <Label htmlFor="gst-enabled">Enable GST</Label>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={invoiceData.customerDetails.name}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    customerDetails: { ...prev.customerDetails, name: e.target.value }
                  }))}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  value={invoiceData.customerDetails.phone}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    customerDetails: { ...prev.customerDetails, phone: e.target.value }
                  }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="customerAddress">Address</Label>
              <Input
                id="customerAddress"
                value={invoiceData.customerDetails.address}
                onChange={(e) => setInvoiceData(prev => ({
                  ...prev,
                  customerDetails: { ...prev.customerDetails, address: e.target.value }
                }))}
                placeholder="Enter address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Items Section */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Item Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product">Product</Label>
                <Select onValueChange={(value) => setSelectedProduct(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProductData?.hasVariableColors && (
                <>
                  {selectedProductData.predefinedColors && selectedProductData.predefinedColors.length > 0 && (
                    <div>
                      <Label htmlFor="color">Predefined Color</Label>
                      <Select onValueChange={setSelectedColor} value={selectedColor}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select predefined color" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedProductData.predefinedColors.map((color, index) => (
                            <SelectItem key={index} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="customColor">Custom Color Code</Label>
                    <Input
                      id="customColor"
                      value={customColorCode}
                      onChange={(e) => setCustomColorCode(e.target.value)}
                      placeholder="Enter custom color code"
                    />
                  </div>
                </>
              )}

              {selectedProductData?.volumes && selectedProductData.volumes.length > 0 && (
                <div>
                  <Label htmlFor="volume">Volume</Label>
                  <Select onValueChange={setSelectedVolume}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select volume" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProductData.volumes.map((volume, index) => (
                        <SelectItem key={index} value={volume}>
                          {volume}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Quantity, Rate, and Total */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity {selectedProductData && `(${selectedProductData.unit})`}</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <Label htmlFor="rate">Rate per {selectedProductData?.unit || 'unit'}</Label>
                <Input
                  id="rate"
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  placeholder="Enter rate"
                />
              </div>
              <div>
                <Label>Total</Label>
                <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {(quantity * rate).toFixed(2)}
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Display Items */}
            {invoiceData.items.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-lg font-semibold">Items:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoiceData.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.finalName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                              className="w-20"
                            />
                            <span className="text-xs text-gray-500 ml-1">{item.unit}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Input
                              type="number"
                              value={item.rate}
                              onChange={(e) => handleUpdateItem(item.id, 'rate', Number(e.target.value))}
                              className="w-20"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="flex items-center">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              {item.total.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="flex items-center">
                  <IndianRupee className="h-4 w-4" />
                  {subtotal.toFixed(2)}
                </span>
              </div>
              {gstEnabled && (
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span className="flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {tax.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="flex items-center">
                  <IndianRupee className="h-4 w-4" />
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={invoiceData.notes}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes or terms..."
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSaveInvoice('draft')}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSaveInvoice('sent')}>
            Create Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBuilder;
