
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Plus, ArrowLeft, IndianRupee, Eye, Printer } from "lucide-react";
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

interface SavedInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerDetails: { name: string; phone: string; address: string };
  items: InvoiceItem[];
  notes: string;
  watermarkId: string;
  storeInfo: any;
  subtotal: number;
  tax: number;
  total: number;
  gstEnabled: boolean;
  status: string;
}

interface InvoiceBuilderProps {
  onClose: (newInvoiceId?: string) => void;
}

const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [gstEnabled, setGstEnabled] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');
  const [createdInvoice, setCreatedInvoice] = useState<SavedInvoice | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid');
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
    
    let finalName = product.name;
    if (selectedVolume) finalName += ` ${selectedVolume}`;
    if (finalColorCode) finalName += ` ${finalColorCode}`;
    
    const newItem: InvoiceItem = {
      id: `item_${Date.now()}_${Math.random()}`, // More unique ID to ensure proper ordering
      productName: product.name,
      colorCode: finalColorCode,
      volume: selectedVolume,
      finalName: finalName.trim(),
      quantity,
      rate,
      total: quantity * rate,
      unit: product.unit,
    };

    // Add new item to the end of the array (below previous items)
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

  const handleSaveInvoice = (isDraft: boolean = false) => {
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
    
    const status = isDraft ? 'draft' : paymentStatus;
    
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
      description: `Invoice ${isDraft ? 'saved as draft' : 'created'} successfully!`,
    });
    
    // Switch to view mode and show the created invoice
    setCreatedInvoice(newInvoice);
    setViewMode('view');
  };

  const handlePrintInvoice = () => {
    if (!createdInvoice) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const storeInfo = createdInvoice.storeInfo || {};
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${createdInvoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; background: white; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #333; }
            .store-info h1 { color: #e11d48; font-size: 24px; margin-bottom: 5px; }
            .store-info p { margin: 2px 0; font-size: 14px; }
            .invoice-details { text-align: right; }
            .customer-section { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .customer-section h3 { margin-bottom: 10px; color: #333; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th { background: #e11d48; color: white; padding: 12px 8px; text-align: left; font-weight: bold; }
            .items-table td { padding: 10px 8px; border-bottom: 1px solid #ddd; }
            .items-table tr:nth-child(even) { background: #f8f9fa; }
            .totals { margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .total-row.final { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 15px; color: #e11d48; }
            .notes { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            .qr-section { display: flex; align-items: center; gap: 15px; margin-top: 15px; }
            .qr-code { width: 100px; height: 100px; }
            .watermark-id { margin-top: 10px; font-size: 10px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="store-info">
                ${storeInfo.logo ? `<img src="${storeInfo.logo}" alt="Store Logo" style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 10px;">` : ''}
                <h1>${storeInfo.name || 'Jai Mata Di Saintary & Hardware Store'}</h1>
                <p>${storeInfo.address || 'Store Address'}</p>
                <p>Phone: ${storeInfo.phone || 'Store Phone'}</p>
                ${storeInfo.email ? `<p>Email: ${storeInfo.email}</p>` : ''}
                ${storeInfo.gst ? `<p>GST: ${storeInfo.gst}</p>` : ''}
              </div>
              <div class="invoice-details">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> ${createdInvoice.invoiceNumber}</p>
                <p><strong>Date:</strong> ${new Date(createdInvoice.date).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${createdInvoice.status.toUpperCase()}</p>
              </div>
            </div>

            <div class="customer-section">
              <h3>Bill To:</h3>
              <p><strong>${createdInvoice.customerDetails.name}</strong></p>
              <p>Phone: ${createdInvoice.customerDetails.phone}</p>
              <p>${createdInvoice.customerDetails.address}</p>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Rate</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${createdInvoice.items.map(item => `
                  <tr>
                    <td>${item.finalName}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">₹${item.rate.toFixed(2)}</td>
                    <td style="text-align: right;">₹${item.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${createdInvoice.subtotal.toFixed(2)}</span>
              </div>
              ${createdInvoice.gstEnabled ? `
                <div class="total-row">
                  <span>GST (18%):</span>
                  <span>₹${createdInvoice.tax.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="total-row final">
                <span>Total Amount:</span>
                <span>₹${createdInvoice.total.toFixed(2)}</span>
              </div>
            </div>

            ${createdInvoice.notes ? `
              <div class="notes">
                <h4>Notes:</h4>
                <p>${createdInvoice.notes}</p>
              </div>
            ` : ''}

            ${storeInfo.paymentQR ? `
              <div class="qr-section">
                <div>
                  <h4>Payment QR Code:</h4>
                  <p>Scan to pay</p>
                </div>
                <img src="${storeInfo.paymentQR}" alt="Payment QR" class="qr-code">
              </div>
            ` : ''}

            <div class="footer">
              <p>Thank you for your business!</p>
              <p class="watermark-id">ID: ${createdInvoice.watermarkId}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const { subtotal, tax, total } = calculateTotals();
  const selectedProductData = products.find(p => p.id === selectedProduct);

  // View mode - show completed invoice
  if (viewMode === 'view' && createdInvoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => onClose(createdInvoice.id)} size="lg" className="hover:bg-gray-50">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Invoices
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-green-700">Invoice Created Successfully!</h1>
                <p className="text-gray-600">Invoice #{createdInvoice.invoiceNumber}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setViewMode('edit')} 
                size="lg"
                className="bg-blue-50 hover:bg-blue-100 border-blue-300"
              >
                <Eye className="h-5 w-5 mr-2" />
                Edit Invoice
              </Button>
              <Button 
                onClick={handlePrintInvoice} 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 shadow-md"
              >
                <Printer className="h-5 w-5 mr-2" />
                Print Invoice
              </Button>
            </div>
          </div>

          {/* Invoice Preview */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              {/* Store Header */}
              <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-300">
                <div className="flex items-center gap-4">
                  {createdInvoice.storeInfo?.logo && (
                    <img src={createdInvoice.storeInfo.logo} alt="Store Logo" className="w-20 h-20 object-contain" />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {createdInvoice.storeInfo?.name || 'Jai Mata Di Saintary & Hardware Store'}
                    </h1>
                    <p className="text-gray-600">{createdInvoice.storeInfo?.address || 'Store Address'}</p>
                    <p className="text-gray-600">Phone: {createdInvoice.storeInfo?.phone || 'Store Phone'}</p>
                    {createdInvoice.storeInfo?.email && <p className="text-gray-600">Email: {createdInvoice.storeInfo.email}</p>}
                    {createdInvoice.storeInfo?.gst && <p className="text-gray-600">GST: {createdInvoice.storeInfo.gst}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h2>
                  <p className="text-gray-600"><strong>Invoice #:</strong> {createdInvoice.invoiceNumber}</p>
                  <p className="text-gray-600"><strong>Date:</strong> {new Date(createdInvoice.date).toLocaleDateString()}</p>
                  <p className="text-gray-600"><strong>Status:</strong> {createdInvoice.status.toUpperCase()}</p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-900">Bill To:</h3>
                <p className="font-semibold text-gray-900">{createdInvoice.customerDetails.name}</p>
                <p className="text-gray-600">Phone: {createdInvoice.customerDetails.phone}</p>
                <p className="text-gray-600">{createdInvoice.customerDetails.address}</p>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="text-left p-3 border">Item</th>
                      <th className="text-center p-3 border">Qty</th>
                      <th className="text-right p-3 border">Rate</th>
                      <th className="text-right p-3 border">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {createdInvoice.items.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-3 border">{item.finalName}</td>
                        <td className="p-3 border text-center">{item.quantity}</td>
                        <td className="p-3 border text-right">₹{item.rate.toFixed(2)}</td>
                        <td className="p-3 border text-right">₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between py-2">
                    <span>Subtotal:</span>
                    <span>₹{createdInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  {createdInvoice.gstEnabled && (
                    <div className="flex justify-between py-2">
                      <span>GST (18%):</span>
                      <span>₹{createdInvoice.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-t-2 border-gray-300 font-bold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{createdInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {createdInvoice.notes && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Notes:</h4>
                  <p className="text-gray-600">{createdInvoice.notes}</p>
                </div>
              )}

              {/* Payment QR */}
              {createdInvoice.storeInfo?.paymentQR && (
                <div className="flex items-center gap-4 mb-8">
                  <div>
                    <h4 className="font-semibold mb-1">Payment QR Code:</h4>
                    <p className="text-gray-600">Scan to pay</p>
                  </div>
                  <img src={createdInvoice.storeInfo.paymentQR} alt="Payment QR" className="w-24 h-24 object-contain border rounded" />
                </div>
              )}

              {/* Footer */}
              <div className="text-center pt-6 border-t border-gray-300">
                <p className="text-gray-600 mb-2">Thank you for your business!</p>
                <p className="text-xs text-gray-500 mt-2">ID: {createdInvoice.watermarkId}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Edit mode - show invoice builder
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => onClose()} size="lg" className="hover:bg-gray-50">
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
            <Button 
              variant="outline" 
              onClick={() => handleSaveInvoice(true)} 
              size="lg"
              className="bg-gray-50 hover:bg-gray-100 border-gray-300 px-8 py-3"
            >
              Save Draft
            </Button>
            <Button 
              onClick={() => handleSaveInvoice(false)} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 shadow-md px-8 py-3"
            >
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
            <CardTitle className="text-xl flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Item Form - Horizontal Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Product *</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="mt-1">
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

              {selectedProductData?.volumes && selectedProductData.volumes.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Volume</Label>
                  <Select value={selectedVolume} onValueChange={setSelectedVolume}>
                    <SelectTrigger className="mt-1">
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

              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Qty * 
                  {selectedVolume && <span className="text-xs text-gray-500 block">({selectedVolume} each)</span>}
                </Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                  className="text-center mt-1"
                  placeholder="Quantity"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Rate *
                  {selectedVolume && <span className="text-xs text-gray-500 block">(per {selectedVolume})</span>}
                </Label>
                <Input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>

              {selectedProductData?.hasVariableColors && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Color</Label>
                  {selectedProductData.predefinedColors && selectedProductData.predefinedColors.length > 0 ? (
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger className="mt-1">
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
                  ) : (
                    <Input
                      value={customColorCode}
                      onChange={(e) => setCustomColorCode(e.target.value)}
                      placeholder="Enter color"
                      className="mt-1"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Custom Color Input - Show separately if both predefined and custom are available */}
            {selectedProductData?.hasVariableColors && selectedProductData.predefinedColors && selectedProductData.predefinedColors.length > 0 && (
              <div className="max-w-md">
                <Label className="text-sm font-semibold">Custom Color Code</Label>
                <Input
                  value={customColorCode}
                  onChange={(e) => setCustomColorCode(e.target.value)}
                  placeholder="Or enter custom color"
                  className="mt-1"
                />
              </div>
            )}

            {/* Total and Add Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-semibold text-gray-700">Total Amount:</Label>
                <div className="flex items-center h-10 px-3 py-2 border bg-white rounded-md font-semibold text-green-600 text-lg">
                  <IndianRupee className="h-5 w-5 mr-1" />
                  {(quantity * rate).toFixed(2)}
                </div>
              </div>
              <Button 
                onClick={handleAddItem} 
                className="bg-green-600 hover:bg-green-700 text-lg py-3 px-8 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Item to Invoice
              </Button>
            </div>

            {/* Items List */}
            {invoiceData.items.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  Invoice Items:
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {invoiceData.items.length} items
                  </span>
                </h4>
                <div className="space-y-3">
                  {invoiceData.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <span className="font-medium text-gray-900">{item.finalName}</span>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-500">Qty:</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-20 text-center"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-500">Rate:</Label>
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
                        className="ml-4 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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

        {/* Payment Status */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentStatus} onValueChange={(value: 'paid' | 'unpaid') => setPaymentStatus(value)}>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unpaid" id="unpaid" />
                  <Label htmlFor="unpaid" className="text-orange-600 font-medium">Unpaid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="paid" />
                  <Label htmlFor="paid" className="text-green-600 font-medium">Paid</Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

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

        {/* Action Buttons - Moved to Bottom */}
        <div className="flex justify-center gap-4 pt-6">
          <Button 
            variant="outline" 
            onClick={() => handleSaveInvoice(true)} 
            size="lg"
            className="bg-gray-50 hover:bg-gray-100 border-gray-300 px-8 py-3"
          >
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSaveInvoice(false)} 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 shadow-md px-8 py-3"
          >
            Create Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBuilder;
