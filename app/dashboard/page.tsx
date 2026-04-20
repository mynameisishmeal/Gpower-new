'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { ShoppingCart, Package, TrendingUp, Users, AlertTriangle, Plus, LogOut } from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
  firstname?: string;
  lastname?: string;
}

interface DashboardStats {
  todayRevenue: number;
  productsSold: number;
  activeUsers: number;
  lowStock: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    productsSold: 0,
    activeUsers: 0,
    lowStock: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchStats();
    }
  }, [router]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-2 uppercase tracking-wide">Overview</p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, <span className="font-semibold">{user.firstname || user.email}</span>
                <span className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs rounded-full uppercase font-bold">
                  {user.role}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/sell/mixed" className="btn-modern bg-blue-600 text-white px-4 md:px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 text-sm md:text-base">
                <Plus className="h-5 w-5" />
                New Sale
              </Link>
              <button onClick={handleLogout} className="btn-modern bg-white text-gray-700 px-4 md:px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 border border-gray-300 flex items-center gap-2 text-sm md:text-base">
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-shadow bg-white rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-shadow bg-white rounded-xl p-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Today's Sales</p>
              <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold">Live</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">₦{stats.todayRevenue.toLocaleString()}</h2>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                12%
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
          </div>

          <div className="card-shadow bg-white rounded-xl p-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Products Sold</p>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{stats.productsSold}</h2>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Items Today</span>
              <span className="text-green-600 text-sm font-semibold">+8%</span>
            </div>
          </div>

          <div className="card-shadow bg-white rounded-xl p-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Active Users</p>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{stats.activeUsers}</h2>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Online Now</span>
              <span className="text-blue-600 text-sm font-semibold">Live</span>
            </div>
          </div>

          <Link href="/stock?filter=low" className="card-shadow bg-white rounded-xl p-6 animate-fade-in-up hover:shadow-xl transition-shadow cursor-pointer" style={{animationDelay: '0.4s'}}>
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm text-orange-600 font-semibold uppercase tracking-wide">Low Stock</p>
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-4xl font-bold text-orange-600 mb-4">{stats.lowStock}</h2>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Items Need Restock</span>
              <span className="text-orange-600 text-sm font-semibold">View →</span>
            </div>
          </Link>
        </div>
        )}

        {/* Quick Actions */}
        <div className="card-shadow bg-white rounded-xl animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/sell/mixed" className="btn-modern bg-blue-600 text-white rounded-xl p-6 md:p-8 flex flex-col items-center justify-center gap-4 hover:bg-blue-700 group">
                <ShoppingCart className="h-8 md:h-10 w-8 md:w-10 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-base md:text-lg">New Sale</span>
              </Link>

              <Link href="/products" className="btn-modern border-2 border-blue-600 text-blue-600 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center gap-4 hover:bg-blue-50 group">
                <Package className="h-8 md:h-10 w-8 md:w-10 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-base md:text-lg">Products</span>
              </Link>

              <Link href="/sales/history" className="btn-modern border-2 border-blue-600 text-blue-600 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center gap-4 hover:bg-blue-50 group">
                <TrendingUp className="h-8 md:h-10 w-8 md:w-10 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-base md:text-lg">Sales History</span>
              </Link>

              <Link href="/users" className="btn-modern border-2 border-blue-600 text-blue-600 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center gap-4 hover:bg-blue-50 group">
                <Users className="h-8 md:h-10 w-8 md:w-10 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-base md:text-lg">Users</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      </div>
    </>
  );
}
