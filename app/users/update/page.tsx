'use client';
import { useState, useEffect, Suspense } from 'react';
import Navigation from '@/components/Navigation';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/components/Toast';

function UpdateUserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    emailconfirmation: '',
    password: '',
    passwordconfirmation: '',
    birthday: '',
    birthmonth: '',
    birthyear: '',
    gender: '',
    country: '',
    city: '',
    countrycode: '',
    phonenumber: '',
    role: 'worker'
  });

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    setFetchingUser(true);
    try {
      const res = await fetch(`/api/users/get?id=${userId}`);
      const data = await res.json();
      if (data.user) {
        setFormData({
          firstname: data.user.firstname || '',
          lastname: data.user.lastname || '',
          email: data.user.email || '',
          emailconfirmation: data.user.email || '',
          password: data.user.password || '',
          passwordconfirmation: data.user.password || '',
          birthday: data.user.birthday || '',
          birthmonth: data.user.birthmonth || '',
          birthyear: data.user.birthyear || '',
          gender: data.user.gender || '',
          country: data.user.country || '',
          city: data.user.city || '',
          countrycode: data.user.countrycode || '',
          phonenumber: data.user.phonenumber || '',
          role: data.user.role || 'worker'
        });
      }
    } catch (error) {
      showToast('Failed to load user data', 'error');
    } finally {
      setFetchingUser(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (formData.email !== formData.emailconfirmation) {
      newErrors.emailconfirmation = 'Emails do not match';
    }
    
    if (formData.password !== formData.passwordconfirmation) {
      newErrors.passwordconfirmation = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/users/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, ...formData })
      });
      
      if (res.ok) {
        showToast('User updated successfully!', 'success');
        setTimeout(() => router.push('/users'), 1000);
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to update user', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Update User</h1>
          
          {fetchingUser ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading user data...</p>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                <input type="text" required value={formData.firstname} onChange={(e) => setFormData({...formData, firstname: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                <input type="text" required value={formData.lastname} onChange={(e) => setFormData({...formData, lastname: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Repeat Email *</label>
                <input 
                  type="email" 
                  required 
                  value={formData.emailconfirmation} 
                  onChange={(e) => setFormData({...formData, emailconfirmation: e.target.value})} 
                  className={`w-full px-4 py-3 border rounded-lg ${errors.emailconfirmation ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.emailconfirmation && <p className="text-red-500 text-xs mt-1">{errors.emailconfirmation}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    className={`w-full px-4 py-3 border rounded-lg pr-10 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    required 
                    value={formData.passwordconfirmation} 
                    onChange={(e) => setFormData({...formData, passwordconfirmation: e.target.value})} 
                    className={`w-full px-4 py-3 border rounded-lg pr-10 ${errors.passwordconfirmation ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.passwordconfirmation && <p className="text-red-500 text-xs mt-1">{errors.passwordconfirmation}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
              <div className="grid grid-cols-3 gap-4">
                <select required value={formData.birthday} onChange={(e) => setFormData({...formData, birthday: e.target.value})} className="px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="">Day</option>
                  {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select required value={formData.birthmonth} onChange={(e) => setFormData({...formData, birthmonth: e.target.value})} className="px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="">Month</option>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select required value={formData.birthyear} onChange={(e) => setFormData({...formData, birthyear: e.target.value})} className="px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="">Year</option>
                  {Array.from({length: 100}, (_, i) => 2024 - i).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input type="radio" required value="male" checked={formData.gender === 'male'} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="mr-2" />
                  Male
                </label>
                <label className="flex items-center">
                  <input type="radio" required value="female" checked={formData.gender === 'female'} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="mr-2" />
                  Female
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
                <input type="text" required value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country Code</label>
                <input type="text" value={formData.countrycode} onChange={(e) => setFormData({...formData, countrycode: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input type="text" value={formData.phonenumber} onChange={(e) => setFormData({...formData, phonenumber: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">User Role *</label>
              <select required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                <option value="worker">WORKER</option>
                <option value="admin">ADMIN</option>
                <option value="sadmin">SUPER ADMIN</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </button>
              <button 
                type="button" 
                onClick={() => router.push('/users')} 
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

export default function UpdateUserPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center"><Loader2 className="h-12 w-12 text-blue-600 animate-spin" /></div>}>
      <UpdateUserForm />
    </Suspense>
  );
}
