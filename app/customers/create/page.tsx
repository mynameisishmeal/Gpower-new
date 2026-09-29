'use client';
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';
import { AlertTriangle, User, Phone, Mail, MapPin } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function CreateCustomerPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [existingCustomer, setExistingCustomer] = useState<any>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/customers/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await res.json();
    
    if (res.ok) {
      showToast('Customer created successfully!', 'success');
      router.push('/customers');
    } else if (res.status === 409) {
      // Duplicate found
      setExistingCustomer(data.existingCustomer);
      setShowDuplicateModal(true);
      showToast(data.message, 'error');
    } else {
      showToast(data.message || 'Failed to create customer', 'error');
    }
  };

  const handleViewExisting = () => {
    router.push(`/customers/update?id=${existingCustomer._id}`);
  };

  const handleCreateAnyway = () => {
    setShowDuplicateModal(false);
    setExistingCustomer(null);
    showToast('Please modify the name or phone number to create a new customer', 'warning');
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Customer</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="080XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg" 
                  rows={3}
                  placeholder="Enter customer address"
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold">Create Customer</button>
                <button type="button" onClick={() => router.push('/customers')} className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Duplicate Customer Modal */}
      {showDuplicateModal && existingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Customer Already Exists</h2>
            </div>

            <p className="text-gray-600 mb-6">
              A customer with this name or phone number already exists in the system.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">Existing Customer Details:</h3>
              
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold text-gray-900">{existingCustomer.name}</p>
                </div>
              </div>

              {existingCustomer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-900">{existingCustomer.phone}</p>
                  </div>
                </div>
              )}

              {existingCustomer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">{existingCustomer.email}</p>
                  </div>
                </div>
              )}

              {existingCustomer.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-semibold text-gray-900">{existingCustomer.address}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleViewExisting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
              >
                View/Edit Existing Customer
              </button>
              <button
                onClick={handleCreateAnyway}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Modify & Try Again
              </button>
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
