'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { Save, Bell } from 'lucide-react';

export default function AlertsSettingsPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    lowStockThreshold: 10,
    inventoryAlertsEnabled: false,
    saleAlertsEnabled: false,
    alertEmail: '',
    alertTelegram: ''
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
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const res = await fetch('/api/settings/get');
    const data = await res.json();
    if (data.success) {
      setSettings({
        lowStockThreshold: data.settings.lowStockThreshold,
        inventoryAlertsEnabled: data.settings.inventoryAlertsEnabled,
        saleAlertsEnabled: data.settings.saleAlertsEnabled,
        alertEmail: data.settings.alertEmail || '',
        alertTelegram: data.settings.alertTelegram || ''
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const res = await fetch('/api/settings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });

    const data = await res.json();
    if (data.success) {
      showToast('Alert settings saved successfully!', 'success');
    } else {
      showToast(data.message || 'Failed to save settings', 'error');
    }
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">Alert Settings</h1>

          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Low Stock Threshold</label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">Alert when stock quantity falls below this number</p>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Inventory Alerts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.inventoryAlertsEnabled}
                    onChange={(e) => setSettings({ ...settings, inventoryAlertsEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-600">Get notified when products are running low on stock</p>
            </div>

            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Sale Alerts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.saleAlertsEnabled}
                    onChange={(e) => setSettings({ ...settings, saleAlertsEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-600">Get notified for every sale transaction</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alert Email</label>
              <input
                type="email"
                value={settings.alertEmail}
                onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="your-email@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Email address to receive alerts (Firebase email service)</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Telegram Chat ID (Optional)</label>
              <input
                type="text"
                value={settings.alertTelegram}
                onChange={(e) => setSettings({ ...settings, alertTelegram: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="123456789"
              />
              <p className="text-xs text-gray-500 mt-1">Telegram chat ID for instant notifications</p>
            </div>

            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              <Save className="h-5 w-5" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
