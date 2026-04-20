'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SoldByContent() {
  const searchParams = useSearchParams();
  const [sales, setSales] = useState([]);
  const [seller, setSeller] = useState('');

  useEffect(() => {
    const sellerParam = searchParams.get('seller');
    if (sellerParam) {
      setSeller(sellerParam);
      fetchSales(sellerParam);
    }
  }, [searchParams]);

  const fetchSales = async (sellerEmail: string) => {
    const res = await fetch(`/api/sales/list?seller=${sellerEmail}`);
    const data = await res.json();
    setSales(data.sales || []);
  };

  const calculateTotal = () => {
    return sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.producttotal || 0), 0);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sales by {seller}</h1>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Sale #</th>
              <th className="p-2">Product</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Total</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale: any, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{sale.sale_no}</td>
                <td className="p-2">{sale.productname}</td>
                <td className="p-2">{sale.productquantity}</td>
                <td className="p-2">₦{parseFloat(sale.producttotal).toFixed(2)}</td>
                <td className="p-2">{sale.saledate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-xl font-bold">
        Total: ₦{calculateTotal().toFixed(2)}
      </div>
    </div>
  );
}

export default function SoldByPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SoldByContent />
    </Suspense>
  );
}
