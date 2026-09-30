'use client';

import { useState, useEffect, Suspense } from 'react';
import { Edit, Trash2, Package, Loader2, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { useConfirmModal } from '@/components/ConfirmModal';
import { usePageGuard } from '@/lib/auth/usePageGuard';

function StockContent() {
  const { showToast, ToastContainer } = useToast();
  const { showConfirm, ConfirmModalComponent } = useConfirmModal();
  const searchParams = useSearchParams();

  // Enforce inventory view permission
  const { isAuthorized, loading: authLoading, role, permissions } = usePageGuard({
    requiredPermission: 'canViewInventory',
    redirectTo: '/dashboard'
  });

  const canManage = role === 'sadmin' || permissions?.canManageInventory === true;

  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'low'>('all');

  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'low') {
      setFilter('low');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthorized) {
      fetchStocks();
    }
  }, [isAuthorized]);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stock/list');
      const data = await res.json();
      setStocks(data.stocks || []);
    } catch (error) {
      showToast('Failed to load stock', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, stockName: string) => {
    if (!canManage) {
      showToast('Access denied: You do not have permission to delete stock', 'error');
      return;
    }

    showConfirm(
      'Delete Stock',
      `Are you sure you want to delete "${stockName}"? This action cannot be undone.`,
      async () => {
        setDeletingId(id);
        try {
          const res = await fetch(`/api/stock/delete?id=${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          if (res.ok) {
            showToast('Stock deleted successfully!', 'success');
            fetchStocks();
          } else {
            const errData = await res.json().catch(() => ({}));
            showToast(errData.error || 'Failed to delete stock', 'error');
          }
        } catch (error) {
          showToast('An error occurred', 'error');
        } finally {
          setDeletingId(null);
        }
      },
      { type: 'danger', confirmText: 'Delete', cancelText: 'Cancel' }
    );
  };

  const getLowStockCount = () => {
    return stocks.filter((s: any) => s.stockquantity < 10).length;
  };

  const filteredStocks = filter === 'low' 
    ? stocks.filter((s: any) => s.stockquantity < 10)
    : stocks;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <ConfirmModalComponent />
      <Navigation />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Stock Management (Cartons)</h1>
                  <p className="text-sm text-gray-600 mt-1">Manage your carton inventory</p>
                </div>
              </div>

              {canManage && (
                <Link
                  href="/stock/add"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-sm hover:shadow flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Package className="h-5 w-5" />
                  Add Stock
                </Link>
              )}
            </div>

            {getLowStockCount() > 0 && (
              <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <p className="text-orange-800 font-semibold">
                    {getLowStockCount()} item{getLowStockCount() !== 1 ? 's' : ''} running low (less than 10 cartons)
                  </p>
                </div>
                {filter === 'all' && (
                  <button
                    onClick={() => setFilter('low')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold text-sm cursor-pointer"
                  >
                    View Low Stock
                  </button>
                )}
              </div>
            )}

            {filter === 'low' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <p className="text-blue-800 font-semibold">Showing low stock items only</p>
                <button
                  onClick={() => setFilter('all')}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  Show All
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading stock...</p>
              </div>
            ) : filteredStocks.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">
                  {filter === 'low' ? 'No low stock items found' : 'No stock items found'}
                </p>
                {filter === 'low' ? (
                  <button
                    onClick={() => setFilter('all')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-sm hover:shadow inline-flex items-center gap-2 transition-all cursor-pointer"
                  >
                    View All Stock
                  </button>
                ) : (
                  canManage && (
                    <Link
                      href="/stock/add"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-sm hover:shadow inline-flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Package className="h-5 w-5" />
                      Add Your First Stock
                    </Link>
                  )
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {filteredStocks.length} stock item{filteredStocks.length !== 1 ? 's' : ''}
                  {filter === 'low' && ` (${stocks.length} total)`}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-0 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left font-semibold text-gray-700">Name</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Price</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Quantity (Cartons)</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Weight (KG)</th>
                        {canManage && <th className="p-3 text-center font-semibold text-gray-700">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStocks.map((stock: any) => (
                        <tr key={stock._id} className="border-t hover:bg-gray-50/70 transition-colors">
                          <td className="p-3 font-medium text-gray-900">{stock.stockname}</td>
                          <td className="p-3 font-mono">₦{stock.stockprice?.toLocaleString()}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                stock.stockquantity < 10
                                  ? 'bg-red-100 text-red-700'
                                  : stock.stockquantity < 50
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {stock.stockquantity} cartons
                            </span>
                          </td>
                          <td className="p-3">{stock.stockweight} KG</td>
                          {canManage && (
                            <td className="p-3 text-center">
                              <div className="flex gap-3 justify-center items-center">
                                <Link
                                  href={`/stock/update?id=${stock._id}`}
                                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleDelete(stock._id, stock.stockname)}
                                  disabled={deletingId === stock._id}
                                  className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
                                >
                                  {deletingId === stock._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                  Delete
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function StockPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        </div>
      }
    >
      <StockContent />
    </Suspense>
  );
}
