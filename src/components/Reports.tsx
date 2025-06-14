
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, DollarSign, FileText } from "lucide-react";
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

  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
  }, []);

  const getRevenueData = () => {
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
        <Select value={reportPeriod} onValueChange={setReportPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Last 7 Days</SelectItem>
            <SelectItem value="monthly">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
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

      {/* Charts */}
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

      {/* Top Products */}
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
              No sales data available yet. Create some invoices to see reports.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
