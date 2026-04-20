'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { Plus, Trash2, TrendingDown, Loader2, X } from 'lucide-react';
import { useConfirmModal } from '@/components/ConfirmModal';

export default function ExpensesPage() {
  const { showToast, ToastContainer } = useToast();
  const { showConfirm, ConfirmModalComponent } = useConfirmModal();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'utilities',
    customCategory: '',
    expenseDate: '',
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, expenseDate: dateStr }));
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const res = await fetch('/api/expenses/list');
    const data = await res.json();
    setExpenses(data.expenses || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.description || !formData.amount) {
      showToast('Please fill required fields', 'error');
      return;
    }

    const finalCategory = formData.category === 'custom' && formData.customCategory 
      ? formData.customCategory 
      : formData.category;

    if (formData.category === 'custom' && !formData.customCategory) {
      showToast('Please enter a custom category', 'error');
      return;
    }

    const user = localStorage.getItem('userEmail') || 'Unknown';
    const [year, month, day] = formData.expenseDate.split('-');
    const expenseDate = `${parseInt(day)}-${parseInt(month)}-${year}`;

    const res = await fetch('/api/expenses/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        category: finalCategory,
        expenseDate,
        addedBy: user
      })
    });

    const data = await res.json();
    if (data.success) {
      showToast('Expense added successfully!', 'success');
      setShowModal(false);
      setFormData({
        description: '',
        amount: '',
        category: 'utilities',
        customCategory: '',
        expenseDate: formData.expenseDate,
        paymentMethod: 'cash',
        notes: ''
      });
      fetchExpenses();
    } else {
      showToast(data.message || 'Failed to add expense', 'error');
    }
  };

  const handleDelete = async (id: string, description: string) => {
    showConfirm(
      'Delete Expense',
      `Are you sure you want to delete "${description}"?`,
      async () => {
        setDeletingId(id);
        try {
          const res = await fetch(`/api/expenses/delete?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            showToast('Expense deleted successfully!', 'success');
            fetchExpenses();
          } else {
            showToast('Failed to delete expense', 'error');
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

  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

  return (
    <>
      <ToastContainer />
      <ConfirmModalComponent />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Expense Tracking</h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              <Plus className="h-5 w-5" />
              Add Expense
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="text-sm text-gray-600 font-semibold">Total Expenses</h3>
                  <p className="text-3xl font-bold text-red-600">₦{totalExpenses.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold">Description</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold">Amount</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold">Category</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold">Payment</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold">Date</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold">Added By</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No expenses found</td>
                      </tr>
                    ) : (
                      expenses.map((expense: any) => (
                        <tr key={expense._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{expense.description}</td>
                          <td className="px-4 py-3 text-red-600 font-semibold">₦{expense.amount.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs capitalize">
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 capitalize">{expense.paymentMethod}</td>
                          <td className="px-4 py-3 text-sm">{expense.expenseDate}</td>
                          <td className="px-4 py-3 text-sm">{expense.addedBy}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDelete(expense._id, expense.description)}
                              disabled={deletingId === expense._id}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              {deletingId === expense._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Expense</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="e.g., Electricity bill"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter amount"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, customCategory: '' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="utilities">Utilities</option>
                <option value="rent">Rent</option>
                <option value="salaries">Salaries</option>
                <option value="supplies">Supplies</option>
                <option value="maintenance">Maintenance</option>
                <option value="transport">Transport</option>
                <option value="marketing">Marketing</option>
                <option value="insurance">Insurance</option>
                <option value="taxes">Taxes</option>
                <option value="custom">Custom (Enter your own)</option>
                <option value="other">Other</option>
              </select>
            </div>

            {formData.category === 'custom' && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Category *</label>
                <input
                  type="text"
                  value={formData.customCategory}
                  onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="e.g., Office Equipment, Training, Legal Fees"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Additional notes"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
