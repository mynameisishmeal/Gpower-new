'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Users, UserPlus, Edit, Trash2, Shield, User, Eye, EyeOff, Loader2, Lock, Search, X } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { useConfirmModal } from '@/components/ConfirmModal';

export default function UsersPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const { showConfirm, ConfirmModalComponent } = useConfirmModal();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(rawUser);
      // Strictly prevent user and admin unless granted canManageUsers by Super Admin
      const hasPermission = userData.role === 'sadmin' || userData.permissions?.canManageUsers === true;
      if (!hasPermission) {
        showToast('Access denied! You do not have permission to access the Users page.', 'error');
        router.push('/dashboard');
        return;
      }
      setAuthorized(true);
      const userRole = (userData.role || '').trim().toLowerCase();
      setCurrentUserRole(userRole);
      fetchUsers(userData.email);
    } catch {
      router.push('/login');
    }
  }, [router]);

  const fetchUsers = async (overrideEmail?: string) => {
    setLoading(true);
    try {
      const rawUser = localStorage.getItem('user');
      const userData = rawUser ? JSON.parse(rawUser) : null;
      const email = overrideEmail || userData?.email || '';

      const res = await fetch(`/api/users/list?requesterEmail=${encodeURIComponent(email)}&_t=${Date.now()}`, {
        headers: {
          'x-user-email': email
        },
        cache: 'no-store'
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, userName: string, targetRole?: string) => {
    const isSuperAdmin = currentUserRole === 'sadmin' || currentUserRole === 'super admin';
    const isTargetSuperAdmin = (targetRole || '').trim().toLowerCase() === 'sadmin';

    if (!isSuperAdmin && isTargetSuperAdmin) {
      showToast('Access denied! Regular admins cannot delete Super Admin accounts.', 'error');
      return;
    }

    showConfirm(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      async () => {
        setDeletingId(id);
        try {
          const rawUser = localStorage.getItem('user');
          const userData = rawUser ? JSON.parse(rawUser) : null;
          const email = userData?.email || '';

          const res = await fetch(`/api/users/delete?id=${id}&requesterEmail=${encodeURIComponent(email)}`, { 
            method: 'DELETE',
            headers: {
              'x-user-email': email
            }
          });
          if (res.ok) {
            showToast('User deleted successfully!', 'success');
            fetchUsers();
          } else {
            const data = await res.json().catch(() => ({}));
            showToast(data.error || 'Failed to delete user', 'error');
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

  const handlePromote = async (id: string, newRole: string, currentRole: string) => {
    if (newRole === currentRole) return;
    
    setPromotingId(id);
    try {
      const rawUser = localStorage.getItem('user');
      const userData = rawUser ? JSON.parse(rawUser) : null;
      const email = userData?.email || '';

      const res = await fetch('/api/users/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': email
        },
        body: JSON.stringify({ id, role: newRole, requesterEmail: email })
      });
      if (res.ok) {
        showToast(`User role updated to ${newRole}!`, 'success');
        fetchUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to update role', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setPromotingId(null);
    }
  };

  // Permissions rule:
  // - Super admin can see all passwords
  // - Regular admin can only view worker password
  // - Regular admin cannot see super admin password (or admin password)
  const canViewPassword = (targetRole?: string) => {
    const curRole = (currentUserRole || '').trim().toLowerCase();
    const tgtRole = (targetRole || '').trim().toLowerCase();

    // Super Admin can see all passwords
    if (curRole === 'sadmin' || curRole === 'super admin') return true;

    // Regular admin can ONLY view worker password
    if (curRole === 'admin' && tgtRole === 'worker') return true;

    // Regular admin CANNOT see super admin password or other admin password
    return false;
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      sadmin: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      worker: 'bg-green-100 text-green-700'
    };
    return styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  const filteredUsers = users.filter((user: any) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const fullName = `${user.firstname || ''} ${user.lastname || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const role = (user.role || '').toLowerCase();
    const phone = (user.phonenumber || '').toLowerCase();
    return fullName.includes(term) || email.includes(term) || role.includes(term) || phone.includes(term);
  });

  if (!authorized) {
    return (
      <>
        <ToastContainer />
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p>Verifying permissions...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <ConfirmModalComponent />
      <Navigation />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                  <p className="text-sm text-gray-600 mt-1">Manage system user accounts and credentials</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/users/create')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-sm hover:shadow flex items-center gap-2 transition-all cursor-pointer"
              >
                <UserPlus className="h-5 w-5" />
                Add User
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input 
                type="text"
                placeholder="Search users by name, email, role, or phone..."
                className="w-full pl-11 pr-10 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-sm placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search feedback counter */}
            {searchTerm && (
              <div className="mb-4 flex items-center justify-between text-sm text-gray-600 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200">
                <span>
                  Found <strong>{filteredUsers.length}</strong> user{filteredUsers.length !== 1 ? 's' : ''} matching &quot;<strong>{searchTerm}</strong>&quot;
                </span>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                <div className="text-gray-500">Loading users...</div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                {searchTerm ? (
                  <>
                    <p className="text-gray-800 font-semibold text-lg mb-1">No matching users</p>
                    <p className="text-gray-500 text-sm mb-4">No user accounts match &quot;{searchTerm}&quot;</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-sm transition-all text-sm inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="h-4 w-4" /> Clear Search
                    </button>
                  </>
                ) : (
                  <p className="text-gray-500 text-lg">No users found</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                {!searchTerm && (
                  <div className="mb-4 text-sm text-gray-600">
                    Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                  </div>
                )}
                <table className="w-full border-separate border-spacing-0 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left font-semibold text-gray-700">Name</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Email</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Password</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Role</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Phone</th>
                      <th className="p-3 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user: any) => (
                      <tr key={user._id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-gray-400" />
                            <span className="font-medium text-gray-900">{user.firstname} {user.lastname}</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-700">{user.email}</td>
                        <td className="p-3">
                          {canViewPassword(user.role) ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">
                                {showPasswords[user._id] ? user.password : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({...prev, [user._id]: !prev[user._id]}))}
                                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
                                title={showPasswords[user._id] ? "Hide password" : "View password"}
                              >
                                {showPasswords[user._id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          ) : (
                            <div 
                              className="flex items-center gap-1.5 text-gray-400 select-none"
                              title={user.role === 'sadmin' ? 'Super Admin password is protected' : 'Admin password is protected'}
                            >
                              <span className="font-mono text-sm">••••••••</span>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                <Lock className="h-3 w-3 text-gray-400" />
                                Protected
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3 text-gray-700">{user.phonenumber}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            {currentUserRole === 'sadmin' && (
                              <>
                                <div className="flex items-center gap-2">
                                  <label className="text-xs text-gray-600 font-semibold">Promote:</label>
                                  <select
                                    value={user.role}
                                    onChange={(e) => handlePromote(user._id, e.target.value, user.role)}
                                    disabled={promotingId === user._id}
                                    className="text-xs px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <option value="worker">Worker</option>
                                    <option value="admin">Admin</option>
                                    <option value="sadmin">Super Admin</option>
                                  </select>
                                  {promotingId === user._id && (
                                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                                  )}
                                </div>
                                <div className="h-4 w-px bg-gray-300"></div>
                              </>
                            )}
                            {currentUserRole !== 'sadmin' && user.role === 'sadmin' ? (
                              <span className="text-xs text-gray-400 italic flex items-center gap-1 px-2 py-1">
                                <Lock className="h-3.5 w-3.5 text-gray-400" />
                                Protected
                              </span>
                            ) : (
                              <>
                                <button 
                                  onClick={() => router.push(`/users/update?id=${user._id}`)}
                                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDelete(user._id, `${user.firstname} ${user.lastname}`, user.role)}
                                  disabled={deletingId === user._id}
                                  className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {deletingId === user._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                  Delete
                                </button>
                              </>
                            )}
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
