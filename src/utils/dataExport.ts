
export interface ExportData {
  invoices: any[];
  products: any[];
  customers: any[];
  storeSettings: any;
  exportDate: string;
}

export const exportAllData = (): ExportData => {
  const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const customers = JSON.parse(localStorage.getItem('customers') || '[]');
  const storeSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');

  return {
    invoices,
    products,
    customers,
    storeSettings,
    exportDate: new Date().toISOString()
  };
};

export const downloadJSON = (data: any, filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header];
        const cellStr = typeof cell === 'string' ? cell : JSON.stringify(cell);
        return `"${cellStr.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<ExportData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const restoreData = (data: ExportData) => {
  localStorage.setItem('invoices', JSON.stringify(data.invoices));
  localStorage.setItem('products', JSON.stringify(data.products));
  localStorage.setItem('customers', JSON.stringify(data.customers));
  localStorage.setItem('storeSettings', JSON.stringify(data.storeSettings));
};
