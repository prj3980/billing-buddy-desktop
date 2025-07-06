import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, FileText, BarChart3, Store, Plus, Wrench, TrendingUp, Sparkles, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Products from "@/components/Products";
import Customers from "@/components/Customers";
import Invoices from "@/components/Invoices";
import InvoiceBuilder from "@/components/InvoiceBuilder";
import Reports from "@/components/Reports";
import StoreSettings from "@/components/StoreSettings";
import ConnectionInfo from "@/components/ConnectionInfo";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);
  const [highlightInvoiceId, setHighlightInvoiceId] = useState<string | undefined>();

  const handleCreateInvoice = () => {
    setShowInvoiceBuilder(true);
  };

  const handleCloseInvoiceBuilder = (newInvoiceId?: string) => {
    setShowInvoiceBuilder(false);
    if (newInvoiceId) {
      setHighlightInvoiceId(newInvoiceId);
      setActiveTab("invoices");
    }
  };

  // Quick stats for dashboard
  const getQuickStats = () => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const todayInvoices = invoices.filter((inv: any) => 
      new Date(inv.date).toDateString() === new Date().toDateString()
    );
    const todayRevenue = todayInvoices.reduce((sum: number, inv: any) => sum + inv.total, 0);
    
    return {
      totalProducts: products.length,
      totalCustomers: customers.length,
      todayInvoices: todayInvoices.length,
      todayRevenue: todayRevenue
    };
  };

  if (showInvoiceBuilder) {
    return <InvoiceBuilder onClose={handleCloseInvoiceBuilder} />;
  }

  const stats = getQuickStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Jai Mata Di Saintary & Hardware Store
              </h1>
              <p className="text-gray-700 text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500" />
                Complete Billing & Inventory Management System
              </p>
            </div>
            <Button 
              onClick={handleCreateInvoice} 
              size="lg" 
              className="shadow-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-8 py-4 text-lg transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-6 w-6 mr-3" />
              Create New Invoice
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-white/90 backdrop-blur-sm shadow-lg h-16 rounded-xl border border-white/20">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-3 text-base py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg"
            >
              <BarChart3 className="h-5 w-5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="flex items-center gap-3 text-base py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg"
            >
              <Wrench className="h-5 w-5" />
              Products
            </TabsTrigger>
            <TabsTrigger 
              value="customers" 
              className="flex items-center gap-3 text-base py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg"
            >
              <Users className="h-5 w-5" />
              Customers
            </TabsTrigger>
            <TabsTrigger 
              value="invoices" 
              className="flex items-center gap-3 text-base py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg"
            >
              <FileText className="h-5 w-5" />
              Invoices
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center gap-3 text-base py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white rounded-lg"
            >
              <TrendingUp className="h-5 w-5" />
              Reports
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-3 text-base py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg"
            >
              <Store className="h-5 w-5" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 mb-1 font-medium">Total Products</p>
                      <p className="text-4xl font-bold">{stats.totalProducts}</p>
                    </div>
                    <Wrench className="h-16 w-16 text-orange-200 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 mb-1 font-medium">Customers</p>
                      <p className="text-4xl font-bold">{stats.totalCustomers}</p>
                    </div>
                    <Users className="h-16 w-16 text-green-200 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 mb-1 font-medium">Today's Invoices</p>
                      <p className="text-4xl font-bold">{stats.todayInvoices}</p>
                    </div>
                    <FileText className="h-16 w-16 text-blue-200 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100 mb-1 font-medium">Today's Revenue</p>
                      <p className="text-2xl font-bold">₹{stats.todayRevenue.toFixed(2)}</p>
                    </div>
                    <TrendingUp className="h-16 w-16 text-pink-200 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                    <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-gray-600">Common tasks and operations</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        onClick={handleCreateInvoice} 
                        className="h-20 flex items-center justify-start gap-4 text-left bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        <Plus className="h-10 w-10" />
                        <div>
                          <div className="font-semibold text-lg">Create Invoice</div>
                          <div className="text-sm opacity-90">Generate new invoice for customer</div>
                        </div>
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("products")} 
                        variant="outline" 
                        className="h-20 flex items-center justify-start gap-4 text-left border-2 border-green-200 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:border-green-500 transform hover:scale-105 transition-all duration-200"
                      >
                        <Wrench className="h-10 w-10 text-green-600" />
                        <div>
                          <div className="font-semibold text-lg">Manage Products</div>
                          <div className="text-sm opacity-70">Add or edit hardware items & supplies</div>
                        </div>
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("customers")} 
                        variant="outline" 
                        className="h-20 flex items-center justify-start gap-4 text-left border-2 border-blue-200 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white hover:border-blue-500 transform hover:scale-105 transition-all duration-200"
                      >
                        <Users className="h-10 w-10 text-blue-600" />
                        <div>
                          <div className="font-semibold text-lg">Manage Customers</div>
                          <div className="text-sm opacity-70">Add or edit customer information</div>
                        </div>
                      </Button>
                      <Button 
                        onClick={() => window.open('/mobile', '_blank')} 
                        variant="outline" 
                        className="h-20 flex items-center justify-start gap-4 text-left border-2 border-purple-200 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-purple-500 transform hover:scale-105 transition-all duration-200"
                      >
                        <Smartphone className="h-10 w-10 text-purple-600" />
                        <div>
                          <div className="font-semibold text-lg">Mobile Interface</div>
                          <div className="text-sm opacity-70">Create invoices on mobile device</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <ConnectionInfo />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <Products />
          </TabsContent>

          <TabsContent value="customers" className="mt-0">
            <Customers />
          </TabsContent>

          <TabsContent value="invoices" className="mt-0">
            <Invoices onCreateNew={handleCreateInvoice} highlightInvoiceId={highlightInvoiceId} />
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
