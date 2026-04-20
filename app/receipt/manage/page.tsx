'use client';
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Trash2 } from 'lucide-react';

interface Receipt {
  sharedid: string;
  sale_no: string;
  productname: string;
  productprice: number;
  productquantity: number;
  producttotal: number;
  saletype: string;
  paymentmethod: string;
  seller: string;
  datentime: string;
}

export default function ReceiptManagePage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filters, setFilters] = useState({
    date: '',
    seller: '',
    saletype: '',
    paymentmethod: ''
  });

  const fetchReceipts = async () => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.seller) params.append('seller', filters.seller);
    if (filters.saletype) params.append('saletype', filters.saletype);
    if (filters.paymentmethod) params.append('paymentmethod', filters.paymentmethod);
    
    const res = await fetch(`/api/receipt/filter?${params.toString()}`);
    const data = await res.json();
    setReceipts(data);
  };

  const deleteBySharedId = async (sharedid: string) => {
    if (!confirm('Delete this receipt?')) return;
    const res = await fetch(`/api/receipt/filter?sharedid=${sharedid}`, { method: 'DELETE' });
    if (res.ok) {
      alert('Receipt deleted');
      fetchReceipts();
    }
  };

  const deleteByDate = async () => {
    if (!filters.date) {
      alert('Please select a date');
      return;
    }
    if (!confirm('Delete all receipts for this date?')) return;
    const res = await fetch(`/api/receipt/filter?date=${filters.date}`, { method: 'DELETE' });
    if (res.ok) {
      alert('Receipts deleted');
      fetchReceipts();
    }
  };

  const total = receipts.reduce((sum, r) => sum + r.producttotal, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Receipt Management</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input type="date" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} className="px-4 py-3 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Seller" value={filters.seller} onChange={(e) => setFilters({...filters, seller: e.target.value})} className="px-4 py-3 border border-gray-300 rounded-lg" />
            <select value={filters.saletype} onChange={(e) => setFilters({...filters, saletype: e.target.value})} className="px-4 py-3 border border-gray-300 rounded-lg">
              <option value="">All Sale Types</option>
              <option value="Kilos">Kilos</option>
              <option value="Cartons">Cartons</option>
            </select>
            <select value={filters.paymentmethod} onChange={(e) => setFilters({...filters, paymentmethod: e.target.value})} className="px-4 py-3 border border-gray-300 rounded-lg">
              <option value="">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
              <option value="card">Card</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button onClick={fetchReceipts} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">Search</button>
            <button onClick={deleteByDate} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">Delete by Date</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Results</h2>
            <div className="text-2xl font-bold text-blue-600">Total: ₦{total.toLocaleString()}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Receipt ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sale No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Seller</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{r.sharedid}</td>
                    <td className="px-4 py-3">{r.sale_no}</td>
                    <td className="px-4 py-3">{r.productname}</td>
                    <td className="px-4 py-3">₦{r.productprice.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.productquantity}</td>
                    <td className="px-4 py-3">₦{r.producttotal.toLocaleString()}</td>
                    <td className="px-4 py-3">{r.saletype}</td>
                    <td className="px-4 py-3">{r.paymentmethod}</td>
                    <td className="px-4 py-3">{r.seller}</td>
                    <td className="px-4 py-3">{r.datentime}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteBySharedId(r.sharedid)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
