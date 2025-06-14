
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, FileText, BarChart3, Store, Plus, Palette, TrendingUp } from "lucide-react";
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
    const paidInvoices = invoices.filter((inv: any) => inv.status === 'paid');
    const unpaidInvoices = invoices.filter((inv: any) => inv.status !== 'paid');
    
    return {
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalInvoices: invoices.length,
      paidInvoices: paidInvoices.length,
      unpaidInvoices: unpaidInvoices.length,
      totalRevenue: invoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0),
      paidRevenue: paidInvoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0),
      pendingRevenue: unpaidInvoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0)
    };
  };

  if (showInvoiceBuilder) {
    return <InvoiceBuilder onClose={handleCloseInvoiceBuilder} />;
  }

  const stats = getQuickStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Paint Store Billing System</h1>
              <p className="text-gray-600 text-lg">Professional invoice management for paint retailers</p>
            </div>
            <Button onClick={handleCreateInvoice} size="lg" className="shadow-lg bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">
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
              <Palette className="h-5 w-5" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.totalProducts}</p>
                    </div>
                    <Palette className="h-12 w-12 text-blue-600 opacity-80" />
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
              
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Invoices</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.totalInvoices}</p>
                      <p className="text-sm text-gray-500">Paid: {stats.paidInvoices} | Unpaid: {stats.unpaidInvoices}</p>
                    </div>
                    <FileText className="h-12 w-12 text-purple-600 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-orange-600">₹{stats.totalRevenue.toFixed(2)}</p>
                      <p className="text-sm text-green-600">Collected: ₹{stats.paidRevenue.toFixed(2)}</p>
                      <p className="text-sm text-red-600">Pending: ₹{stats.pendingRevenue.toFixed(2)}</p>
                    </div>
                    <BarChart3 className="h-12 w-12 text-orange-600 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                  <CardDescription>Common tasks and operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <Button onClick={handleCreateInvoice} className="h-16 flex items-center justify-start gap-4 text-left bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200">
                      <Plus className="h-8 w-8" />
                      <div>
                        <div className="font-semibold">Create Invoice</div>
                        <div className="text-sm opacity-70">Generate new invoice for customer</div>
                      </div>
                    </Button>
                    <Button onClick={() => setActiveTab("products")} variant="outline" className="h-16 flex items-center justify-start gap-4 text-left">
                      <Palette className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="font-semibold">Manage Products</div>
                        <div className="text-sm opacity-70">Add or edit paint products</div>
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

              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Business Overview</CardTitle>
                  <CardDescription>Recent business insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-green-800">Revenue Collected</p>
                        <p className="text-2xl font-bold text-green-600">₹{stats.paidRevenue.toFixed(2)}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-orange-800">Pending Collection</p>
                        <p className="text-2xl font-bold text-orange-600">₹{stats.pendingRevenue.toFixed(2)}</p>
                      </div>
                      <FileText className="h-8 w-8 text-orange-600" />
                    </div>

                    <div className="text-center pt-4">
                      <Button onClick={() => setActiveTab("reports")} variant="outline" className="w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Detailed Reports
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
