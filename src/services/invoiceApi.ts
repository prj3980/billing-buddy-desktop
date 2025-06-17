
// Simulated API service for local network communication
interface ApiInvoice {
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

class InvoiceApiService {
  private static instance: InvoiceApiService;
  private invoiceCounter: number;

  constructor() {
    // Initialize counter from localStorage
    const savedCounter = localStorage.getItem('invoiceCounter');
    this.invoiceCounter = savedCounter ? parseInt(savedCounter) : 1000;
  }

  static getInstance(): InvoiceApiService {
    if (!InvoiceApiService.instance) {
      InvoiceApiService.instance = new InvoiceApiService();
    }
    return InvoiceApiService.instance;
  }

  private generateInvoiceNumber(): string {
    this.invoiceCounter++;
    localStorage.setItem('invoiceCounter', this.invoiceCounter.toString());
    return `INV-${this.invoiceCounter}`;
  }

  private generateWatermarkId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStoreInfo() {
    const storeSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    return {
      name: storeSettings.name || 'Jai Mata Di Saintary & Hardware Store',
      address: storeSettings.address || 'Hardware Store Address',
      phone: storeSettings.phone || '+91 12345 67890',
      email: storeSettings.email || 'store@hardware.com',
      taxId: storeSettings.taxId || 'GST123456789',
      website: storeSettings.website || 'www.hardware.com',
      logo: storeSettings.logo,
      paymentQR: storeSettings.paymentQR
    };
  }

  async submitInvoice(invoiceData: any): Promise<{ invoiceId: string; invoiceNumber: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const invoiceNumber = this.generateInvoiceNumber();
    const watermarkId = this.generateWatermarkId();
    
    const completeInvoice: ApiInvoice = {
      ...invoiceData,
      invoiceNumber,
      watermarkId,
      storeInfo: this.getStoreInfo(),
      status: 'sent'
    };

    // Save to PC's local storage
    const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    existingInvoices.push(completeInvoice);
    localStorage.setItem('invoices', JSON.stringify(existingInvoices));

    // Simulate auto-print
    setTimeout(() => {
      this.markAsPrinted(completeInvoice.id, invoiceNumber);
    }, 2000 + Math.random() * 3000);

    return {
      invoiceId: completeInvoice.id,
      invoiceNumber
    };
  }

  private markAsPrinted(invoiceId: string, invoiceNumber: string) {
    const printStatus = JSON.parse(localStorage.getItem('printStatus') || '{}');
    printStatus[invoiceId] = {
      printed: true,
      printedAt: new Date().toISOString(),
      invoiceNumber
    };
    localStorage.setItem('printStatus', JSON.stringify(printStatus));
  }

  async getPrintStatus(invoiceId: string): Promise<{ printed: boolean; invoiceNumber?: string }> {
    const printStatus = JSON.parse(localStorage.getItem('printStatus') || '{}');
    return printStatus[invoiceId] || { printed: false };
  }

  async healthCheck(): Promise<boolean> {
    // Simulate occasional connection issues
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    return Math.random() > 0.05; // 95% success rate
  }
}

export const invoiceApi = InvoiceApiService.getInstance();

// Mock API endpoints for fetch calls
declare global {
  interface Window {
    __mockApi: boolean;
  }
}

if (typeof window !== 'undefined') {
  window.__mockApi = true;
  
  // Override fetch for API endpoints
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    
    if (url.includes('/api/health')) {
      const isHealthy = await invoiceApi.healthCheck();
      return new Response(JSON.stringify({ status: 'ok' }), {
        status: isHealthy ? 200 : 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.includes('/api/invoices/status/')) {
      const invoiceId = url.split('/').pop()!;
      const status = await invoiceApi.getPrintStatus(invoiceId);
      return new Response(JSON.stringify(status), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.includes('/api/invoices') && init?.method === 'POST') {
      try {
        const invoiceData = JSON.parse(init.body as string);
        const result = await invoiceApi.submitInvoice(invoiceData);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to process invoice' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Fall back to original fetch for other requests
    return originalFetch(input, init);
  };
}
