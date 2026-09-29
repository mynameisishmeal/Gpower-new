'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import {
  Shield,
  Save,
  Search,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  BarChart3,
  Printer,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lock,
  UserCheck
} from 'lucide-react';

interface UserPermissions {
  canViewDashboard?: boolean;
  canSell?: boolean;
  canViewSales?: boolean;
  canManageReceipts?: boolean;
  canViewInventory?: boolean;
  canManageInventory?: boolean;
  canViewCustomers?: boolean;
  canManageCustomers?: boolean;
  canViewFinance?: boolean;
  canManageFinance?: boolean;
  canViewAnalytics?: boolean;
  canManageUsers?: boolean;
  canManagePrinters?: boolean;
  canViewSettings?: boolean;
}

const DEFAULT_PERMISSIONS: UserPermissions = {
  canViewDashboard: true,
  canSell: true,
  canViewSales: true,
  canManageReceipts: false,
  canViewInventory: false,
  canManageInventory: false,
  canViewCustomers: false,
  canManageCustomers: false,
  canViewFinance: false,
  canManageFinance: false,
  canViewAnalytics: false,
  canManageUsers: false,
  canManagePrinters: true,
  canViewSettings: true
};

export default function PermissionsPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentAdminEmail, setCurrentAdminEmail] = useState('');

  // Strict Super Admin Verification
  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(rawUser);
      if (userData.role !== 'sadmin') {
        showToast('Access denied! Only Super Admin can access this page.', 'error');
        router.push('/dashboard');
        return;
      }
      setCurrentAdminEmail(userData.email || '');
      fetchUsers();
    } catch {
      router.push('/login');
    }
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users/list');
      const data = await res.json();
      // Super admin can manage permissions for all users except fellow sadmins
      const managedUsers = data.users?.filter((u: any) => u.role !== 'sadmin') || [];
      setUsers(managedUsers);
      if (managedUsers.length > 0 && !selectedUser) {
        handleUserSelect(managedUsers[0]);
      }
    } catch {
      showToast('Failed to load user list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setPermissions({
      ...DEFAULT_PERMISSIONS,
      ...(user.permissions || {})
    });
  };

  const togglePermission = (key: keyof UserPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Presets
  const applyPreset = (presetType: 'cashier' | 'manager' | 'all' | 'none') => {
    if (presetType === 'cashier') {
      setPermissions({
        canViewDashboard: true,
        canSell: true,
        canViewSales: true,
        canManageReceipts: false,
        canViewInventory: false,
        canManageInventory: false,
        canViewCustomers: false,
        canManageCustomers: false,
        canViewFinance: false,
        canManageFinance: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canManagePrinters: true,
        canViewSettings: true
      });
      showToast('Applied Cashier Preset', 'success');
    } else if (presetType === 'manager') {
      setPermissions({
        canViewDashboard: true,
        canSell: true,
        canViewSales: true,
        canManageReceipts: true,
        canViewInventory: true,
        canManageInventory: true,
        canViewCustomers: true,
        canManageCustomers: true,
        canViewFinance: true,
        canManageFinance: true,
        canViewAnalytics: true,
        canManageUsers: false,
        canManagePrinters: true,
        canViewSettings: true
      });
      showToast('Applied Store Manager Preset', 'success');
    } else if (presetType === 'all') {
      setPermissions({
        canViewDashboard: true,
        canSell: true,
        canViewSales: true,
        canManageReceipts: true,
        canViewInventory: true,
        canManageInventory: true,
        canViewCustomers: true,
        canManageCustomers: true,
        canViewFinance: true,
        canManageFinance: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canManagePrinters: true,
        canViewSettings: true
      });
      showToast('Granted Access to All Pages', 'success');
    } else if (presetType === 'none') {
      setPermissions({
        canViewDashboard: false,
        canSell: false,
        canViewSales: false,
        canManageReceipts: false,
        canViewInventory: false,
        canManageInventory: false,
        canViewCustomers: false,
        canManageCustomers: false,
        canViewFinance: false,
        canManageFinance: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canManagePrinters: false,
        canViewSettings: false
      });
      showToast('Revoked Access to All Pages', 'warning');
    }
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);

    try {
      const res = await fetch('/api/users/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser._id,
          permissions,
          requesterEmail: currentAdminEmail
        })
      });

      const data = await res.json();

      if (data.success) {
        showToast(`Permissions updated for ${selectedUser.firstname || selectedUser.email}!`, 'success');
        // Update local state for this user
        setUsers((prev) =>
          prev.map((u) => (u._id === selectedUser._id ? { ...u, permissions } : u))
        );
        setSelectedUser((prev: any) => ({ ...prev, permissions }));
      } else {
        showToast(data.message || 'Failed to update permissions', 'error');
      }
    } catch {
      showToast('An error occurred while saving permissions', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstname || ''} ${u.lastname || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <>
      <ToastContainer />
      <Navigation />
      <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  Page & Feature Permissions
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-red-100 text-red-700 border border-red-200">
                    Super Admin Only
                  </span>
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Select any user (Admin or Worker) to configure which pages and actions they can access.
                </p>
              </div>
            </div>

            {selectedUser && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium shadow-sm transition active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving Changes...' : 'Save Permissions'}
              </button>
            )}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: User Selector */}
            <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col h-[750px]">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-slate-900 mb-2">Select User</h2>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
                  <UserCheck className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
                  No users found
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredUsers.map((u) => {
                    const isSelected = selectedUser?._id === u._id;
                    const name = u.firstname ? `${u.firstname} ${u.lastname || ''}` : u.email.split('@')[0];
                    return (
                      <button
                        key={u._id}
                        onClick={() => handleUserSelect(u)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-300 shadow-sm'
                            : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        </div>
                        <span
                          className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Permissions Configuration Panel */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col h-[750px] overflow-hidden">
              {!selectedUser ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <Lock className="w-12 h-12 mb-3 stroke-1 text-slate-300" />
                  <p className="text-base font-medium">Select a user to configure page access</p>
                </div>
              ) : (
                <>
                  {/* Selected User Info & Presets Banner */}
                  <div className="pb-4 mb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">
                          {selectedUser.firstname ? `${selectedUser.firstname} ${selectedUser.lastname || ''}` : selectedUser.email}
                        </h2>
                        <span
                          className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${
                            selectedUser.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {selectedUser.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{selectedUser.email}</p>
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets:
                      </span>
                      <button
                        onClick={() => applyPreset('cashier')}
                        className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                      >
                        Cashier
                      </button>
                      <button
                        onClick={() => applyPreset('manager')}
                        className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                      >
                        Store Manager
                      </button>
                      <button
                        onClick={() => applyPreset('all')}
                        className="text-xs px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                      >
                        Grant All
                      </button>
                      <button
                        onClick={() => applyPreset('none')}
                        className="text-xs px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                      >
                        Revoke All
                      </button>
                    </div>
                  </div>

                  {/* Permissions Scrollable List */}
                  <div className="flex-1 overflow-y-auto space-y-5 pr-2">
                    {/* Section 1: POS & Sales */}
                    <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ShoppingCart className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-bold text-slate-900">Point of Sale & Checkout</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ToggleItem
                          title="Sell / Mixed Terminal (/sell/mixed)"
                          desc="Cashier checkout for cartons and kilos"
                          checked={permissions.canSell !== false}
                          onChange={() => togglePermission('canSell')}
                          color="emerald"
                        />
                        <ToggleItem
                          title="Store Dashboard (/dashboard)"
                          desc="View store metrics, low stock, and daily stats"
                          checked={permissions.canViewDashboard !== false}
                          onChange={() => togglePermission('canViewDashboard')}
                          color="emerald"
                        />
                        <ToggleItem
                          title="Sales History (/sales/history, /soldby)"
                          desc="Search past sales and cashier performance"
                          checked={permissions.canViewSales !== false}
                          onChange={() => togglePermission('canViewSales')}
                          color="emerald"
                        />
                        <ToggleItem
                          title="Receipt Management (/receipt/manage)"
                          desc="Filter and delete receipt records"
                          checked={!!permissions.canManageReceipts}
                          onChange={() => togglePermission('canManageReceipts')}
                          color="emerald"
                        />
                      </div>
                    </div>

                    {/* Section 2: Inventory Management */}
                    <div className="rounded-xl border border-blue-200/80 bg-blue-50/20 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-bold text-slate-900">Inventory Management</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ToggleItem
                          title="View Inventory (/stock, /products)"
                          desc="Browse stock cartons and kilo products"
                          checked={!!permissions.canViewInventory}
                          onChange={() => togglePermission('canViewInventory')}
                          color="blue"
                        />
                        <ToggleItem
                          title="Manage Inventory (/stock/add, /products/create)"
                          desc="Add, modify, and delete stock & pricing"
                          checked={!!permissions.canManageInventory}
                          onChange={() => togglePermission('canManageInventory')}
                          color="blue"
                        />
                      </div>
                    </div>

                    {/* Section 3: Customer Management */}
                    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/20 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-sm font-bold text-slate-900">Customer Management</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ToggleItem
                          title="View Customers (/customers)"
                          desc="View customer list and purchase ledgers"
                          checked={!!permissions.canViewCustomers}
                          onChange={() => togglePermission('canViewCustomers')}
                          color="indigo"
                        />
                        <ToggleItem
                          title="Manage Customers (/customers/create)"
                          desc="Register and edit customer records"
                          checked={!!permissions.canManageCustomers}
                          onChange={() => togglePermission('canManageCustomers')}
                          color="indigo"
                        />
                      </div>
                    </div>

                    {/* Section 4: Finance & Accounting */}
                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/20 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="w-4 h-4 text-amber-600" />
                        <h3 className="text-sm font-bold text-slate-900">Finance & Accounting</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ToggleItem
                          title="View Finance (/credits, /expenses)"
                          desc="View customer debts and operational expenses"
                          checked={!!permissions.canViewFinance}
                          onChange={() => togglePermission('canViewFinance')}
                          color="amber"
                        />
                        <ToggleItem
                          title="Manage Finance (Payments & Entries)"
                          desc="Record debt repayments & add new expenses"
                          checked={!!permissions.canManageFinance}
                          onChange={() => togglePermission('canManageFinance')}
                          color="amber"
                        />
                      </div>
                    </div>

                    {/* Section 5: Analytics & Reports */}
                    <div className="rounded-xl border border-purple-200/80 bg-purple-50/20 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                        <h3 className="text-sm font-bold text-slate-900">Analytics & Reports</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ToggleItem
                          title="Business Analytics (/analytics)"
                          desc="View revenue charts, trend graphs, and bestsellers"
                          checked={!!permissions.canViewAnalytics}
                          onChange={() => togglePermission('canViewAnalytics')}
                          color="purple"
                        />
                      </div>
                    </div>

                    {/* Section 6: Staff & User Administration */}
                    <div className="rounded-xl border border-rose-200/80 bg-rose-50/20 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-rose-600" />
                        <h3 className="text-sm font-bold text-slate-900">Staff & User Management</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ToggleItem
                          title="Manage Users (/users, /users/create)"
                          desc="View staff list and create or edit users"
                          checked={!!permissions.canManageUsers}
                          onChange={() => togglePermission('canManageUsers')}
                          color="rose"
                        />
                      </div>
                    </div>

                    {/* Section 7: Hardware & Settings */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Printer className="w-4 h-4 text-slate-600" />
                        <h3 className="text-sm font-bold text-slate-900">Hardware & Preferences</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ToggleItem
                          title="Printers Configuration (/printers)"
                          desc="Configure wired and Bluetooth receipt printers"
                          checked={permissions.canManagePrinters !== false}
                          onChange={() => togglePermission('canManagePrinters')}
                          color="slate"
                        />
                        <ToggleItem
                          title="Personal Profile (/settings/profile)"
                          desc="View and update personal profile details"
                          checked={permissions.canViewSettings !== false}
                          onChange={() => togglePermission('canViewSettings')}
                          color="slate"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Footer */}
                  <div className="pt-4 mt-2 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium shadow-sm transition active:scale-[0.98] flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving Changes...' : 'Save Permissions'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ToggleItem({
  title,
  desc,
  checked,
  onChange,
  color = 'blue'
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
  color?: string;
}) {
  return (
    <label
      onClick={onChange}
      className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
        checked
          ? 'bg-white border-slate-300 shadow-sm'
          : 'bg-white/50 border-slate-200 opacity-60 hover:opacity-100'
      }`}
    >
      <div className="min-w-0 pr-1">
        <p className="text-xs font-bold text-slate-900">{title}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{desc}</p>
      </div>

      <div className="mt-0.5 flex-shrink-0">
        {checked ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
        ) : (
          <XCircle className="w-5 h-5 text-slate-300" />
        )}
      </div>
    </label>
  );
}
