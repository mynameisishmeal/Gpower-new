'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddStockPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    stockname: '',
    stockprice: '',
    stockquantity: '',
    stockweight: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/stock/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert('Stock added successfully!');
      router.push('/stock');
    } else {
      alert('Failed to add stock');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Stock</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Stock Name</label>
          <input 
            type="text"
            required
            className="w-full p-2 border rounded"
            value={formData.stockname}
            onChange={(e) => setFormData({...formData, stockname: e.target.value})}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Price (₦)</label>
          <input 
            type="number"
            required
            step="0.01"
            min="0"
            className="w-full p-2 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={formData.stockprice}
            onChange={(e) => setFormData({...formData, stockprice: e.target.value})}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Quantity (Cartons)</label>
          <input 
            type="number"
            required
            min="0"
            className="w-full p-2 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={formData.stockquantity}
            onChange={(e) => setFormData({...formData, stockquantity: e.target.value})}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Weight (KG)</label>
          <input 
            type="number"
            required
            step="0.01"
            min="0"
            className="w-full p-2 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={formData.stockweight}
            onChange={(e) => setFormData({...formData, stockweight: e.target.value})}
          />
        </div>

        <div className="flex gap-4">
          <button 
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Add Stock
          </button>
          <button 
            type="button"
            onClick={() => router.push('/stock')}
            className="bg-gray-400 text-white px-6 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
