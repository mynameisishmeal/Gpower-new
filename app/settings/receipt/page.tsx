'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { Save } from 'lucide-react';

export default function ReceiptSettingsPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    storeName: '',
    storeAddress: '',
    receiptFooter: '',
    receiptDisclaimer: ''
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
        storeName: data.settings.storeName,
        storeAddress: data.settings.storeAddress || '',
        receiptFooter: data.settings.receiptFooter,
        receiptDisclaimer: data.settings.receiptDisclaimer || ''
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
      showToast('Receipt settings saved successfully!', 'success');
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">Receipt Customization</h1>

          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter store name"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Store Address (Optional)</label>
              <textarea
                value={settings.storeAddress}
                onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                rows={2}
                placeholder="Enter store address"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Receipt Footer Message</label>
              <textarea
                value={settings.receiptFooter}
                onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                rows={2}
                placeholder="Enter footer message (e.g., Thank you for your business!)"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Receipt Disclaimer (Optional)</label>
              <textarea
                value={settings.receiptDisclaimer}
                onChange={(e) => setSettings({ ...settings, receiptDisclaimer: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Enter disclaimer text (e.g., Goods sold are not returnable)"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              <Save className="h-5 w-5" />
              Save Settings
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Receipt Preview</h2>
            <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm">
              <div className="text-center mb-4">
                <div className="font-bold text-lg">{settings.storeName || 'GPOWER CRM'}</div>
                {settings.storeAddress && (
                  <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">{settings.storeAddress}</div>
                )}
                <div className="text-xs text-gray-600">================================</div>
              </div>
              <div className="mb-4">
                <div>Date: 15-1-2025</div>
                <div>Time: 2:30 PM</div>
              </div>
              <div className="text-xs text-gray-600 mb-2">================================</div>
              <div className="mb-4">
                <div className="font-semibold mb-2">ITEMS:</div>
                <div>Sample Product</div>
                <div className="ml-4">2 Cartons x N5,000</div>
                <div className="ml-4">Total: N10,000</div>
              </div>
              <div className="text-xs text-gray-600 mb-2">================================</div>
              <div className="mb-4">
                <div>Subtotal: N10,000</div>
                <div className="font-bold">TOTAL: N10,000</div>
              </div>
              <div className="text-xs text-gray-600 mb-2">================================</div>
              <div className="text-center mt-4">
                <div>{settings.receiptFooter || 'Thank you!'}</div>
              </div>
              {settings.receiptDisclaimer && (
                <div className="text-center mt-3 text-xs text-gray-600 whitespace-pre-line border-t border-gray-300 pt-3">
                  {settings.receiptDisclaimer}
                </div>
              )}
              <div className="text-xs text-gray-600 mt-2">================================</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
