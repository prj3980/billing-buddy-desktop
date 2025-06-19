
import { mockApiService } from './mockApi';

// API interceptor to handle mock API calls
export class ApiInterceptor {
  private static instance: ApiInterceptor;
  private isElectron: boolean;

  constructor() {
    this.isElectron = !!(window as any).electronAPI?.isElectron;
    this.setupInterceptor();
  }

  static getInstance(): ApiInterceptor {
    if (!ApiInterceptor.instance) {
      ApiInterceptor.instance = new ApiInterceptor();
    }
    return ApiInterceptor.instance;
  }

  private setupInterceptor() {
    // Override fetch for API calls
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Check if it's an API call that should be mocked
      if (url.startsWith('/api/') || (this.isElectron && url.includes('/api/'))) {
        return this.handleMockApiCall(url, init);
      }
      
      // For non-API calls, use original fetch
      return originalFetch(input, init);
    };
  }

  private async handleMockApiCall(url: string, init?: RequestInit): Promise<Response> {
    const method = init?.method || 'GET';
    const pathname = new URL(url, window.location.origin).pathname;
    
    try {
      switch (true) {
        case pathname === '/api/health':
          const isHealthy = await mockApiService.checkHealth();
          return this.createResponse({ healthy: isHealthy });
          
        case pathname === '/api/products':
          const products = await mockApiService.getProducts();
          return this.createResponse(products);
          
        case pathname === '/api/invoices/next-number':
          const nextNumber = await mockApiService.getNextInvoiceNumber();
          return this.createResponse({ nextInvoiceNumber: nextNumber });
          
        case pathname === '/api/invoices' && method === 'POST':
          const invoiceData = JSON.parse(init?.body as string);
          const result = await mockApiService.createInvoice(invoiceData);
          return this.createResponse(result);
          
        case pathname.startsWith('/api/invoices/status/'):
          const invoiceId = pathname.split('/').pop();
          if (invoiceId) {
            const status = await mockApiService.getInvoiceStatus(invoiceId);
            return this.createResponse(status);
          }
          return this.createErrorResponse('Invoice not found', 404);
          
        default:
          return this.createErrorResponse('API endpoint not found', 404);
      }
    } catch (error) {
      console.error('Mock API error:', error);
      return this.createErrorResponse('Internal server error', 500);
    }
  }

  private createResponse(data: any, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private createErrorResponse(message: string, status: number): Response {
    return this.createResponse({ error: message }, status);
  }
}

// Initialize the interceptor
export const initializeApiInterceptor = () => {
  ApiInterceptor.getInstance();
};
