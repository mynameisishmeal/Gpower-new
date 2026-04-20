'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UpdateStockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [formData, setFormData] = useState({
    stockname: '',
    stockprice: '',
    stockquantity: '',
    stockweight: ''
  });

  useEffect(() => {
    if (id) {
      fetch(`/api/stock/list`).then(r => r.json()).then(data => {
        const stock = data.stocks?.find((s: any) => s._id === id);
        if (stock) {
          setFormData({
            stockname: stock.stockname,
            stockprice: stock.stockprice,
            stockquantity: stock.stockquantity,
            stockweight: stock.stockweight
          });
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/stock/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...formData })
    });
    if (res.ok) {
      alert('Updated!');
      router.push('/stock');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="card-shadow bg-white rounded-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/stock" className="btn-modern bg-gray-200 p-2 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
            <h1 className="text-3xl font-bold">Update Stock</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Stock Name</label>
              <input type="text" required className="w-full p-3 border rounded-lg" value={formData.stockname} onChange={(e) => setFormData({...formData, stockname: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Price per Carton</label>
              <input type="number" required step="0.01" min="0" className="w-full p-3 border rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.stockprice} onChange={(e) => setFormData({...formData, stockprice: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Quantity (Cartons)</label>
              <input type="number" required min="0" className="w-full p-3 border rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.stockquantity} onChange={(e) => setFormData({...formData, stockquantity: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Weight per Carton (KG)</label>
              <input type="number" required step="0.5" min="0" className="w-full p-3 border rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.stockweight} onChange={(e) => setFormData({...formData, stockweight: e.target.value})} />
            </div>
            <button type="submit" className="btn-modern w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
              <Save className="h-5 w-5" />
              Update Stock
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
