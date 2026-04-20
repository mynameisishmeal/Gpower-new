'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    phonenumber: '',
    role: 'worker',
    city: '',
    gender: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert('User created!');
      router.push('/users');
    } else {
      alert('Failed to create user');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">First Name</label>
            <input 
              type="text"
              required
              className="w-full p-2 border rounded"
              value={formData.firstname}
              onChange={(e) => setFormData({...formData, firstname: e.target.value})}
            />
          </div>
          <div>
            <label className="block mb-2">Last Name</label>
            <input 
              type="text"
              required
              className="w-full p-2 border rounded"
              value={formData.lastname}
              onChange={(e) => setFormData({...formData, lastname: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block mb-2">Email</label>
          <input 
            type="email"
            required
            className="w-full p-2 border rounded"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block mb-2">Password</label>
          <input 
            type="password"
            required
            className="w-full p-2 border rounded"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <div>
          <label className="block mb-2">Phone</label>
          <input 
            type="tel"
            className="w-full p-2 border rounded"
            value={formData.phonenumber}
            onChange={(e) => setFormData({...formData, phonenumber: e.target.value})}
          />
        </div>

        <div>
          <label className="block mb-2">Role</label>
          <select 
            className="w-full p-2 border rounded"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <option value="worker">Worker</option>
            <option value="admin">Admin</option>
            <option value="sadmin">Super Admin</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
            Create User
          </button>
          <button 
            type="button"
            onClick={() => router.push('/users')}
            className="bg-gray-400 text-white px-6 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
