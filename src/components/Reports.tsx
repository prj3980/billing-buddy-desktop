import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, DollarSign, FileText, Calendar, Lock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Invoice {
  id: string;
  date: string;
  total: number;
  status: string;
  items: Array<{
    productName: string;
    quantity: number;
    total: number;
  }>;
}

const Reports = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFakeData, setShowFakeData] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Ankur07') {
      setIsAuthenticated(true);
      setShowFakeData(false);
      setPasswordError('');
    } else if (password === 'JMD123') {
      setIsAuthenticated(true);
      setShowFakeData(true);
      setPasswordError('');
    } else {
      setPasswordError('Invalid password');
    }
  };

  const getRevenueData = () => {
    if (showFakeData) return [];
    
    const now = new Date();
    const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      
      if (reportPeriod === 'daily') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return invoiceDate >= sevenDaysAgo;
      } else {
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        return invoiceDate >= twelveMonthsAgo;
      }
    });

    if (reportPeriod === 'daily') {
      const dailyData: { [key: string]: number } = {};
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        dailyData[dateKey] = 0;
      }

      filteredInvoices.forEach(invoice => {
        const dateKey = invoice.date;
        if (dailyData.hasOwnProperty(dateKey)) {
          dailyData[dateKey] += invoice.total;
        }
      });

      return Object.entries(dailyData).map(([date, revenue]) => ({
        period: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue
      }));
    } else {
      const monthlyData: { [key: string]: number } = {};
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = 0;
      }

      filteredInvoices.forEach(invoice => {
        const invoiceDate = new Date(invoice.date);
        const monthKey = `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey] += invoice.total;
        }
      });

      return Object.entries(monthlyData).map(([month, revenue]) => ({
        period: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue
      }));
    }
  };

  const getTopProducts = () => {
    if (showFakeData) return [];
    
    const productSales: { [key: string]: { quantity: number; revenue: number } } = {};
    
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        if (!productSales[item.productName]) {
          productSales[item.productName] = { quantity: 0, revenue: 0 };
        }
        productSales[item.productName].quantity += item.quantity;
        productSales[item.productName].revenue += item.total;
      });
    });

    return Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const getInvoiceStatusData = () => {
    if (showFakeData) return [];
    
    const statusCounts: { [key: string]: number } = {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0
    };

    invoices.forEach(invoice => {
      statusCounts[invoice.status] = (statusCounts[invoice.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }));
  };

  const getOverallStats = () => {
    if (showFakeData) {
      return {
        totalRevenue: 0,
        paidRevenue: 0,
        averageInvoiceValue: 0,
        totalInvoices: 0,
        paidInvoices: 0
      };
    }
    
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const paidRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const averageInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

    return {
      totalRevenue,
      paidRevenue,
      averageInvoiceValue,
      totalInvoices: invoices.length,
      paidInvoices: paidInvoices.length
    };
  };

  const getBasicStats = () => {
    // Only show basic counts, no financial data
    return {
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
      draftInvoices: invoices.filter(inv => inv.status === 'draft').length,
      sentInvoices: invoices.filter(inv => inv.status === 'sent').length,
    };
  };

  if (!isAuthenticated) {
    const basicStats = getBasicStats();
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Track your business performance</p>
          </div>
        </div>

        {/* Basic Stats - No Financial Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{basicStats.totalInvoices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{basicStats.paidInvoices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Invoices</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{basicStats.draftInvoices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent Invoices</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{basicStats.sentInvoices}</div>
            </CardContent>
          </Card>
        </div>

        {/* Password Protected Section */}
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle>Access Financial Reports</CardTitle>
              <CardDescription>Revenue, detailed analytics, and financial data require password authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                  {passwordError && (
                    <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  Access Financial Reports
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const revenueData = getRevenueData();
  const topProducts = getTopProducts();
  const statusData = getInvoiceStatusData();
  const stats = getOverallStats();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Track your business performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Last 7 Days</SelectItem>
              <SelectItem value="monthly">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            Logout
          </Button>
        </div>
      </div>

      {/* Financial Stats - Password Protected */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.paidRevenue.toFixed(2)}</div>
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
            <CardTitle className="text-sm font-medium">Avg Invoice Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.averageInvoiceValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics - Password Protected */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              {reportPeriod === 'daily' ? 'Daily revenue for the last 7 days' : 'Monthly revenue for the last 12 months'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Status Distribution</CardTitle>
            <CardDescription>Current status of all invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Products ranked by total revenue</CardDescription>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">Sold: {product.quantity} units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{product.revenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {showFakeData ? 'No data available' : 'No sales data available yet. Create some invoices to see reports.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
