'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { useConfirmModal } from '@/components/ConfirmModal';
import { usePageGuard } from '@/lib/auth/usePageGuard';

export default function ProductsPage() {
  const { showToast, ToastContainer } = useToast();
  const { showConfirm, ConfirmModalComponent } = useConfirmModal();

  const { isAuthorized, loading: authLoading, role, permissions } = usePageGuard({
    requiredPermission: 'canViewInventory',
    redirectTo: '/dashboard'
  });

  const canManage = role === 'sadmin' || permissions?.canManageInventory === true;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthorized) {
      fetchProducts();
    }
  }, [isAuthorized]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products/list');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, productName: string) => {
    if (!canManage) {
      showToast('Access denied: You do not have permission to delete products', 'error');
      return;
    }

    showConfirm(
      'Delete Product',
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      async () => {
        setDeletingId(id);
        try {
          const res = await fetch(`/api/products/delete?id=${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          if (res.ok) {
            showToast('Product deleted successfully!', 'success');
            fetchProducts();
          } else {
            const errData = await res.json().catch(() => ({}));
            showToast(errData.error || 'Failed to delete product', 'error');
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
                <Package className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Products (Kilos)</h1>
                  <p className="text-sm text-gray-600 mt-1">Manage products sold by weight</p>
                </div>
              </div>

              {canManage && (
                <Link
                  href="/products/create"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-sm hover:shadow flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="h-5 w-5" />
                  Create Product
                </Link>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No products found</p>
                {canManage && (
                  <Link
                    href="/products/create"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-sm hover:shadow inline-flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Product
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {products.length} product{products.length !== 1 ? 's' : ''}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-0 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left font-semibold text-gray-700">Name</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Price (per KG)</th>
                        <th className="p-3 text-left font-semibold text-gray-700">Weight (KG)</th>
                        {canManage && <th className="p-3 text-center font-semibold text-gray-700">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product: any) => (
                        <tr key={product._id} className="border-t hover:bg-gray-50/70 transition-colors">
                          <td className="p-3 font-medium text-gray-900">{product.productname}</td>
                          <td className="p-3 font-mono">₦{product.productprice?.toLocaleString()}/kg</td>
                          <td className="p-3">{product.productweight} KG</td>
                          {canManage && (
                            <td className="p-3 text-center">
                              <div className="flex gap-3 justify-center items-center">
                                <Link
                                  href={`/products/update?id=${product._id}`}
                                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleDelete(product._id, product.productname)}
                                  disabled={deletingId === product._id}
                                  className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
                                >
                                  {deletingId === product._id ? (
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
