import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
}

interface InvoiceBuilderProps {
  onClose: () => void;
}

const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedVolume, setSelectedVolume] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [rate, setRate] = useState<number>(0);

  useEffect(() => {
    // Load products from local storage
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    customerDetails: {
      name: '',
      email: '',
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

    const newItem: InvoiceItem = {
      id: `item_${Date.now()}`,
      productName: product.name,
      colorCode: selectedColor,
      volume: selectedVolume,
      finalName: `${product.name} ${selectedColor} ${selectedVolume}`.trim(),
      quantity: quantity,
      rate: rate,
      total: quantity * rate,
    };

    setInvoiceData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setSelectedProduct(null);
    setSelectedColor('');
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
    const tax = subtotal * 0.18; // 18% GST
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={invoiceData.customerDetails.email}
                  onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    customerDetails: { ...prev.customerDetails, email: e.target.value }
                  }))}
                  placeholder="Enter email address"
                />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {selectedProduct && products.find(p => p.id === selectedProduct)?.hasVariableColors && (
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select onValueChange={setSelectedColor}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.find(p => p.id === selectedProduct)?.predefinedColors?.map((color, index) => (
                        <SelectItem key={index} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedProduct && products.find(p => p.id === selectedProduct)?.volumes && (
                <div>
                  <Label htmlFor="volume">Volume</Label>
                  <Select onValueChange={setSelectedVolume}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select volume" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.find(p => p.id === selectedProduct)?.volumes?.map((volume, index) => (
                        <SelectItem key={index} value={volume}>
                          {volume}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Quantity and Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <Label htmlFor="rate">Rate</Label>
                <Input
                  id="rate"
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  placeholder="Enter rate"
                />
              </div>
            </div>

            <Button onClick={handleAddItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>

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
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span className="flex items-center">
                  <IndianRupee className="h-4 w-4" />
                  {tax.toFixed(2)}
                </span>
              </div>
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
