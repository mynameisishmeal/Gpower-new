'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Package, Loader2, Search, X } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredProducts = products.filter((product: any) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const nameMatch = product.productname?.toLowerCase().includes(term);
    const priceMatch = product.productprice?.toString().includes(term);
    const weightMatch = product.productweight?.toString().includes(term);
    return nameMatch || priceMatch || weightMatch;
  });

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

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input 
                type="text"
                placeholder="Search products by name, price, or weight..."
                className="w-full pl-11 pr-10 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-sm placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search feedback counter */}
            {searchTerm && (
              <div className="mb-4 flex items-center justify-between text-sm text-gray-600 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200">
                <span>
                  Found <strong>{filteredProducts.length}</strong> product{filteredProducts.length !== 1 ? 's' : ''} matching &quot;<strong>{searchTerm}</strong>&quot;
                </span>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                {searchTerm ? (
                  <>
                    <p className="text-gray-800 font-semibold text-lg mb-1">No matching products</p>
                    <p className="text-gray-500 text-sm mb-4">
                      No products match your search for &quot;{searchTerm}&quot;
                    </p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-sm transition-all text-sm inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="h-4 w-4" /> Clear Search
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            ) : (
              <>
                {!searchTerm && (
                  <div className="mb-4 text-sm text-gray-600">
                    Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                  </div>
                )}

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
                      {filteredProducts.map((product: any) => (
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
