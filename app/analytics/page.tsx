'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Package, AlertTriangle, Users, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    totalProducts: 0,
    lowStock: 0,
    totalCustomers: 0,
    weekSales: [] as any[],
    topProducts: [] as any[],
    paymentMethods: [] as any[],
    salesByType: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const [salesDays, setSalesDays] = useState(7);
  const [topProductsCount, setTopProductsCount] = useState(5);
  const [salesDaysInput, setSalesDaysInput] = useState(7);
  const [topProductsInput, setTopProductsInput] = useState(5);

  useEffect(() => {
    fetchStats();
  }, [salesDays, topProductsCount]);

  const fetchStats = async () => {
    setLoading(true);
    const salesRes = await fetch('/api/sales/list');
    const salesData = await salesRes.json();
    
    const productsRes = await fetch('/api/products/list');
    const productsData = await productsRes.json();

    const stockRes = await fetch('/api/stock/list');
    const stockData = await stockRes.json();

    const customersRes = await fetch('/api/customers/list');
    const customersData = await customersRes.json();

    const total = salesData.sales?.reduce((sum: number, s: any) => 
      sum + parseFloat(s.producttotal || 0), 0) || 0;

    const today = new Date();
    const todayStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    const todayTotal = salesData.sales?.filter((s: any) => s.saledate === todayStr)
      .reduce((sum: number, s: any) => sum + parseFloat(s.producttotal || 0), 0) || 0;

    const lowStock = stockData.stocks?.filter((s: any) => s.stockquantity < 10).length || 0;

    // Sales trend for selected days
    const salesTrend = [];
    for (let i = salesDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
      const dayTotal = salesData.sales?.filter((s: any) => s.saledate === dateStr)
        .reduce((sum: number, s: any) => sum + parseFloat(s.producttotal || 0), 0) || 0;
      
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      salesTrend.push({
        date: `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`,
        sales: dayTotal,
        fullDate: d.toLocaleDateString()
      });
    }

    // Top 5 products
    const productSales: any = {};
    salesData.sales?.forEach((s: any) => {
      productSales[s.productname] = (productSales[s.productname] || 0) + parseFloat(s.producttotal || 0);
    });
    const topProducts = Object.entries(productSales)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, topProductsCount)
      .map(([name, value]: any) => ({ name, value }));

    // Payment methods breakdown
    const paymentBreakdown: any = {};
    salesData.sales?.forEach((s: any) => {
      const method = s.paymentmethod || 'tests';
      paymentBreakdown[method] = (paymentBreakdown[method] || 0) + parseFloat(s.producttotal || 0);
    });
    const paymentMethods = Object.entries(paymentBreakdown)
      .map(([name, value]: any) => ({ name, value }));

    // Sales by type
    const typeBreakdown: any = {};
    salesData.sales?.forEach((s: any) => {
      const type = s.saletype || 'tests';
      typeBreakdown[type] = (typeBreakdown[type] || 0) + parseFloat(s.producttotal || 0);
    });
    const salesByType = Object.entries(typeBreakdown)
      .map(([name, value]: any) => ({ name, value }));

    setStats({
      totalSales: total,
      todaySales: todayTotal,
      totalProducts: productsData.products?.length || 0,
      lowStock,
      totalCustomers: customersData.customers?.length || 0,
      weekSales: salesTrend,
      topProducts,
      paymentMethods,
      salesByType
    });
    setLoading(false);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-sm text-gray-600 font-semibold mb-1">Total Sales</h3>
                  <p className="text-2xl font-bold text-gray-900">₦{stats.totalSales.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-sm text-gray-600 font-semibold mb-1">Today's Sales</h3>
                  <p className="text-2xl font-bold text-gray-900">₦{stats.todaySales.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-600">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-sm text-gray-600 font-semibold mb-1">Total Products</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-600">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-sm text-gray-600 font-semibold mb-1">Low Stock Items</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-sm text-gray-600 font-semibold mb-1">Total Customers</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Sales Trend */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Sales Trend</h2>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Last</label>
                      <input 
                        type="number"
                        value={salesDaysInput}
                        onChange={(e) => setSalesDaysInput(Math.max(1, Number(e.target.value)))}
                        className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-center"
                        min="1"
                      />
                      <label className="text-sm text-gray-600">Days</label>
                      <button
                        onClick={() => setSalesDays(salesDaysInput)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                      >
                        View
                      </button>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={stats.weekSales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280" 
                        style={{ fontSize: '10px' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={salesDays > 30 ? Math.floor(salesDays / 10) : 0}
                      />
                      <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                      <Tooltip 
                        formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Sales']}
                        labelFormatter={(label: any) => {
                          const item = stats.weekSales.find(s => s.date === label);
                          return item?.fullDate || label;
                        }}
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#3B82F6" 
                        strokeWidth={3} 
                        name="Daily Sales"
                        dot={{ fill: '#3B82F6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Top Products by Revenue</h2>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Top</label>
                      <input 
                        type="number"
                        value={topProductsInput}
                        onChange={(e) => setTopProductsInput(Math.max(1, Number(e.target.value)))}
                        className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-center"
                        min="1"
                      />
                      <button
                        onClick={() => setTopProductsCount(topProductsInput)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                      >
                        View
                      </button>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={stats.topProducts} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={120}
                        interval={0}
                        stroke="#6B7280"
                        style={{ fontSize: topProductsCount > 10 ? '9px' : '11px' }}
                      />
                      <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                      <Tooltip 
                        formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Revenue']}
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Bar dataKey="value" fill="#10B981" name="Revenue" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Methods Distribution</h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={stats.paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={(entry) => `${entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: ₦${entry.value.toLocaleString()}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => `₦${value.toLocaleString()}`}
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry: any) => `${entry.payload.name.charAt(0).toUpperCase() + entry.payload.name.slice(1)}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Sales by Type */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Sales by Type Distribution</h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={stats.salesByType}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={(entry) => `${entry.name}: ₦${entry.value.toLocaleString()}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.salesByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => `₦${value.toLocaleString()}`}
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
