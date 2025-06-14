
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, FileText, BarChart3, Store, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Products from "@/components/Products";
import Customers from "@/components/Customers";
import Invoices from "@/components/Invoices";
import InvoiceBuilder from "@/components/InvoiceBuilder";
import Reports from "@/components/Reports";
import StoreSettings from "@/components/StoreSettings";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);

  const handleCreateInvoice = () => {
    setShowInvoiceBuilder(true);
  };

  const handleCloseInvoiceBuilder = () => {
    setShowInvoiceBuilder(false);
  };

  // Quick stats for dashboard
  const getQuickStats = () => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    
    return {
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalInvoices: invoices.length,
      totalRevenue: invoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0)
    };
  };

  if (showInvoiceBuilder) {
    return <InvoiceBuilder onClose={handleCloseInvoiceBuilder} />;
  }

  const stats = getQuickStats();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing System</h1>
              <p className="text-gray-600 mt-1">Manage your business efficiently</p>
            </div>
            <Button onClick={handleCreateInvoice} size="lg" className="shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Products</p>
                      <p className="text-2xl font-bold">{stats.totalProducts}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Customers</p>
                      <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Invoices</p>
                      <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                    </div>
                    <FileText className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={handleCreateInvoice} variant="outline" className="h-20 flex-col">
                    <Plus className="h-6 w-6 mb-2" />
                    Create Invoice
                  </Button>
                  <Button onClick={() => setActiveTab("products")} variant="outline" className="h-20 flex-col">
                    <Package className="h-6 w-6 mb-2" />
                    Add Product
                  </Button>
                  <Button onClick={() => setActiveTab("customers")} variant="outline" className="h-20 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    Add Customer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <Products />
          </TabsContent>

          <TabsContent value="customers" className="mt-0">
            <Customers />
          </TabsContent>

          <TabsContent value="invoices" className="mt-0">
            <Invoices onCreateNew={handleCreateInvoice} />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <Reports />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <StoreSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
