'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Users, UserPlus, Edit, Trash2, Shield, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { useConfirmModal } from '@/components/ConfirmModal';

export default function UsersPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const { showConfirm, ConfirmModalComponent } = useConfirmModal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/users/list');
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  const handleDelete = async (id: string, userName: string) => {
    showConfirm(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      async () => {
        setDeletingId(id);
        try {
          const res = await fetch(`/api/users/delete?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('User deleted successfully!', 'success');
            fetchUsers();
          } else {
            showToast('Failed to delete user', 'error');
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
      const res = await fetch('/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole })
      });
      if (res.ok) {
        showToast(`User role updated to ${newRole}!`, 'success');
        fetchUsers();
      } else {
        showToast('Failed to update role', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setPromotingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      sadmin: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      worker: 'bg-green-100 text-green-700'
    };
    return styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

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
                <Users className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Users</h1>
              </div>
              <button 
                onClick={() => router.push('/users/create')}
                className="btn-modern bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                Add User
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                <div className="text-gray-500">Loading users...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="mb-4 text-sm text-gray-600">
                  Showing {users.length} user{users.length !== 1 ? 's' : ''}
                </div>
                <table className="w-full table-modern">
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
                    {users.map((user: any) => (
                      <tr key={user._id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-gray-400" />
                            <span className="font-medium text-gray-900">{user.firstname} {user.lastname}</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-700">{user.email}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">
                              {showPasswords[user._id] ? user.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => setShowPasswords(prev => ({...prev, [user._id]: !prev[user._id]}))}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {showPasswords[user._id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3 text-gray-700">{user.phonenumber}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2 flex-wrap">
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
                            <button 
                              onClick={() => router.push(`/users/update?id=${user._id}`)}
                              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(user._id, `${user.firstname} ${user.lastname}`)}
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
