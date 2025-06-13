
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, Save, X, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  basePrice?: number;
  hasVariableColors: boolean;
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

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  website: string;
}

interface InvoiceBuilderProps {
  onClose: () => void;
}

const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    website: ''
  });
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(18); // GST rate for India
  const { toast } = useToast();

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    const savedStoreInfo = localStorage.getItem('storeInfo');
    
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    if (savedStoreInfo) {
      setStoreInfo(JSON.parse(savedStoreInfo));
    }
    
    // Set default due date to 30 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  }, []);

  const addInvoiceItem = () => {
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
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const removeInvoiceItem = (id: string) => {
    const updatedItems = invoiceItems.filter(item => item.id !== id);
    setInvoiceItems(updatedItems);
  };

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = invoiceItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-generate final name when product name, color code, or volume changes
        if (field === 'productName' || field === 'colorCode' || field === 'volume') {
          const parts = [updatedItem.productName, updatedItem.colorCode, updatedItem.volume].filter(Boolean);
          updatedItem.finalName = parts.join(' - ');
        }
        
        // Recalculate total when quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          updatedItem.total = updatedItem.quantity * updatedItem.rate;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setInvoiceItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-4);
    return `INV-${year}${month}-${timestamp}`;
  };

  const handleSaveInvoice = () => {
    if (!customerDetails.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter customer name.",
        variant: "destructive",
      });
      return;
    }

    if (invoiceItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    const invoice = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      customerDetails: customerDetails,
      storeInfo: storeInfo,
      date: invoiceDate,
      dueDate: dueDate,
      items: invoiceItems,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      status: 'draft' as const,
      notes: notes
    };

    const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const updatedInvoices = [...existingInvoices, invoice];
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));

    toast({
      title: "Success",
      description: "Invoice created successfully!",
    });

    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Create Invoice</h1>
          <p className="text-muted-foreground">Build a new invoice for your customer</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Enter customer details for this invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="customerAddress">Address</Label>
                <Textarea
                  id="customerAddress"
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Complete address with pin code"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Set up the basic invoice information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="taxRate">GST Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    placeholder="18"
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Invoice Items</CardTitle>
                  <CardDescription>Add paint products with color codes and volumes</CardDescription>
                </div>
                <Button onClick={addInvoiceItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoiceItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Product Name</Label>
                          <Select
                            value={item.productName}
                            onValueChange={(value) => updateInvoiceItem(item.id, 'productName', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.name}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Color Code</Label>
                          <Input
                            value={item.colorCode}
                            onChange={(e) => updateInvoiceItem(item.id, 'colorCode', e.target.value)}
                            placeholder="e.g., RAL 9010, NCS S 1000-N"
                          />
                        </div>
                        <div>
                          <Label>Volume</Label>
                          <Input
                            value={item.volume}
                            onChange={(e) => updateInvoiceItem(item.id, 'volume', e.target.value)}
                            placeholder="e.g., 1L, 4L, 20L"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Final Product Name</Label>
                        <Input
                          value={item.finalName}
                          onChange={(e) => updateInvoiceItem(item.id, 'finalName', e.target.value)}
                          placeholder="Auto-generated or edit manually"
                          className="font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            min="1"
                          />
                        </div>
                        <div>
                          <Label>Rate (₹)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => updateInvoiceItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label>Total (₹)</Label>
                          <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            {item.total.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeInvoiceItem(item.id)}
                            className="w-full"
                          >
                            <Minus className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {invoiceItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No items added yet. Click "Add Item" to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any additional notes, terms & conditions, or special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Invoice Summary */}
        <div className="space-y-6">
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
                    {calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({taxRate}%):</span>
                  <span className="flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {calculateTax().toFixed(2)}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button onClick={handleSaveInvoice} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBuilder;
