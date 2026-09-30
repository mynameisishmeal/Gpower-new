'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { usePageGuard } from '@/lib/auth/usePageGuard';

export default function CreateProductPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();

  const { isAuthorized, loading: authLoading, currentUser } = usePageGuard({
    requiredPermission: 'canManageInventory',
    redirectTo: '/products'
  });

  const [formData, setFormData] = useState({
    productname: '',
    productprice: '',
    productweight: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      showToast('Access denied: You do not have permission to create products.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Product created successfully!', 'success');
        setTimeout(() => {
          router.push('/products');
        }, 600);
      } else {
        showToast(data.error || 'Failed to create product', 'error');
      }
    } catch {
      showToast('Network error creating product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">Verifying product permissions...</p>
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
                href="/products"
                className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Product (Kilos)</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Add new kilo item sold by weight</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Croaker Fish (Kilos)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.productname}
                  onChange={(e) => setFormData({ ...formData, productname: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price per KG (₦)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.productprice}
                  onChange={(e) => setFormData({ ...formData, productprice: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (KG)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="0"
                  placeholder="e.g. 1.0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.productweight}
                  onChange={(e) => setFormData({ ...formData, productweight: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white px-6 py-3.5 rounded-lg font-bold hover:bg-blue-700 shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  <span>{submitting ? 'Creating Product...' : 'Create Product'}</span>
                </button>
                <Link
                  href="/products"
                  className="px-5 py-3.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
