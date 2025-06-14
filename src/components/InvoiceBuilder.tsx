
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ArrowLeft, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InvoiceHeader } from "./invoice/InvoiceHeader";
import { CustomerDetails } from "./invoice/CustomerDetails";
import { InvoiceSummary } from "./invoice/InvoiceSummary";

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
  
  // Form states
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [customColorCode, setCustomColorCode] = useState<string>('');
  const [selectedVolume, setSelectedVolume] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [rate, setRate] = useState<number>(0);

  const generateInvoiceNumber = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    const datePrefix = `${day}${month}${year}`;
    
    const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const todayInvoices = existingInvoices.filter((inv: any) => 
      inv.invoiceNumber.startsWith(datePrefix)
    );
    
    const sequenceNumber = String(todayInvoices.length + 1).padStart(3, '0');
    return `${datePrefix}${sequenceNumber}`;
  };

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: generateInvoiceNumber(),
    date: new Date().toISOString().split('T')[0],
    customerDetails: { name: '', phone: '', address: '' },
    items: [] as InvoiceItem[],
    notes: ''
  });

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const handleAddItem = () => {
    if (!selectedProduct || !quantity || quantity <= 0 || !rate || rate <= 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields with valid values",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const finalColorCode = customColorCode || selectedColor;
    
    const newItem: InvoiceItem = {
      id: `item_${Date.now()}`,
      productName: product.name,
      colorCode: finalColorCode,
      volume: selectedVolume,
      finalName: `${product.name} ${finalColorCode} ${selectedVolume}`.trim(),
      quantity,
      rate,
      total: quantity * rate,
      unit: product.unit,
    };

    setInvoiceData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    
    // Reset form
    setSelectedProduct('');
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
          ? { 
              ...item, 
              [field]: value, 
              total: field === 'quantity' || field === 'rate' 
                ? (field === 'quantity' ? value : item.quantity) * (field === 'rate' ? value : item.rate) 
                : item.total 
            }
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
    const tax = gstEnabled ? subtotal * 0.18 : 0;
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create Invoice</h1>
              <p className="text-gray-600">Invoice #{invoiceData.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSaveInvoice('draft')}>
              Save Draft
            </Button>
            <Button onClick={() => handleSaveInvoice('sent')}>
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Invoice Header */}
        <InvoiceHeader
          invoiceNumber={invoiceData.invoiceNumber}
          date={invoiceData.date}
          gstEnabled={gstEnabled}
          onInvoiceNumberChange={(value) => setInvoiceData(prev => ({ ...prev, invoiceNumber: value }))}
          onDateChange={(value) => setInvoiceData(prev => ({ ...prev, date: value }))}
          onGstToggle={setGstEnabled}
        />

        {/* Customer Details */}
        <CustomerDetails
          customerDetails={invoiceData.customerDetails}
          onCustomerChange={(field, value) => 
            setInvoiceData(prev => ({
              ...prev,
              customerDetails: { ...prev.customerDetails, [field]: value }
            }))
          }
        />

        {/* Items Section */}
        <Card>
          <CardHeader>
            <CardTitle>Add Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Item Form */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Product *</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
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

              <div>
                <Label>Quantity * ({selectedProductData?.unit || 'unit'})</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                />
              </div>

              <div>
                <Label>Rate *</Label>
                <Input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label>Total</Label>
                <div className="flex items-center h-10 px-3 py-2 border bg-gray-50 rounded-md">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {(quantity * rate).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Color and Volume Options */}
            {selectedProductData?.hasVariableColors && (
              <div className="grid grid-cols-2 gap-4">
                {selectedProductData.predefinedColors && selectedProductData.predefinedColors.length > 0 && (
                  <div>
                    <Label>Predefined Color</Label>
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
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
                  <Label>Custom Color Code</Label>
                  <Input
                    value={customColorCode}
                    onChange={(e) => setCustomColorCode(e.target.value)}
                    placeholder="Enter custom color"
                  />
                </div>
              </div>
            )}

            {selectedProductData?.volumes && selectedProductData.volumes.length > 0 && (
              <div>
                <Label>Volume</Label>
                <Select value={selectedVolume} onValueChange={setSelectedVolume}>
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

            <Button onClick={handleAddItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>

            {/* Items List */}
            {invoiceData.items.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Items Added:</h4>
                <div className="space-y-2">
                  {invoiceData.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                        <span className="font-medium">{item.finalName}</span>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleUpdateItem(item.id, 'rate', Number(e.target.value))}
                          className="w-24"
                        />
                        <span className="flex items-center font-medium">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          {item.total.toFixed(2)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Summary */}
        <InvoiceSummary
          subtotal={subtotal}
          tax={tax}
          total={total}
          gstEnabled={gstEnabled}
        />

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
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
      </div>
    </div>
  );
};

export default InvoiceBuilder;
