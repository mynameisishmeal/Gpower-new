'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Calendar, Search, Loader2, Download, X, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function SalesHistoryPage() {
  const { showToast, ToastContainer } = useToast();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({ key: 'sale_no', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [totalSales, setTotalSales] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [filters, setFilters] = useState({
    date: '',
    seller: '',
    saletype: 'all',
    paymentmethod: ''
  });

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [currentPage, itemsPerPage]);

  const fetchSellers = async () => {
    try {
      const res = await fetch('/api/users/list');
      const data = await res.json();
      setSellers(data.users?.map((u: any) => u.email) || []);
    } catch (error) {
      showToast('Failed to load sellers', 'error');
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.seller) params.append('seller', filters.seller);
      if (filters.saletype && filters.saletype !== 'all') params.append('saletype', filters.saletype);
      if (filters.paymentmethod) params.append('paymentmethod', filters.paymentmethod);
      
      // Add pagination params
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());

      const res = await fetch(`/api/sales/list?${params.toString()}`);
      const data = await res.json();
      
      setSales(data.sales || []);
      setTotalSales(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 0);
      setTotalAmount(data.pagination?.totalAmount || 0);
    } catch (error) {
      showToast('Failed to load sales', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sortSales = (salesData: any[], key: string, direction: 'asc' | 'desc') => {
    return [...salesData].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      // Handle numeric fields
      if (key === 'sale_no' || key === 'productprice' || key === 'productquantity' || key === 'producttotal') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    const sortedSales = sortSales(sales, key, direction);
    setSales(sortedSales);
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  // Pagination logic - now using server-side data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + sales.length;
  const currentSales = sales; // Already paginated from server

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchSales();
  };

  const clearFilters = () => {
    setFilters({
      date: '',
      seller: '',
      saletype: 'all',
      paymentmethod: ''
    });
    setCurrentPage(1);
    showToast('Filters cleared', 'success');
  };

  const hasActiveFilters = () => {
    return filters.date || filters.seller || filters.saletype !== 'all' || filters.paymentmethod;
  };

  const sellerOptions = sellers.map(s => ({ value: s, label: s }));

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">Sales History</h1>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Seller</label>
                <SearchableSelect
                  options={[{ value: '', label: 'All Sellers' }, ...sellerOptions]}
                  value={filters.seller}
                  onChange={(value) => handleFilterChange('seller', value)}
                  placeholder="Select Seller"
                />
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

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={applyFilters}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold"
              >
                <Search className="h-5 w-5" />
                Apply Filters
              </button>
              <button 
                onClick={() => showToast('Export feature coming soon!', 'info')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all font-semibold"
              >
                <Download className="h-5 w-5" />
                Export to Excel
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 text-lg">Loading sales data...</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <span className="text-xl font-semibold text-gray-800">
                      {hasActiveFilters() ? 'Filtered Sales Total:' : 'Total Sales:'}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Showing {startIndex + 1}-{endIndex} of {totalSales.toLocaleString()} transaction{totalSales !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 font-semibold">Per page:</label>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                        <option value={500}>500</option>
                      </select>
                    </div>
                    <span className="text-3xl font-bold text-blue-600">₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Mobile Card View */}
                <div className="md:hidden">
                  {currentSales.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No sales found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {currentSales.map((sale: any, i) => (
                        <div key={i} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{sale.productname}</p>
                              <p className="text-xs text-gray-500">Sale #{sale.sale_no}</p>
                            </div>
                            <span className="text-lg font-bold text-blue-600">₦{parseFloat(sale.producttotal).toLocaleString()}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Quantity:</span>
                              <span className="ml-1 font-medium">{sale.productquantity}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Price:</span>
                              <span className="ml-1 font-medium">₦{parseFloat(sale.productprice).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Type:</span>
                              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${sale.saletype === 'Cartons' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                {sale.saletype}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Payment:</span>
                              <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs capitalize">
                                {sale.paymentmethod}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                            <div>Seller: {sale.seller}</div>
                            <div>Date: {sale.saledate}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <tr>
                        <th 
                          onClick={() => handleSort('sale_no')} 
                          className="px-4 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Sale #
                            {getSortIcon('sale_no')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('productname')} 
                          className="px-4 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Product
                            {getSortIcon('productname')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('productprice')} 
                          className="px-4 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Price
                            {getSortIcon('productprice')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('productquantity')} 
                          className="px-4 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Quantity
                            {getSortIcon('productquantity')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('producttotal')} 
                          className="px-4 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Total
                            {getSortIcon('producttotal')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('paymentmethod')} 
                          className="px-4 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Payment
                            {getSortIcon('paymentmethod')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('saletype')} 
                          className="px-4 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Type
                            {getSortIcon('saletype')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('seller')} 
                          className="px-4 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Seller
                            {getSortIcon('seller')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('saledate')} 
                          className="px-4 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Date
                            {getSortIcon('saledate')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                            No sales found
                          </td>
                        </tr>
                      ) : (
                        currentSales.map((sale: any, i) => (
                          <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">{sale.sale_no}</td>
                            <td className="px-4 py-3 font-medium">{sale.productname}</td>
                            <td className="px-4 py-3">₦{parseFloat(sale.productprice).toLocaleString()}</td>
                            <td className="px-4 py-3">{sale.productquantity}</td>
                            <td className="px-4 py-3 font-semibold">₦{parseFloat(sale.producttotal).toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs capitalize">
                                {sale.paymentmethod}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${sale.saletype === 'Cartons' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                {sale.saletype}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{sale.seller}</td>
                            <td className="px-4 py-3 text-sm">{sale.saledate}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="border-t border-gray-200 px-4 py-4 bg-gray-50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        
                        <div className="flex gap-1">
                          {getPageNumbers().map((page, idx) => (
                            page === '...' ? (
                              <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">...</span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => goToPage(page as number)}
                                className={`px-3 py-2 rounded-lg transition-all ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white font-semibold'
                                    : 'border border-gray-300 hover:bg-gray-100'
                                }`}
                              >
                                {page}
                              </button>
                            )
                          ))}
                        </div>
                        
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Go to:</label>
                        <input
                          type="number"
                          min={1}
                          max={totalPages}
                          value={currentPage}
                          onChange={(e) => goToPage(Number(e.target.value))}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
