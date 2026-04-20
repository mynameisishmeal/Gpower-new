'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { Shield, Save, User } from 'lucide-react';

export default function PermissionsPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [permissions, setPermissions] = useState({
    canViewInventory: false,
    canManageInventory: false,
    canViewCustomers: false,
    canManageCustomers: false,
    canViewFinance: false,
    canManageFinance: false,
    canViewAnalytics: false,
    canManageUsers: false
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(user);
    if (userData.role !== 'sadmin') {
      showToast('Access denied! Super admin only', 'error');
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/users/list');
    const data = await res.json();
    setUsers(data.users?.filter((u: any) => u.role !== 'sadmin') || []);
    setLoading(false);
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setPermissions(user.permissions || {
      canViewInventory: false,
      canManageInventory: false,
      canViewCustomers: false,
      canManageCustomers: false,
      canViewFinance: false,
      canManageFinance: false,
      canViewAnalytics: false,
      canManageUsers: false
    });
  };

  const handleSave = async () => {
    if (!selectedUser) {
      showToast('Please select a user', 'error');
      return;
    }

    const res = await fetch('/api/users/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: selectedUser._id,
        permissions
      })
    });

    const data = await res.json();
    if (data.success) {
      showToast('Permissions updated successfully!', 'success');
      fetchUsers();
    } else {
      showToast(data.message || 'Failed to update permissions', 'error');
    }
  };

  const togglePermission = (key: string) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Role & Permissions Management</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Users</h2>
              <div className="space-y-2">
                {users.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No users found</p>
                ) : (
                  users.map((user: any) => (
                    <button
                      key={user._id}
                      onClick={() => handleUserSelect(user)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedUser?._id === user._id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        <div>
                          <p className="font-semibold">{user.firstname || user.email}</p>
                          <p className={`text-xs ${selectedUser?._id === user._id ? 'text-blue-100' : 'text-gray-500'}`}>
                            {user.email}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Permissions Panel */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              {!selectedUser ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Shield className="h-16 w-16 mb-4 text-gray-300" />
                  <p className="text-lg">Select a user to manage permissions</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedUser.firstname || selectedUser.email}
                    </h2>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <span className={`text-xs px-3 py-1 rounded-full mt-2 inline-block ${
                      selectedUser.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {/* Inventory Permissions */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                        Inventory Management
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-gray-700">View Inventory (Stock & Products)</span>
                          <input
                            type="checkbox"
                            checked={permissions.canViewInventory}
                            onChange={() => togglePermission('canViewInventory')}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-gray-700">Manage Inventory (Add/Edit/Delete)</span>
                          <input
                            type="checkbox"
                            checked={permissions.canManageInventory}
                            onChange={() => togglePermission('canManageInventory')}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Customer Permissions */}
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 bg-green-600 rounded-full"></span>
                        Customer Management
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-gray-700">View Customers</span>
                          <input
                            type="checkbox"
                            checked={permissions.canViewCustomers}
                            onChange={() => togglePermission('canViewCustomers')}
                            className="w-5 h-5 text-green-600 rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-gray-700">Manage Customers (Add/Edit/Delete)</span>
                          <input
                            type="checkbox"
                            checked={permissions.canManageCustomers}
                            onChange={() => togglePermission('canManageCustomers')}
                            className="w-5 h-5 text-green-600 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Finance Permissions */}
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 bg-yellow-600 rounded-full"></span>
                        Finance Management
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-gray-700">View Finance (Credits & Expenses)</span>
                          <input
                            type="checkbox"
                            checked={permissions.canViewFinance}
                            onChange={() => togglePermission('canViewFinance')}
                            className="w-5 h-5 text-yellow-600 rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-gray-700">Manage Finance (Add/Edit/Delete)</span>
                          <input
                            type="checkbox"
                            checked={permissions.canManageFinance}
                            onChange={() => togglePermission('canManageFinance')}
                            className="w-5 h-5 text-yellow-600 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Analytics Permissions */}
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 bg-purple-600 rounded-full"></span>
                        Analytics & Reports
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-gray-700">View Analytics Dashboard</span>
                          <input
                            type="checkbox"
                            checked={permissions.canViewAnalytics}
                            onChange={() => togglePermission('canViewAnalytics')}
                            className="w-5 h-5 text-purple-600 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    {/* User Management Permissions */}
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 bg-red-600 rounded-full"></span>
                        User Management
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-gray-700">Manage Users (Add/Edit/Delete)</span>
                          <input
                            type="checkbox"
                            checked={permissions.canManageUsers}
                            onChange={() => togglePermission('canManageUsers')}
                            className="w-5 h-5 text-red-600 rounded"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold"
                  >
                    <Save className="h-5 w-5" />
                    Save Permissions
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
