'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { useConfirmModal } from '@/components/ConfirmModal';

export default function ProductsPage() {
  const { showToast, ToastContainer } = useToast();
  const { showConfirm, ConfirmModalComponent } = useConfirmModal();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

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
    showConfirm(
      'Delete Product',
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      async () => {
        setDeletingId(id);
        try {
          const res = await fetch(`/api/products/delete?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('Product deleted successfully!', 'success');
            fetchProducts();
          } else {
            showToast('Failed to delete product', 'error');
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

  return (
    <>
      <ToastContainer />
      <ConfirmModalComponent />
      <Navigation />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="card-shadow bg-white rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-3xl font-bold">Products (Kilos)</h1>
                  <p className="text-sm text-gray-600 mt-1">Manage products sold by weight</p>
                </div>
              </div>
              <Link href="/products/create" className="btn-modern bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Product
              </Link>
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
                <Link href="/products/create" className="btn-modern bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Your First Product
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {products.length} product{products.length !== 1 ? 's' : ''}
                </div>

            <div className="overflow-x-auto">
              <table className="w-full table-modern">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left font-semibold">Name</th>
                    <th className="p-3 text-left font-semibold">Price (per KG)</th>
                    <th className="p-3 text-left font-semibold">Weight (KG)</th>
                    <th className="p-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product._id} className="border-t">
                      <td className="p-3 font-medium">{product.productname}</td>
                      <td className="p-3">₦{product.productprice.toLocaleString()}/kg</td>
                      <td className="p-3">{product.productweight} KG</td>
                      <td className="p-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <Link href={`/products/update?id=${product._id}`} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Link>
                          <button 
                            onClick={() => handleDelete(product._id, product.productname)} 
                            disabled={deletingId === product._id}
                            className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
