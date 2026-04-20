'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';
import { UserPlus, Search, Edit, Trash2, Loader2, X } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { useConfirmModal } from '@/components/ConfirmModal';

export default function CustomersPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const { showConfirm, ConfirmModalComponent } = useConfirmModal();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers/list');
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (error) {
      showToast('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, customerName: string) => {
    showConfirm(
      'Delete Customer',
      `Are you sure you want to delete "${customerName}"? This will also delete their purchase history.`,
      async () => {
        setDeletingId(id);
        try {
          const res = await fetch(`/api/customers/delete?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('Customer deleted successfully!', 'success');
            fetchCustomers();
          } else {
            showToast('Failed to delete customer', 'error');
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

  const filteredCustomers = customers.filter((c: any) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  return (
    <>
      <ToastContainer />
      <ConfirmModalComponent />
      <Navigation />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="card-shadow bg-white rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <UserPlus className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
              </div>
              <button 
                onClick={() => router.push('/customers/create')}
                className="btn-modern bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                Add Customer
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search customers by name or phone..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {searchTerm && (
              <div className="mb-4 text-sm text-gray-600">
                Found {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} matching "{searchTerm}"
              </div>
            )}

            {!searchTerm && !loading && (
              <div className="mb-4 text-sm text-gray-600">
                Showing {customers.length} customer{customers.length !== 1 ? 's' : ''}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading customers...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {searchTerm ? `No customers found matching "${searchTerm}"` : 'No customers found'}
                </p>
                {!searchTerm && (
                  <button 
                    onClick={() => router.push('/customers/create')}
                    className="btn-modern bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-flex items-center gap-2 mt-4"
                  >
                    <UserPlus className="h-5 w-5" />
                    Add Your First Customer
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredCustomers.map((customer: any) => (
                    <div key={customer._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <button
                          onClick={() => router.push(`/customers/${customer._id}/sales`)}
                          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {customer.name}
                        </button>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => router.push(`/customers/update?id=${customer._id}`)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(customer._id, customer.name)}
                            disabled={deletingId === customer._id}
                            className="text-red-600 hover:text-red-800 p-2 disabled:opacity-50"
                          >
                            {deletingId === customer._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{customer.email}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Purchases:</span>
                          <span className="font-semibold text-green-600">₦{(customer.totalPurchases || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <table className="hidden md:table w-full table-modern">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left font-semibold text-gray-700">Name</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Phone</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Email</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Address</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Total Purchases</th>
                      <th className="p-3 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer: any) => (
                      <tr key={customer._id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-900">
                          <button
                            onClick={() => router.push(`/customers/${customer._id}/sales`)}
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                          >
                            {customer.name}
                          </button>
                        </td>
                        <td className="p-3 text-gray-700">{customer.phone}</td>
                        <td className="p-3 text-gray-700">{customer.email || '-'}</td>
                        <td className="p-3 text-gray-700">{customer.address || '-'}</td>
                        <td className="p-3 text-gray-700">
                          <div className="text-sm">
                            <div className="font-semibold text-green-600">₦{(customer.totalPurchases || 0).toLocaleString()}</div>
                            <div className="text-xs text-gray-500">
                              {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : 'No purchases'}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => router.push(`/customers/update?id=${customer._id}`)}
                              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(customer._id, customer.name)}
                              disabled={deletingId === customer._id}
                              className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingId === customer._id ? (
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}
