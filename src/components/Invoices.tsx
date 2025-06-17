import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Eye, Printer, Trash2, IndianRupee, Download, CheckCircle, Clock, AlertCircle, Search, Filter, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
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
  items: Array<{
    id: string;
    productName: string;
    colorCode: string;
    volume: string;
    finalName: string;
    quantity: number;
    rate: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes: string;
  watermarkId: string;
  gstEnabled: boolean;
}

interface InvoicesProps {
  onCreateNew: () => void;
  highlightInvoiceId?: string;
}

const Invoices: React.FC<InvoicesProps> = ({ onCreateNew, highlightInvoiceId }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showTodayOnly, setShowTodayOnly] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      const parsedInvoices = JSON.parse(savedInvoices);
      // Sort by date (newest first)
      const sortedInvoices = parsedInvoices.sort((a: Invoice, b: Invoice) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setInvoices(sortedInvoices);
      
      // Auto-select highlighted invoice if provided
      if (highlightInvoiceId) {
        const highlightedInvoice = sortedInvoices.find((inv: Invoice) => inv.id === highlightInvoiceId);
        if (highlightedInvoice) {
          setSelectedInvoice(highlightedInvoice);
        }
      }
    }
  }, [highlightInvoiceId]);

  const saveInvoices = (updatedInvoices: Invoice[]) => {
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    setInvoices(updatedInvoices);
    
    // Auto-save organized files
    saveOrganizedInvoices(updatedInvoices);
  };

  const saveOrganizedInvoices = (invoiceList: Invoice[]) => {
    // Organize by year and payment status
    const organized = invoiceList.reduce((acc, invoice) => {
      const year = new Date(invoice.date).getFullYear().toString();
      const isPaid = invoice.status === 'paid';
      
      if (!acc[year]) {
        acc[year] = { paid: [], unpaid: [] };
      }
      
      if (isPaid) {
        acc[year].paid.push(invoice);
      } else {
        acc[year].unpaid.push(invoice);
      }
      
      return acc;
    }, {} as any);

    // Save organized data
    localStorage.setItem('organizedInvoices', JSON.stringify(organized));
  };

  const handleDelete = (invoiceId: string) => {
    const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId);
    saveInvoices(updatedInvoices);
    toast({
      title: "Success",
      description: "Invoice deleted successfully!",
    });
  };

  const handleStatusChange = (invoiceId: string, newStatus: Invoice['status']) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status: newStatus } : inv
    );
    saveInvoices(updatedInvoices);
    toast({
      title: "Success",
      description: "Invoice status updated!",
    });
  };

  const generateFileName = (invoice: Invoice) => {
    const customerName = invoice.customerDetails.name.replace(/[^a-zA-Z0-9]/g, '_');
    const lastFourDigits = invoice.customerDetails.phone.slice(-4);
    return `${customerName}_${lastFourDigits}`;
  };

  const saveInvoiceFile = (invoice: Invoice, htmlContent: string) => {
    try {
      const invoiceDate = new Date(invoice.date);
      const year = invoiceDate.getFullYear();
      const month = String(invoiceDate.getMonth() + 1).padStart(2, '0');
      const day = String(invoiceDate.getDate()).padStart(2, '0');
      
      const fileName = generateFileName(invoice);
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${year}_${month}_${day}_${fileName}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Invoice Saved",
        description: `Invoice saved as ${year}/${month}/${day}/${fileName}.html`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save invoice file",
        variant: "destructive",
      });
    }
  };

  const generateThermalPrintContent = (invoice: Invoice) => {
    const storeSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    const isCompact = storeSettings.thermalSettings?.compactMode || false;
    const fontSize = storeSettings.thermalSettings?.fontSize || 'medium';
    
    const fontSizeMap = {
      small: '9px',
      medium: '10px',
      large: '12px'
    };

    return `
      <html>
        <head>
          <title>Receipt ${invoice.invoiceNumber}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0.5mm;
            }
            
            * {
              font-family: 'Courier New', monospace !important;
              font-size: ${fontSizeMap[fontSize as keyof typeof fontSizeMap]} !important;
              line-height: 1.2 !important;
              color: black !important;
              background: white !important;
              margin: 0;
              padding: 0;
            }
            
            body {
              width: 79mm;
              margin: 0;
              padding: 0.5mm;
            }
            
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            
            .header {
              text-align: center;
              border-bottom: 1px dashed black;
              padding-bottom: 1mm;
              margin-bottom: 1mm;
            }
            
            .logo {
              max-width: 25mm;
              max-height: 15mm;
              margin: 0 auto 1mm auto;
            }
            
            .store-name {
              font-size: ${fontSize === 'large' ? '14px' : '12px'} !important;
              font-weight: bold;
              margin-bottom: 0.5mm;
            }
            
            .store-details {
              font-size: ${fontSize === 'small' ? '7px' : '8px'} !important;
              line-height: 1.1 !important;
            }
            
            .invoice-info {
              margin: 1mm 0;
              font-size: ${fontSize === 'small' ? '8px' : '9px'} !important;
            }
            
            .customer-info {
              margin: 1mm 0;
              border-bottom: 1px dotted black;
              padding-bottom: 1mm;
              font-size: ${fontSize === 'small' ? '8px' : '9px'} !important;
            }
            
            .item-row {
              margin: 0.5mm 0;
              font-size: ${fontSize === 'small' ? '8px' : '9px'} !important;
            }
            
            .item-name {
              font-weight: bold;
              margin-bottom: 0.5mm;
            }
            
            .item-details {
              display: flex;
              justify-content: space-between;
            }
            
            .totals {
              border-top: 1px dashed black;
              padding-top: 1mm;
              margin-top: 1mm;
              font-size: ${fontSize === 'small' ? '8px' : '9px'} !important;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 0.5mm 0;
            }
            
            .final-total {
              font-weight: bold;
              border-top: 1px solid black;
              border-bottom: 1px solid black;
              padding: 1mm 0;
              margin: 1mm 0;
              font-size: ${fontSize === 'medium' ? '11px' : '10px'} !important;
            }
            
            .footer {
              text-align: center;
              margin-top: 1mm;
              border-top: 1px dashed black;
              padding-top: 1mm;
              font-size: ${fontSize === 'small' ? '7px' : '8px'} !important;
            }
            
            .qr-code {
              max-width: 20mm;
              max-height: 20mm;
              margin: 1mm auto;
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${invoice.storeInfo.logo && storeSettings.printSettings?.includeLogo ? 
              `<img src="${invoice.storeInfo.logo}" alt="Logo" class="logo" />` : ''}
            <div class="store-name">${invoice.storeInfo.name || 'Hardware Store'}</div>
            <div class="store-details">
              ${invoice.storeInfo.address ? `${invoice.storeInfo.address}<br>` : ''}
              Ph: ${invoice.storeInfo.phone || ''}<br>
              ${invoice.storeInfo.taxId ? `GST: ${invoice.storeInfo.taxId}` : ''}
            </div>
          </div>
          
          <div class="invoice-info">
            <div><strong>Receipt: ${invoice.invoiceNumber}</strong></div>
            <div>${new Date(invoice.date).toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          
          <div class="customer-info">
            <div><strong>${invoice.customerDetails.name}</strong></div>
            ${invoice.customerDetails.phone ? `<div>Ph: ${invoice.customerDetails.phone}</div>` : ''}
          </div>
          
          <div class="items">
            ${invoice.items.map(item => `
              <div class="item-row">
                <div class="item-name">${item.finalName || `${item.productName} ${item.colorCode} ${item.volume}`.trim()}</div>
                <div class="item-details">
                  <span>${item.quantity} x Rs.${item.rate.toFixed(2)}</span>
                  <span>Rs.${item.total.toFixed(2)}</span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>Rs.${invoice.subtotal.toFixed(2)}</span>
            </div>
            ${invoice.gstEnabled ? `
            <div class="total-row">
              <span>GST (18%):</span>
              <span>Rs.${invoice.tax.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="total-row final-total">
              <span>TOTAL:</span>
              <span>Rs.${invoice.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <div>Thank you for your business!</div>
            ${invoice.storeInfo.paymentQR && storeSettings.printSettings?.includeQR ? 
              `<img src="${invoice.storeInfo.paymentQR}" alt="Pay QR" class="qr-code" />
               <div>Scan to Pay</div>` : ''}
            <div style="margin-top: 1mm;">${invoice.watermarkId}</div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = (invoice: Invoice, shouldSave: boolean = false) => {
    const storeSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    const printerType = storeSettings.printerType || 'normal';
    
    let printContent = '';
    
    if (printerType === 'thermal') {
      printContent = generateThermalPrintContent(invoice);
    } else {
      // Compact normal printer content
      printContent = `
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 15px; 
                line-height: 1.3;
                color: #333;
                position: relative;
                font-size: 12px;
              }
              .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 40px;
                color: rgba(0, 0, 0, 0.03);
                font-weight: bold;
                z-index: -1;
                user-select: none;
              }
              .payment-status {
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 4px 12px;
                border-radius: 15px;
                font-weight: bold;
                font-size: 11px;
              }
              .status-paid { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
              .status-unpaid { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
              .status-draft { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
              .status-sent { background: #cce5ff; color: #004085; border: 1px solid #b8daff; }
              .status-overdue { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
              .header { 
                display: flex; 
                justify-content: space-between; 
                align-items: start; 
                margin: 30px 0 15px 0; 
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
              }
              .company-logo { max-width: 80px; max-height: 50px; margin-bottom: 5px; }
              .company-info h2 { margin: 0 0 3px 0; font-size: 16px; }
              .company-info p { margin: 1px 0; font-size: 10px; }
              .invoice-title h1 { margin: 0; font-size: 20px; color: #2563eb; }
              .invoice-title h2 { margin: 2px 0; font-size: 14px; color: #666; }
              .invoice-title p { margin: 1px 0; font-size: 10px; }
              .customer-section { 
                display: flex; 
                justify-content: space-between; 
                margin: 10px 0;
                background: #f8f9fa;
                padding: 8px;
                border-radius: 3px;
              }
              .customer-info h3 { margin: 0 0 3px 0; font-size: 12px; }
              .customer-info p { margin: 1px 0; font-size: 10px; }
              .table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 10px 0; 
                font-size: 10px;
              }
              .table th, .table td { 
                border: 1px solid #ddd; 
                padding: 6px 4px; 
                text-align: left; 
              }
              .table th { 
                background-color: #f2f2f2; 
                font-weight: bold;
                font-size: 9px;
              }
              .table td:last-child, .table th:last-child { 
                text-align: right; 
              }
              .total-section { 
                text-align: right; 
                margin-top: 10px; 
                border-top: 1px solid #ddd;
                padding-top: 8px;
                font-size: 11px;
              }
              .total-row { 
                display: flex; 
                justify-content: flex-end; 
                margin: 2px 0;
              }
              .total-label { 
                width: 80px; 
                text-align: right; 
                margin-right: 15px;
              }
              .total-amount { 
                width: 70px; 
                text-align: right; 
                font-weight: bold;
              }
              .final-total { 
                font-size: 13px; 
                border-top: 1px solid #ccc; 
                padding-top: 5px; 
                margin-top: 5px;
              }
              .footer {
                margin-top: 20px; 
                text-align: center; 
                font-size: 9px; 
                color: #666;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top: 1px dotted #ccc;
                padding-top: 10px;
              }
              .payment-qr {
                max-width: 60px;
                max-height: 60px;
              }
            </style>
          </head>
          <body>
            <div class="watermark">ORIGINAL</div>
            <div class="payment-status status-${invoice.status}">
              ${invoice.status.toUpperCase()}
            </div>
            
            <div class="header">
              <div class="company-info">
                ${invoice.storeInfo.logo && storeSettings.printSettings?.includeLogo ? 
                  `<img src="${invoice.storeInfo.logo}" alt="Logo" class="company-logo" />` : ''}
                <h2>${invoice.storeInfo.name || 'Hardware Store'}</h2>
                <p>${invoice.storeInfo.address || ''}</p>
                <p>Ph: ${invoice.storeInfo.phone || ''} | ${invoice.storeInfo.email || ''}</p>
                ${invoice.storeInfo.taxId ? `<p>GST: ${invoice.storeInfo.taxId}</p>` : ''}
              </div>
              <div class="invoice-title">
                <h1>INVOICE</h1>
                <h2>${invoice.invoiceNumber}</h2>
                <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
            
            <div class="customer-section">
              <div class="customer-info">
                <h3>Bill To:</h3>
                <p><strong>${invoice.customerDetails.name}</strong></p>
                ${invoice.customerDetails.phone ? `<p>Ph: ${invoice.customerDetails.phone}</p>` : ''}
                ${invoice.customerDetails.address ? `<p>${invoice.customerDetails.address}</p>` : ''}
              </div>
            </div>
            
            <table class="table">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align: center; width: 50px;">Qty</th>
                  <th style="text-align: right; width: 60px;">Rate (₹)</th>
                  <th style="text-align: right; width: 70px;">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.finalName || `${item.productName} ${item.colorCode} ${item.volume}`.trim()}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">₹${item.rate.toFixed(2)}</td>
                    <td style="text-align: right;">₹${item.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-row">
                <div class="total-label">Subtotal:</div>
                <div class="total-amount">₹${invoice.subtotal.toFixed(2)}</div>
              </div>
              ${invoice.gstEnabled ? `
              <div class="total-row">
                <div class="total-label">GST (18%):</div>
                <div class="total-amount">₹${invoice.tax.toFixed(2)}</div>
              </div>
              ` : ''}
              <div class="total-row final-total">
                <div class="total-label">Total:</div>
                <div class="total-amount">₹${invoice.total.toFixed(2)}</div>
              </div>
            </div>
            
            <div class="footer">
              <div>
                <p>Thank you for your business!</p>
              </div>
              ${invoice.storeInfo.paymentQR && storeSettings.printSettings?.includeQR ? 
                `<div style="text-align: center;">
                   <img src="${invoice.storeInfo.paymentQR}" alt="Payment QR" class="payment-qr" />
                   <p style="margin: 2px 0;">Scan to Pay</p>
                 </div>` : ''}
              <div style="text-align: right;">
                <p>${invoice.watermarkId}</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }
    
    if (shouldSave) {
      saveInvoiceFile(invoice, printContent);
    }
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'default';
      case 'paid': return 'default';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getTodaysDate = () => {
    return new Date().toDateString();
  };

  const filterInvoices = (status: string) => {
    let filtered = invoices;
    
    // Filter by today's date if showTodayOnly is true and no search term
    if (showTodayOnly && !searchTerm) {
      const today = getTodaysDate();
      filtered = invoices.filter(inv => new Date(inv.date).toDateString() === today);
    }
    
    // Filter by status
    switch (status) {
      case 'paid': 
        filtered = filtered.filter(inv => inv.status === 'paid');
        break;
      case 'unpaid': 
        filtered = filtered.filter(inv => inv.status !== 'paid');
        break;
      case 'draft': 
        filtered = filtered.filter(inv => inv.status === 'draft');
        break;
    }
    
    return filtered;
  };

  // Apply search filter to the filtered invoices
  const getFilteredAndSearchedInvoices = () => {
    const statusFiltered = filterInvoices(activeTab);
    
    if (!searchTerm) return statusFiltered;
    
    return statusFiltered.filter(invoice =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerDetails.phone.includes(searchTerm) ||
      invoice.date.includes(searchTerm) ||
      invoice.watermarkId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.items.some(item => 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.finalName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const filteredInvoices = getFilteredAndSearchedInvoices();

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-6">
      <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Invoice Management
          </h1>
          <p className="text-gray-600">Create and manage customer invoices</p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Enhanced Search and Filter Bar */}
      <Card className="bg-white shadow-lg">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by invoice #, customer name, phone, date (YYYY-MM-DD), or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500"
              />
            </div>
            <Button
              variant={showTodayOnly ? "default" : "outline"}
              onClick={() => setShowTodayOnly(!showTodayOnly)}
              className={showTodayOnly ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Today Only
            </Button>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setShowTodayOnly(true); }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-md rounded-lg h-12">
          <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
            All ({showTodayOnly && !searchTerm ? filteredInvoices.length : invoices.length})
          </TabsTrigger>
          <TabsTrigger value="paid" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
            Paid ({invoices.filter(inv => inv.status === 'paid').length})
          </TabsTrigger>
          <TabsTrigger value="unpaid" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
            Unpaid ({invoices.filter(inv => inv.status !== 'paid').length})
          </TabsTrigger>
          <TabsTrigger value="draft" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-slate-500 data-[state=active]:text-white">
            Drafts ({invoices.filter(inv => inv.status === 'draft').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {selectedInvoice && (
            <Card className="mb-6 bg-white shadow-xl border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Invoice {selectedInvoice.invoiceNumber}
                      {getStatusIcon(selectedInvoice.status)}
                      <Badge variant={getStatusColor(selectedInvoice.status)} className="ml-2">
                        {selectedInvoice.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-base">
                      Customer: {selectedInvoice.customerDetails.name}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handlePrint(selectedInvoice, false)} className="bg-blue-600 hover:bg-blue-700">
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePrint(selectedInvoice, true)}>
                      <Download className="h-4 w-4 mr-2" />
                      Save & Print
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedInvoice(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Compact invoice details display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-gray-600">Date</p>
                    <p className="text-lg">{new Date(selectedInvoice.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-gray-600">Status</p>
                    <Badge variant={getStatusColor(selectedInvoice.status)} className="mt-1">
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-gray-600">Total Amount</p>
                    <p className="text-lg font-bold text-green-600 flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {selectedInvoice.total.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-700">Customer Details</h4>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                      <p className="font-semibold">{selectedInvoice.customerDetails.name}</p>
                      {selectedInvoice.customerDetails.phone && <p>📞 {selectedInvoice.customerDetails.phone}</p>}
                      {selectedInvoice.customerDetails.address && <p>📍 {selectedInvoice.customerDetails.address}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-700">Items Summary</h4>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="space-y-1 text-sm">
                        {selectedInvoice.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="truncate">{item.finalName}</span>
                            <span className="flex items-center ml-2">
                              <IndianRupee className="h-3 w-3" />
                              {item.total.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {selectedInvoice.items.length > 3 && (
                          <p className="text-gray-500 text-xs">
                            +{selectedInvoice.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvoices.map((invoice) => (
              <Card 
                key={invoice.id} 
                className={`hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-l-4 ${
                  invoice.status === 'paid' ? 'border-l-green-500' : 
                  invoice.status === 'draft' ? 'border-l-gray-500' : 
                  invoice.status === 'overdue' ? 'border-l-red-500' : 'border-l-orange-500'
                } ${highlightInvoiceId === invoice.id ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}
              >
                <CardHeader className={`pb-3 ${
                  invoice.status === 'paid' ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 
                  invoice.status === 'draft' ? 'bg-gradient-to-r from-gray-50 to-slate-50' : 
                  invoice.status === 'overdue' ? 'bg-gradient-to-r from-red-50 to-pink-50' : 
                  'bg-gradient-to-r from-orange-50 to-yellow-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      {getStatusIcon(invoice.status)}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInvoice(invoice)}
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrint(invoice, false)}
                        className="h-8 w-8 p-0 hover:bg-green-100"
                      >
                        <Printer className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(invoice.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-800">
                    {invoice.invoiceNumber}
                  </CardTitle>
                  <CardDescription className="font-medium text-gray-600">
                    {invoice.customerDetails.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Date:</span>
                      <span className="text-sm font-medium">
                        {new Date(invoice.date).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Amount:</span>
                      <span className="font-bold text-lg text-green-600 flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {invoice.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge variant={getStatusColor(invoice.status)} className="text-xs">
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(invoice.id, invoice.status === 'paid' ? 'sent' : 'paid')}
                      className="flex-1 text-xs"
                    >
                      {invoice.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePrint(invoice, true)}
                      className="px-3"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInvoices.length === 0 && searchTerm && (
            <Card className="bg-white shadow-lg">
              <CardContent className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-700">No invoices found</h3>
                <p className="text-gray-500 mb-6">No invoices match your search criteria</p>
                <Button variant="outline" onClick={() => setSearchTerm('')} className="mr-2">
                  Clear Search
                </Button>
                <Button onClick={() => setShowTodayOnly(false)} variant="outline">
                  Show All Invoices
                </Button>
              </CardContent>
            </Card>
          )}

          {filteredInvoices.length === 0 && !searchTerm && (
            <Card className="bg-white shadow-lg">
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                  {showTodayOnly ? "No invoices today" : `No ${activeTab === 'all' ? '' : activeTab} invoices`}
                </h3>
                <p className="text-gray-500 mb-6">
                  {showTodayOnly 
                    ? "No invoices were created today. Create your first invoice for today!" 
                    : activeTab === 'all' 
                    ? 'Create your first invoice to get started' 
                    : `No ${activeTab} invoices found`
                  }
                </p>
                <Button onClick={onCreateNew} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Invoices;
