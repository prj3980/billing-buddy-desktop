
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Package, FileText, BarChart3, Plus } from "lucide-react";
import Products from "@/components/Products";
import Customers from "@/components/Customers";
import Invoices from "@/components/Invoices";
import Reports from "@/components/Reports";
import InvoiceBuilder from "@/components/InvoiceBuilder";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);

  // Get stats from localStorage
  const getStats = () => {
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

  const stats = getStats();

  const renderContent = () => {
    if (showInvoiceBuilder) {
      return <InvoiceBuilder onClose={() => setShowInvoiceBuilder(false)} />;
    }

    switch (activeTab) {
      case 'products':
        return <Products />;
      case 'customers':
        return <Customers />;
      case 'invoices':
        return <Invoices onCreateNew={() => setShowInvoiceBuilder(true)} />;
      case 'reports':
        return <Reports />;
      default:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Billing Dashboard</h1>
                <p className="text-muted-foreground">Manage your business operations</p>
              </div>
              <Button onClick={() => setShowInvoiceBuilder(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalInvoices}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('products')}>
                    <Package className="h-4 w-4 mr-2" />
                    Manage Products
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('customers')}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Customers
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowInvoiceBuilder(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest business activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Welcome to your billing system! Start by adding products and customers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4 lg:space-x-6">
            <h2 className="text-lg font-semibold">BillingBuddy</h2>
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'products' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('products')}
            >
              Products
            </Button>
            <Button
              variant={activeTab === 'customers' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('customers')}
            >
              Customers
            </Button>
            <Button
              variant={activeTab === 'invoices' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('invoices')}
            >
              Invoices
            </Button>
            <Button
              variant={activeTab === 'reports' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('reports')}
            >
              Reports
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
