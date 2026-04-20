'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { ArrowLeft, Calendar, Loader2, User } from 'lucide-react';
import Link from 'next/link';

export default function CustomerSalesPage() {
  const params = useParams();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<any>(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    saletype: 'all',
    paymentmethod: ''
  });

  useEffect(() => {
    fetchCustomer();
    fetchSales();
  }, [customerId]);

  const fetchCustomer = async () => {
    const res = await fetch(`/api/customers/get?id=${customerId}`);
    const data = await res.json();
    setCustomer(data.customer);
  };

  const fetchSales = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('customerId', customerId);
    if (filters.date) params.append('date', filters.date);
    if (filters.saletype && filters.saletype !== 'all') params.append('saletype', filters.saletype);
    if (filters.paymentmethod) params.append('paymentmethod', filters.paymentmethod);

    const res = await fetch(`/api/sales/list?${params.toString()}`);
    const data = await res.json();
    setSales(data.sales || []);
    setLoading(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchSales();
  };

  const calculateTotal = () => {
    return sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.producttotal || 0), 0);
  };

  const calculateByPaymentMethod = () => {
    const totals: any = {};
    sales.forEach((sale: any) => {
      const method = sale.paymentmethod || 'unknown';
      totals[method] = (totals[method] || 0) + parseFloat(sale.producttotal || 0);
    });
    return totals;
  };

  const paymentTotals = calculateByPaymentMethod();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/customers" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-4">
              <ArrowLeft className="h-5 w-5" />
              Back to Customers
            </Link>
            
            {customer && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                    <p className="text-gray-600">{customer.email || customer.phone || 'No contact info'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-semibold mb-1">Total Purchases</p>
                    <p className="text-2xl font-bold text-green-700">₦{(customer.totalPurchases || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-semibold mb-1">Total Transactions</p>
                    <p className="text-2xl font-bold text-blue-700">{sales.length}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 font-semibold mb-1">Last Purchase</p>
                    <p className="text-lg font-bold text-purple-700">
                      {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                  />
                  <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Type</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  value={filters.saletype}
                  onChange={(e) => handleFilterChange('saletype', e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Cartons">Cartons</option>
                  <option value="Kilos">Kilos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  value={filters.paymentmethod}
                  onChange={(e) => handleFilterChange('paymentmethod', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="cash">Cash</option>
                  <option value="transfer">Transfer</option>
                  <option value="card">Card</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
            </div>

            <button 
              onClick={applyFilters}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              Apply Filters
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 text-lg">Loading sales data...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">₦{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
                {Object.entries(paymentTotals).map(([method, total]: [string, any]) => (
                  <div key={method} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="text-sm text-gray-600 capitalize mb-1">{method}</div>
                    <div className="text-xl font-bold text-green-600">₦{total.toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <tr>
                        <th className="px-4 py-4 text-left text-sm font-semibold">Sale #</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold">Product</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold">Price</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold">Quantity</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold">Total</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold">Payment</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold">Type</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                            No sales found for this customer
                          </td>
                        </tr>
                      ) : (
                        sales.map((sale: any, i) => (
                          <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">{sale.sale_no}</td>
                            <td className="px-4 py-3 font-medium">{sale.productname}</td>
                            <td className="px-4 py-3">₦{parseFloat(sale.productprice).toLocaleString()}</td>
                            <td className="px-4 py-3">{sale.productquantity}</td>
                            <td className="px-4 py-3 font-semibold">₦{parseFloat(sale.producttotal).toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                                sale.paymentmethod === 'credit' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {sale.paymentmethod}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${sale.saletype === 'Cartons' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                {sale.saletype}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{sale.saledate}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
