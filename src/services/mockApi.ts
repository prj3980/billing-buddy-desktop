
// Mock API service for development and Electron app
export interface MockProduct {
  name: string;
  colors: string[];
  volumes: string[];
}

export interface MockInvoice {
  id: string;
  invoiceNumber: string;
  customerDetails: {
    name: string;
    phone: string;
    address: string;
    email?: string;
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
  status: 'paid' | 'unpaid';
  notes: string;
  printed?: boolean;
}

class MockApiService {
  private invoices: MockInvoice[] = [];
  private invoiceCounter = 1001;
  
  private products: MockProduct[] = [
    {
      name: "Asian Paints",
      colors: ["White", "Red", "Blue", "Green", "Yellow"],
      volumes: ["1L", "4L", "10L", "20L"]
    },
    {
      name: "Berger Paints",
      colors: ["White", "Black", "Grey", "Brown"],
      volumes: ["1L", "4L", "10L"]
    },
    {
      name: "Nerolac",
      colors: ["White", "Cream", "Pink", "Orange"],
      volumes: ["1L", "4L", "10L", "20L"]
    }
  ];

  // Simulate network delay
  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getProducts(): Promise<MockProduct[]> {
    await this.delay(200);
    return this.products;
  }

  async getNextInvoiceNumber(): Promise<string> {
    await this.delay(100);
    return `INV-${this.invoiceCounter}`;
  }

  async createInvoice(invoice: Omit<MockInvoice, 'id' | 'invoiceNumber'>): Promise<{ invoiceId: string; invoiceNumber: string }> {
    await this.delay(800);
    
    const invoiceNumber = `INV-${this.invoiceCounter++}`;
    const newInvoice: MockInvoice = {
      ...invoice,
      id: Date.now().toString(),
      invoiceNumber
    };
    
    this.invoices.push(newInvoice);
    
    // Simulate printing delay
    setTimeout(() => {
      const invoiceIndex = this.invoices.findIndex(inv => inv.id === newInvoice.id);
      if (invoiceIndex !== -1) {
        this.invoices[invoiceIndex].printed = true;
      }
    }, 2000);
    
    return { 
      invoiceId: newInvoice.id, 
      invoiceNumber 
    };
  }

  async getInvoiceStatus(invoiceId: string): Promise<{ printed: boolean; invoiceNumber?: string }> {
    await this.delay(100);
    const invoice = this.invoices.find(inv => inv.id === invoiceId);
    return { 
      printed: invoice?.printed || false,
      invoiceNumber: invoice?.invoiceNumber
    };
  }

  async checkHealth(): Promise<boolean> {
    await this.delay(50);
    return true;
  }
}

export const mockApiService = new MockApiService();
