'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { usePageGuard } from '@/lib/auth/usePageGuard';

function UpdateStockForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { showToast, ToastContainer } = useToast();

  const { isAuthorized, loading: authLoading, currentUser } = usePageGuard({
    requiredPermission: 'canManageInventory',
    redirectTo: '/stock'
  });

  const [formData, setFormData] = useState({
    stockname: '',
    stockprice: '',
    stockquantity: '',
    stockweight: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [fetchingStock, setFetchingStock] = useState(true);

  useEffect(() => {
    if (id && isAuthorized) {
      setFetchingStock(true);
      fetch(`/api/stock/list`)
        .then((r) => r.json())
        .then((data) => {
          const stock = data.stocks?.find((s: any) => s._id === id);
          if (stock) {
            setFormData({
              stockname: stock.stockname,
              stockprice: stock.stockprice,
              stockquantity: stock.stockquantity,
              stockweight: stock.stockweight
            });
          } else {
            showToast('Stock item not found', 'error');
          }
        })
        .catch(() => showToast('Failed to load stock data', 'error'))
        .finally(() => setFetchingStock(false));
    }
  }, [id, isAuthorized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      showToast('Access denied: You do not have permission to edit stock.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/stock/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ id, ...formData })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Stock updated successfully!', 'success');
        setTimeout(() => {
          router.push('/stock');
        }, 600);
      } else {
        showToast(data.error || 'Failed to update stock', 'error');
      }
    } catch {
      showToast('Network error updating stock', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">Verifying stock management permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <Navigation />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/stock"
                className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Update Stock</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Modify carton quantity, pricing, and weight</p>
              </div>
            </div>

            {fetchingStock ? (
              <div className="py-12 text-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading stock details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Name</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.stockname}
                    onChange={(e) => setFormData({ ...formData, stockname: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Carton (₦)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={formData.stockprice}
                    onChange={(e) => setFormData({ ...formData, stockprice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity (Cartons)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={formData.stockquantity}
                    onChange={(e) => setFormData({ ...formData, stockquantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weight per Carton (KG)</label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={formData.stockweight}
                    onChange={(e) => setFormData({ ...formData, stockweight: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white px-6 py-3.5 rounded-lg font-bold hover:bg-blue-700 shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    <span>{submitting ? 'Saving Changes...' : 'Update Stock'}</span>
                  </button>
                  <Link
                    href="/stock"
                    className="px-5 py-3.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function UpdateStockPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        </div>
      }
    >
      <UpdateStockForm />
    </Suspense>
  );
}
