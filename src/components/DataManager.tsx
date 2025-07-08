
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileText, Database, AlertTriangle } from "lucide-react";
import { exportAllData, downloadJSON, downloadCSV, importData, restoreData } from "@/utils/dataExport";

const DataManager = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleExportJSON = () => {
    const data = exportAllData();
    const filename = `billing-buddy-backup-${new Date().toISOString().split('T')[0]}.json`;
    downloadJSON(data, filename);
    
    toast({
      title: "Data Exported",
      description: "All data has been exported as JSON file",
    });
  };

  const handleExportInvoicesCSV = () => {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    if (invoices.length === 0) {
      toast({
        title: "No Data",
        description: "No invoices found to export",
        variant: "destructive",
      });
      return;
    }

    const filename = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(invoices, filename);
    
    toast({
      title: "Invoices Exported",
      description: "Invoices have been exported as CSV file",
    });
  };

  const handleExportProductsCSV = () => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    if (products.length === 0) {
      toast({
        title: "No Data",
        description: "No products found to export",
        variant: "destructive",
      });
      return;
    }

    const filename = `products-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(products, filename);
    
    toast({
      title: "Products Exported",
      description: "Products have been exported as CSV file",
    });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await importData(file);
      restoreData(data);
      
      toast({
        title: "Data Imported Successfully",
        description: "All data has been restored from backup",
      });
      
      // Refresh the page to load new data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const getDataStats = () => {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    return {
      invoices: invoices.length,
      products: products.length,
      customers: customers.length
    };
  };

  const stats = getDataStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Statistics
          </CardTitle>
          <CardDescription>
            Current data stored in your browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.invoices}</div>
              <div className="text-sm text-gray-600">Invoices</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.products}</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.customers}</div>
              <div className="text-sm text-gray-600">Customers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download your data for backup or analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleExportJSON} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Complete Backup (JSON)
            </Button>
            <Button onClick={handleExportInvoicesCSV} variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoices (CSV)
            </Button>
            <Button onClick={handleExportProductsCSV} variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Products (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Restore data from a backup file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Warning: This will replace all existing data</span>
          </div>
          <div>
            <Label htmlFor="import-file">Select Backup File (JSON)</Label>
            <Input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="mt-1"
            />
          </div>
          {isImporting && (
            <div className="text-sm text-gray-600">Importing data...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManager;
