import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Eye, Printer, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
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
  dueDate: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes: string;
}

interface InvoicesProps {
  onCreateNew: () => void;
}

const Invoices: React.FC<InvoicesProps> = ({ onCreateNew }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
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

  const handlePrint = (invoice: Invoice) => {
    const printContent = `
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px; }
            .company-info { text-align: left; }
            .invoice-title { text-align: right; }
            .customer-info { margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .total { text-align: right; margin-top: 20px; }
            .notes { margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <h2>${invoice.storeInfo.name}</h2>
              <p>${invoice.storeInfo.address}</p>
              <p>Phone: ${invoice.storeInfo.phone}</p>
              <p>Email: ${invoice.storeInfo.email}</p>
              ${invoice.storeInfo.taxId ? `<p>Tax ID: ${invoice.storeInfo.taxId}</p>` : ''}
            </div>
            <div class="invoice-title">
              <h1>INVOICE</h1>
              <h2>${invoice.invoiceNumber}</h2>
              <p>Date: ${invoice.date}</p>
              <p>Due Date: ${invoice.dueDate}</p>
            </div>
          </div>
          
          <div class="customer-info">
            <h3>Bill To:</h3>
            <p><strong>${invoice.customerDetails.name}</strong></p>
            ${invoice.customerDetails.address ? `<p>${invoice.customerDetails.address}</p>` : ''}
            ${invoice.customerDetails.phone ? `<p>Phone: ${invoice.customerDetails.phone}</p>` : ''}
            ${invoice.customerDetails.email ? `<p>Email: ${invoice.customerDetails.email}</p>` : ''}
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p><strong>Subtotal: $${invoice.subtotal.toFixed(2)}</strong></p>
            <p><strong>Tax: $${invoice.tax.toFixed(2)}</strong></p>
            <p><strong>Total: $${invoice.total.toFixed(2)}</strong></p>
          </div>
          
          ${invoice.notes ? `<div class="notes"><strong>Notes:</strong><br>${invoice.notes}</div>` : ''}
        </body>
      </html>
    `;
    
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices and billing</p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {selectedInvoice && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Invoice {selectedInvoice.invoiceNumber}</CardTitle>
                <CardDescription>Customer: {selectedInvoice.customerDetails.name}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handlePrint(selectedInvoice)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Date:</strong> {selectedInvoice.date}</p>
                  <p><strong>Due Date:</strong> {selectedInvoice.dueDate}</p>
                </div>
                <div>
                  <p><strong>Status:</strong> 
                    <Badge variant={getStatusColor(selectedInvoice.status)} className="ml-2">
                      {selectedInvoice.status}
                    </Badge>
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Customer:</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>{selectedInvoice.customerDetails.name}</strong></p>
                  {selectedInvoice.customerDetails.email && <p>{selectedInvoice.customerDetails.email}</p>}
                  {selectedInvoice.customerDetails.phone && <p>{selectedInvoice.customerDetails.phone}</p>}
                  {selectedInvoice.customerDetails.address && <p>{selectedInvoice.customerDetails.address}</p>}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Items:</h4>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{item.productName} (x{item.quantity})</span>
                      <span>${item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-right space-y-1">
                <p>Subtotal: ${selectedInvoice.subtotal.toFixed(2)}</p>
                <p>Tax: ${selectedInvoice.tax.toFixed(2)}</p>
                <p className="text-lg font-bold">Total: ${selectedInvoice.total.toFixed(2)}</p>
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
        {invoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <FileText className="h-6 w-6 text-primary" />
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
                  <span className="font-semibold">${invoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange(invoice.id, invoice.status === 'paid' ? 'sent' : 'paid')}
                >
                  Mark as {invoice.status === 'paid' ? 'Unpaid' : 'Paid'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {invoices.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
            <p className="text-muted-foreground mb-4">Create your first invoice to get started</p>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Invoices;
