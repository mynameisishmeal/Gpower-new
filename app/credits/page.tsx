'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { DollarSign, Calendar, CreditCard, Loader2, X } from 'lucide-react';

export default function CreditsPage() {
  const { showToast, ToastContainer } = useToast();
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    fetchCredits();
  }, [filter]);

  const fetchCredits = async () => {
    setLoading(true);
    const params = filter !== 'all' ? `?status=${filter}` : '';
    const res = await fetch(`/api/credits/list${params}`);
    const data = await res.json();
    setCredits(data.credits || []);
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!selectedCredit || !paymentAmount) {
      showToast('Please enter payment amount', 'error');
      return;
    }

    const amount = Number(paymentAmount);
    if (amount <= 0 || amount > selectedCredit.amountRemaining) {
      showToast('Invalid payment amount', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date();
      const paymentDate = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;

      const res = await fetch('/api/credits/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creditId: selectedCredit._id,
          amount,
          paymentDate,
          paymentMethod
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('Payment recorded successfully!', 'success');
        setShowPaymentModal(false);
        setSelectedCredit(null);
        setPaymentAmount('');
        fetchCredits();
      } else {
        showToast(data.message || 'Payment failed', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalOutstanding = credits.reduce((sum: number, c: any) => sum + c.amountRemaining, 0);

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">Credit Management</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-sm text-gray-600 font-semibold mb-1">Total Outstanding</h3>
              <p className="text-2xl font-bold text-red-600">₦{totalOutstanding.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-600">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-sm text-gray-600 font-semibold mb-1">Pending Credits</h3>
              <p className="text-2xl font-bold text-yellow-600">{credits.filter((c: any) => c.status === 'pending').length}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-sm text-gray-600 font-semibold mb-1">Partial Payments</h3>
              <p className="text-2xl font-bold text-blue-600">{credits.filter((c: any) => c.status === 'partial').length}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex gap-4 mb-4">
              <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>All</button>
              <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}>Pending</button>
              <button onClick={() => setFilter('partial')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'partial' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Partial</button>
              <button onClick={() => setFilter('paid')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Paid</button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading credits...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Paid</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Remaining</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sale Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credits.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No credits found</td>
                      </tr>
                    ) : (
                      credits.map((credit: any) => (
                        <tr key={credit._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{credit.customerName}</td>
                          <td className="px-4 py-3">₦{credit.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-green-600">₦{credit.amountPaid.toLocaleString()}</td>
                          <td className="px-4 py-3 text-red-600 font-semibold">₦{credit.amountRemaining.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              credit.status === 'paid' ? 'bg-green-100 text-green-700' :
                              credit.status === 'partial' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {credit.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{credit.saleDate}</td>
                          <td className="px-4 py-3">
                            {credit.status !== 'paid' && (
                              <button
                                onClick={() => {
                                  setSelectedCredit(credit);
                                  setShowPaymentModal(true);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                              >
                                Add Payment
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPaymentModal && selectedCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Add Payment</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Customer: <span className="font-semibold">{selectedCredit.customerName}</span></p>
              <p className="text-sm text-gray-600">Remaining: <span className="font-semibold text-red-600">₦{selectedCredit.amountRemaining.toLocaleString()}</span></p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Amount</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter amount"
                max={selectedCredit.amountRemaining}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="card">Card</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedCredit(null);
                  setPaymentAmount('');
                }}
                className="flex-1 px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Record Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
