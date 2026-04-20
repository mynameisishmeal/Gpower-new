'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    productname: '',
    productprice: '',
    productweight: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/products/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert('Product created!');
      router.push('/products');
    } else {
      alert('Failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="card-shadow bg-white rounded-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/products" className="btn-modern bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold">Create Product (Kilos)</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Product Name</label>
              <input type="text" required className="w-full p-3 border rounded-lg" value={formData.productname} onChange={(e) => setFormData({...formData, productname: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Price per KG (₦)</label>
              <input type="number" required step="0.01" min="0" className="w-full p-3 border rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.productprice} onChange={(e) => setFormData({...formData, productprice: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Weight (KG)</label>
              <input type="number" required step="0.5" min="0" className="w-full p-3 border rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.productweight} onChange={(e) => setFormData({...formData, productweight: e.target.value})} />
            </div>
            <button type="submit" className="btn-modern w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
              <Save className="h-5 w-5" />
              Create Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
