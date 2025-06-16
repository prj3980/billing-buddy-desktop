
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, FileText, BarChart3, Store, Plus, Wrench, TrendingUp } from "lucide-react";
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
    
    return {
      totalProducts: products.length,
      totalCustomers: customers.length
    };
  };

  if (showInvoiceBuilder) {
    return <InvoiceBuilder onClose={handleCloseInvoiceBuilder} />;
  }

  const stats = getQuickStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Jai Mata Di Saintary & Hardware Store</h1>
              <p className="text-gray-600 text-lg">Complete Billing & Inventory Management System</p>
            </div>
            <Button onClick={handleCreateInvoice} size="lg" className="shadow-lg bg-orange-600 hover:bg-orange-700 px-8 py-3 text-lg">
              <Plus className="h-6 w-6 mr-3" />
              Create New Invoice
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-white shadow-sm h-14">
            <TabsTrigger value="dashboard" className="flex items-center gap-3 text-base py-3">
              <BarChart3 className="h-5 w-5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-3 text-base py-3">
              <Wrench className="h-5 w-5" />
              Products
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-3 text-base py-3">
              <Users className="h-5 w-5" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-3 text-base py-3">
              <FileText className="h-5 w-5" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-3 text-base py-3">
              <TrendingUp className="h-5 w-5" />
              Reports & History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-3 text-base py-3">
              <Store className="h-5 w-5" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
                      <p className="text-3xl font-bold text-orange-600">{stats.totalProducts}</p>
                    </div>
                    <Wrench className="h-12 w-12 text-orange-600 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Customers</p>
                      <p className="text-3xl font-bold text-green-600">{stats.totalCustomers}</p>
                    </div>
                    <Users className="h-12 w-12 text-green-600 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>Common tasks and operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <Button onClick={handleCreateInvoice} className="h-16 flex items-center justify-start gap-4 text-left bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200">
                    <Plus className="h-8 w-8" />
                    <div>
                      <div className="font-semibold">Create Invoice</div>
                      <div className="text-sm opacity-70">Generate new invoice for customer</div>
                    </div>
                  </Button>
                  <Button onClick={() => setActiveTab("products")} variant="outline" className="h-16 flex items-center justify-start gap-4 text-left">
                    <Wrench className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="font-semibold">Manage Products</div>
                      <div className="text-sm opacity-70">Add or edit hardware items & supplies</div>
                    </div>
                  </Button>
                  <Button onClick={() => setActiveTab("customers")} variant="outline" className="h-16 flex items-center justify-start gap-4 text-left">
                    <Users className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="font-semibold">Manage Customers</div>
                      <div className="text-sm opacity-70">Add or edit customer information</div>
                    </div>
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
