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

  const generateWatermarkId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: generateInvoiceNumber(),
    date: new Date().toISOString().split('T')[0],
    customerDetails: { name: '', phone: '', address: '' },
    items: [] as InvoiceItem[],
    notes: '',
    watermarkId: generateWatermarkId()
  });

  const initializeAsianPaintsProducts = () => {
    const asianPaintsProducts = [
      {
        id: 'ap_royale_luxury',
        name: 'Royale Luxury Emulsion',
        basePrice: 4500,
        hasVariableColors: true,
        predefinedColors: ['White', 'Cream', 'Ivory', 'Pearl White', 'Off White', 'Magnolia'],
        volumes: ['1L', '4L', '10L', '20L'],
        unit: 'liters' as const
      },
      {
        id: 'ap_apex_ultima',
        name: 'Apex Ultima Exterior',
        basePrice: 3800,
        hasVariableColors: true,
        predefinedColors: ['White', 'Cream', 'Light Grey', 'Beige', 'Yellow', 'Blue'],
        volumes: ['1L', '4L', '10L', '20L'],
        unit: 'liters' as const
      },
      {
        id: 'ap_tractor_emulsion',
        name: 'Tractor Emulsion',
        basePrice: 2200,
        hasVariableColors: true,
        predefinedColors: ['White', 'Cream', 'Light Pink', 'Light Blue', 'Light Green'],
        volumes: ['1L', '4L', '10L', '20L'],
        unit: 'liters' as const
      },
      {
        id: 'ap_ace_exterior',
        name: 'Ace Exterior Emulsion',
        basePrice: 2800,
        hasVariableColors: true,
        predefinedColors: ['White', 'Cream', 'Ivory', 'Light Grey', 'Beige'],
        volumes: ['1L', '4L', '10L', '20L'],
        unit: 'liters' as const
      },
      {
        id: 'ap_royale_health',
        name: 'Royale Health Shield',
        basePrice: 5200,
        hasVariableColors: true,
        predefinedColors: ['White', 'Cream', 'Light Pink', 'Light Blue', 'Light Yellow'],
        volumes: ['1L', '4L', '10L'],
        unit: 'liters' as const
      },
      {
        id: 'ap_smart_care',
        name: 'SmartCare Dampshield',
        basePrice: 3200,
        hasVariableColors: true,
        predefinedColors: ['White', 'Cream', 'Off White'],
        volumes: ['1L', '4L', '10L', '20L'],
        unit: 'liters' as const
      },
      {
        id: 'ap_primer',
        name: 'Asian Paints Primer',
        basePrice: 1800,
        hasVariableColors: false,
        predefinedColors: ['White'],
        volumes: ['1L', '4L', '10L', '20L'],
        unit: 'liters' as const
      },
      {
        id: 'ap_wood_finish',
        name: 'Woodtech Wood Finish',
        basePrice: 2600,
        hasVariableColors: true,
        predefinedColors: ['Natural', 'Teak', 'Mahogany', 'Walnut', 'Cherry'],
        volumes: ['500ml', '1L', '4L'],
        unit: 'liters' as const
      }
    ];

    const savedProducts = localStorage.getItem('products');
    const existingProducts = savedProducts ? JSON.parse(savedProducts) : [];
    
    // Add Asian Paints products if they don't exist
    const updatedProducts = [...existingProducts];
    asianPaintsProducts.forEach(newProduct => {
      if (!existingProducts.find((p: Product) => p.id === newProduct.id)) {
        updatedProducts.push(newProduct);
      }
    });
    
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  useEffect(() => {
    initializeAsianPaintsProducts();
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
    
    // Build final name with container information
    let finalName = product.name;
    if (finalColorCode) finalName += ` ${finalColorCode}`;
    if (selectedVolume) finalName += ` ${selectedVolume}`;
    
    const newItem: InvoiceItem = {
      id: `item_${Date.now()}`,
      productName: product.name,
      colorCode: finalColorCode,
      volume: selectedVolume,
      finalName: finalName.trim(),
      quantity, // Number of containers
      rate, // Rate per container (not per unit volume)
      total: quantity * rate, // Total = containers × rate per container
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
      status,
      watermarkId: invoiceData.watermarkId
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onClose} size="lg">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Invoices
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-gray-600">Invoice #{invoiceData.invoiceNumber}</p>
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  ID: {invoiceData.watermarkId}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => handleSaveInvoice('draft')} size="lg">
              Save Draft
            </Button>
            <Button onClick={() => handleSaveInvoice('sent')} size="lg" className="bg-blue-600 hover:bg-blue-700">
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
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Add Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Item Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-semibold">Product *</Label>
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
                <Label className="text-sm font-semibold">
                  Containers * 
                  {selectedVolume && <span className="text-xs text-gray-500 block">({selectedVolume} each)</span>}
                </Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                  className="text-center"
                  placeholder="Number of containers"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">
                  Rate per Container *
                  {selectedVolume && <span className="text-xs text-gray-500 block">(per {selectedVolume})</span>}
                </Label>
                <Input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold">Total</Label>
                <div className="flex items-center h-10 px-3 py-2 border bg-white rounded-md font-semibold">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {(quantity * rate).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Color and Volume Options */}
            {selectedProductData?.hasVariableColors && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                {selectedProductData.predefinedColors && selectedProductData.predefinedColors.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold">Predefined Color</Label>
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
                  <Label className="text-sm font-semibold">Custom Color Code</Label>
                  <Input
                    value={customColorCode}
                    onChange={(e) => setCustomColorCode(e.target.value)}
                    placeholder="Enter custom color"
                  />
                </div>
              </div>
            )}

            {selectedProductData?.volumes && selectedProductData.volumes.length > 0 && (
              <div className="max-w-md">
                <Label className="text-sm font-semibold">Volume</Label>
                <Select value={selectedVolume} onValueChange={setSelectedVolume}>
                  <SelectTrigger>
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

            <Button onClick={handleAddItem} className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
              <Plus className="h-5 w-5 mr-2" />
              Add Item to Invoice
            </Button>

            {/* Items List */}
            {invoiceData.items.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Invoice Items:</h4>
                <div className="space-y-3">
                  {invoiceData.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <span className="font-medium text-gray-900">{item.finalName}</span>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-500">Containers:</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-20 text-center"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-500">Rate/Container:</Label>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleUpdateItem(item.id, 'rate', Number(e.target.value))}
                            className="w-24"
                          />
                        </div>
                        <span className="flex items-center font-semibold text-green-600">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          {item.total.toFixed(2)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-4"
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
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={invoiceData.notes}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes, terms, or conditions..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceBuilder;
