
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/30">
            <div className="space-y-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Jai Mata Di Saintary & Hardware Store
              </h1>
              <p className="text-gray-700 text-xl flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-purple-500" />
                Complete Billing & Inventory Management System
              </p>
            </div>
            <Button 
              onClick={handleCreateInvoice} 
              size="lg" 
              className="shadow-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 px-10 py-6 text-xl font-semibold transform hover:scale-110 transition-all duration-300 rounded-2xl"
            >
              <Plus className="h-7 w-7 mr-3" />
              Create New Invoice
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-6 mb-10 bg-white/95 backdrop-blur-lg shadow-xl h-20 rounded-2xl border border-white/30 p-2">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-3 text-lg py-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <BarChart3 className="h-6 w-6" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="flex items-center gap-3 text-lg py-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Wrench className="h-6 w-6" />
              Products
            </TabsTrigger>
            <TabsTrigger 
              value="customers" 
              className="flex items-center gap-3 text-lg py-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Users className="h-6 w-6" />
              Customers
            </TabsTrigger>
            <TabsTrigger 
              value="invoices" 
              className="flex items-center gap-3 text-lg py-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <FileText className="h-6 w-6" />
              Invoices
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center gap-3 text-lg py-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <TrendingUp className="h-6 w-6" />
              Reports
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-3 text-lg py-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Store className="h-6 w-6" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <Card className="bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 mb-2 font-medium text-lg">Total Products</p>
                      <p className="text-5xl font-bold">{stats.totalProducts}</p>
                    </div>
                    <Wrench className="h-20 w-20 text-orange-200 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-teal-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 mb-2 font-medium text-lg">Customers</p>
                      <p className="text-5xl font-bold">{stats.totalCustomers}</p>
                    </div>
                    <Users className="h-20 w-20 text-green-200 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 mb-2 font-medium text-lg">Today's Invoices</p>
                      <p className="text-5xl font-bold">{stats.todayInvoices}</p>
                    </div>
                    <FileText className="h-20 w-20 text-blue-200 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 mb-2 font-medium text-lg">Today's Revenue</p>
                      <p className="text-3xl font-bold">₹{stats.todayRevenue.toFixed(2)}</p>
                    </div>
                    <TrendingUp className="h-20 w-20 text-purple-200 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-white/30 rounded-3xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-8">
                    <CardTitle className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-lg">Common tasks and operations</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Button 
                        onClick={handleCreateInvoice} 
                        className="h-24 flex items-center justify-start gap-4 text-left bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl transform hover:scale-105 transition-all duration-300 rounded-2xl p-6"
                      >
                        <Plus className="h-12 w-12" />
                        <div>
                          <div className="font-bold text-xl">Create Invoice</div>
                          <div className="text-sm opacity-90">Generate new invoice for customer</div>
                        </div>
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("products")} 
                        variant="outline" 
                        className="h-24 flex items-center justify-start gap-4 text-left border-3 border-green-200 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:border-green-500 transform hover:scale-105 transition-all duration-300 rounded-2xl p-6"
                      >
                        <Wrench className="h-12 w-12 text-green-600" />
                        <div>
                          <div className="font-bold text-xl">Manage Products</div>
                          <div className="text-sm opacity-70">Add or edit hardware items & supplies</div>
                        </div>
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("customers")} 
                        variant="outline" 
                        className="h-24 flex items-center justify-start gap-4 text-left border-3 border-blue-200 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white hover:border-blue-500 transform hover:scale-105 transition-all duration-300 rounded-2xl p-6"
                      >
                        <Users className="h-12 w-12 text-blue-600" />
                        <div>
                          <div className="font-bold text-xl">Manage Customers</div>
                          <div className="text-sm opacity-70">Add or edit customer information</div>
                        </div>
                      </Button>
                      <Button 
                        onClick={() => window.open('/mobile', '_blank')} 
                        variant="outline" 
                        className="h-24 flex items-center justify-start gap-4 text-left border-3 border-indigo-200 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white hover:border-indigo-500 transform hover:scale-105 transition-all duration-300 rounded-2xl p-6"
                      >
                        <Smartphone className="h-12 w-12 text-indigo-600" />
                        <div>
                          <div className="font-bold text-xl">Mobile Interface</div>
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
