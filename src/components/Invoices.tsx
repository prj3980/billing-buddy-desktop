
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Eye, Printer, Trash2, IndianRupee, Download, CheckCircle, Clock, AlertCircle } from "lucide-react";
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
}

const Invoices: React.FC<InvoicesProps> = ({ onCreateNew }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
  }, []);

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

  const handlePrint = (invoice: Invoice, shouldSave: boolean = false) => {
    const printContent = `
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.4;
              color: #333;
              position: relative;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 60px;
              color: rgba(0, 0, 0, 0.05);
              font-weight: bold;
              z-index: -1;
              user-select: none;
            }
            .verification-code {
              position: absolute;
              top: 20px;
              right: 20px;
              background: #f0f0f0;
              padding: 8px 12px;
              border-radius: 4px;
              font-size: 12px;
              color: #666;
              border: 1px solid #ddd;
            }
            .payment-status {
              position: absolute;
              top: 20px;
              left: 20px;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 14px;
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
              margin: 60px 0 30px 0; 
              border-bottom: 2px solid #eee;
              padding-bottom: 20px;
            }
            .company-info { text-align: left; }
            .invoice-title { text-align: right; }
            .invoice-title h1 { 
              margin: 0; 
              font-size: 28px; 
              color: #2563eb; 
            }
            .invoice-title h2 { 
              margin: 5px 0; 
              font-size: 18px; 
              color: #666; 
            }
            .customer-info { 
              margin-bottom: 20px; 
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
            }
            .table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            .table th, .table td { 
              border: 1px solid #ddd; 
              padding: 12px 8px; 
              text-align: left; 
            }
            .table th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            .table td:last-child, .table th:last-child { 
              text-align: right; 
            }
            .total-section { 
              text-align: right; 
              margin-top: 20px; 
              border-top: 2px solid #eee;
              padding-top: 15px;
            }
            .total-row { 
              display: flex; 
              justify-content: flex-end; 
              margin: 5px 0;
            }
            .total-label { 
              width: 120px; 
              text-align: right; 
              margin-right: 20px;
            }
            .total-amount { 
              width: 100px; 
              text-align: right; 
              font-weight: bold;
            }
            .final-total { 
              font-size: 18px; 
              border-top: 1px solid #ccc; 
              padding-top: 10px; 
              margin-top: 10px;
            }
            .notes { 
              margin-top: 30px; 
              padding: 15px;
              background: #f8f9fa;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="watermark">ORIGINAL INVOICE</div>
          <div class="verification-code">
            Verification: ${invoice.watermarkId}
          </div>
          <div class="payment-status status-${invoice.status}">
            ${invoice.status.toUpperCase()}
          </div>
          
          <div class="header">
            <div class="company-info">
              <h2>${invoice.storeInfo.name || 'Paint Store'}</h2>
              <p>${invoice.storeInfo.address || ''}</p>
              <p>Phone: ${invoice.storeInfo.phone || ''}</p>
              <p>Email: ${invoice.storeInfo.email || ''}</p>
              ${invoice.storeInfo.taxId ? `<p>GST/Tax ID: ${invoice.storeInfo.taxId}</p>` : ''}
              ${invoice.storeInfo.website ? `<p>Website: ${invoice.storeInfo.website}</p>` : ''}
            </div>
            <div class="invoice-title">
              <h1>INVOICE</h1>
              <h2>${invoice.invoiceNumber}</h2>
              <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          
          <div class="customer-info">
            <h3 style="margin-top: 0;">Bill To:</h3>
            <p><strong>${invoice.customerDetails.name}</strong></p>
            ${invoice.customerDetails.address ? `<p>${invoice.customerDetails.address}</p>` : ''}
            ${invoice.customerDetails.phone ? `<p>Phone: ${invoice.customerDetails.phone}</p>` : ''}
            ${invoice.customerDetails.email ? `<p>Email: ${invoice.customerDetails.email}</p>` : ''}
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center; width: 80px;">Qty</th>
                <th style="text-align: right; width: 100px;">Rate (₹)</th>
                <th style="text-align: right; width: 100px;">Amount (₹)</th>
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
              <div class="total-label">Total Amount:</div>
              <div class="total-amount">₹${invoice.total.toFixed(2)}</div>
            </div>
          </div>
          
          ${invoice.notes ? `
            <div class="notes">
              <h4 style="margin-top: 0;">Notes:</h4>
              <p>${invoice.notes}</p>
            </div>
          ` : ''}
          
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            <p>Thank you for your business!</p>
            <p style="margin-top: 10px;">Verification Code: ${invoice.watermarkId} | Status: ${invoice.status.toUpperCase()}</p>
          </div>
        </body>
      </html>
    `;
    
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

  const filterInvoices = (status: string) => {
    switch (status) {
      case 'paid': return invoices.filter(inv => inv.status === 'paid');
      case 'unpaid': return invoices.filter(inv => inv.status !== 'paid');
      case 'draft': return invoices.filter(inv => inv.status === 'draft');
      default: return invoices;
    }
  };

  const filteredInvoices = filterInvoices(activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">Create and manage customer invoices</p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({invoices.filter(inv => inv.status === 'paid').length})</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid ({invoices.filter(inv => inv.status !== 'paid').length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({invoices.filter(inv => inv.status === 'draft').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {selectedInvoice && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Invoice {selectedInvoice.invoiceNumber}
                      {getStatusIcon(selectedInvoice.status)}
                      <Badge variant={getStatusColor(selectedInvoice.status)}>
                        {selectedInvoice.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>Customer: {selectedInvoice.customerDetails.name}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handlePrint(selectedInvoice, false)}>
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
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p><strong>Date:</strong> {selectedInvoice.date}</p>
                      <p><strong>Verification:</strong> {selectedInvoice.watermarkId}</p>
                    </div>
                    <div>
                      <p><strong>Status:</strong> 
                        <Badge variant={getStatusColor(selectedInvoice.status)} className="ml-2">
                          {selectedInvoice.status}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <p><strong>GST:</strong> {selectedInvoice.gstEnabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Customer:</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      <p><strong>{selectedInvoice.customerDetails.name}</strong></p>
                      {selectedInvoice.customerDetails.email && <p>{selectedInvoice.customerDetails.email}</p>}
                      {selectedInvoice.customerDetails.phone && <p>Phone: {selectedInvoice.customerDetails.phone}</p>}
                      {selectedInvoice.customerDetails.address && <p>{selectedInvoice.customerDetails.address}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Items:</h4>
                    <div className="space-y-2">
                      {selectedInvoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>{item.finalName} (x{item.quantity})</span>
                          <span className="flex items-center">
                            <IndianRupee className="h-4 w-4" />
                            {item.total.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <p className="flex items-center justify-end">
                      Subtotal: <IndianRupee className="h-4 w-4 ml-1" />{selectedInvoice.subtotal.toFixed(2)}
                    </p>
                    <p className="flex items-center justify-end">
                      Tax: <IndianRupee className="h-4 w-4 ml-1" />{selectedInvoice.tax.toFixed(2)}
                    </p>
                    <p className="text-lg font-bold flex items-center justify-end">
                      Total: <IndianRupee className="h-4 w-4 ml-1" />{selectedInvoice.total.toFixed(2)}
                    </p>
                  </div>
                  
                  {selectedInvoice.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes:</h4>
                      <p className="text-sm text-gray-600">{selectedInvoice.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-6 w-6 text-primary" />
                      {getStatusIcon(invoice.status)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrint(invoice, false)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(invoice.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
                  <CardDescription>{invoice.customerDetails.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <span className="text-sm">{invoice.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="font-semibold flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {invoice.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Verification:</span>
                      <span className="text-xs font-mono">{invoice.watermarkId}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(invoice.id, invoice.status === 'paid' ? 'sent' : 'paid')}
                      className="flex-1"
                    >
                      {invoice.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePrint(invoice, true)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No {activeTab === 'all' ? '' : activeTab} invoices</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'all' ? 'Create your first invoice to get started' : `No ${activeTab} invoices found`}
                </p>
                <Button onClick={onCreateNew}>
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
