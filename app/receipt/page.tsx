'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReceiptPage() {
  const searchParams = useSearchParams();
  const [receipt, setReceipt] = useState<any>(null);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const sharedid = searchParams.get('id');
    if (sharedid) fetchReceipt(sharedid);
  }, [searchParams]);

  const fetchReceipt = async (sharedid: string) => {
    const res = await fetch(`/api/receipt/view?id=${sharedid}`);
    const data = await res.json();
    setSales(data.sales || []);
    if (data.sales?.length > 0) {
      setReceipt({
        sharedid,
        saledate: data.sales[0].saledate,
        seller: data.sales[0].seller,
        sale_no: data.sales[0].sale_no
      });
    }
  };

  const calculateTotal = () => {
    return sales.reduce((sum: number, sale: any) => sum + parseFloat(sale.producttotal || 0), 0);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!receipt) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4 print:hidden">
        <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded">
          Print Receipt
        </button>
      </div>

      <div className="border p-6 bg-white">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Gpower Frozen Foods</h1>
          <p className="text-sm">Receipt #{receipt.sale_no}</p>
        </div>

        <div className="mb-4 text-sm">
          <p><strong>Date:</strong> {receipt.saledate}</p>
          <p><strong>Seller:</strong> {receipt.seller}</p>
          <p><strong>Receipt ID:</strong> {receipt.sharedid}</p>
        </div>

        <table className="w-full mb-4 text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Item</th>
              <th className="text-right p-2">Price</th>
              <th className="text-right p-2">Qty</th>
              <th className="text-right p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale: any, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{sale.productname}</td>
                <td className="text-right p-2">₦{sale.productprice}</td>
                <td className="text-right p-2">{sale.productquantity}</td>
                <td className="text-right p-2">₦{parseFloat(sale.producttotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right font-bold text-lg mb-4">
          Total: ₦{calculateTotal().toFixed(2)}
        </div>

        <div className="text-center text-sm mt-6">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}
