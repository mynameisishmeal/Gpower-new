'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { Save, Eye, Settings as SettingsIcon } from 'lucide-react';

export default function ReceiptSettingsPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'formatting'>('content');
  const [settings, setSettings] = useState({
    storeName: '',
    storeAddress: '',
    receiptFooter: '',
    receiptDisclaimer: '',
    // Text sizes
    headerTextSize: 1,
    storeNameSize: 3,
    addressSize: 0,
    itemsSize: 0,
    priceSize: 0,
    totalSize: 2,
    footerSize: 0,
    // Formatting
    paperWidth: 58,
    showDateTime: true,
    showSeller: true,
    showCustomer: true,
    showDiscount: true,
    showPaymentMethod: true,
    autoCut: true,
    lineSpacing: 1
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
        storeName: data.settings.storeName || '',
        storeAddress: data.settings.storeAddress || '',
        receiptFooter: data.settings.receiptFooter || '',
        receiptDisclaimer: data.settings.receiptDisclaimer || '',
        headerTextSize: data.settings.headerTextSize ?? 1,
        storeNameSize: data.settings.storeNameSize ?? 3,
        addressSize: data.settings.addressSize ?? 0,
        itemsSize: data.settings.itemsSize ?? 0,
        priceSize: data.settings.priceSize ?? 0,
        totalSize: data.settings.totalSize ?? 2,
        footerSize: data.settings.footerSize ?? 0,
        paperWidth: data.settings.paperWidth ?? 58,
        showDateTime: data.settings.showDateTime ?? true,
        showSeller: data.settings.showSeller ?? true,
        showCustomer: data.settings.showCustomer ?? true,
        showDiscount: data.settings.showDiscount ?? true,
        showPaymentMethod: data.settings.showPaymentMethod ?? true,
        autoCut: data.settings.autoCut ?? true,
        lineSpacing: data.settings.lineSpacing ?? 1
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

  const getSizeLabel = (size: number) => {
    switch(size) {
      case 0: return 'Normal';
      case 1: return 'Medium';
      case 2: return 'Large';
      case 3: return 'Extra Large';
      default: return 'Normal';
    }
  };

  const getPreviewSize = (size: number) => {
    switch(size) {
      case 0: return 'text-xs';
      case 1: return 'text-sm';
      case 2: return 'text-base';
      case 3: return 'text-lg font-bold';
      default: return 'text-xs';
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">
            Advanced Receipt Customization
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Settings Panel */}
            <div className="space-y-6">
              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'content'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Content
                </button>
                <button
                  onClick={() => setActiveTab('formatting')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'formatting'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Formatting
                </button>
              </div>

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="Enter store name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Store Address</label>
                    <textarea
                      value={settings.storeAddress}
                      onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      rows={2}
                      placeholder="Enter store address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Footer Message</label>
                    <textarea
                      value={settings.receiptFooter}
                      onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      rows={2}
                      placeholder="Thank you for your business!"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Disclaimer</label>
                    <textarea
                      value={settings.receiptDisclaimer}
                      onChange={(e) => setSettings({ ...settings, receiptDisclaimer: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      rows={3}
                      placeholder="Goods sold are not returnable"
                    />
                  </div>
                </div>
              )}

              {/* Formatting Tab */}
              {activeTab === 'formatting' && (
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Text Sizes</h3>
                    
                    {/* Store Name Size */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Store Name Size: {getSizeLabel(settings.storeNameSize)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        value={settings.storeNameSize}
                        onChange={(e) => setSettings({ ...settings, storeNameSize: Number(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Normal</span>
                        <span>Medium</span>
                        <span>Large</span>
                        <span>XL</span>
                      </div>
                    </div>

                    {/* Address Size */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address Size: {getSizeLabel(settings.addressSize)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        value={settings.addressSize}
                        onChange={(e) => setSettings({ ...settings, addressSize: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Items Size */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Items Text Size: {getSizeLabel(settings.itemsSize)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        value={settings.itemsSize}
                        onChange={(e) => setSettings({ ...settings, itemsSize: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Price Size */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price Size: {getSizeLabel(settings.priceSize)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        value={settings.priceSize}
                        onChange={(e) => setSettings({ ...settings, priceSize: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Total Size */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Total Size: {getSizeLabel(settings.totalSize)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        value={settings.totalSize}
                        onChange={(e) => setSettings({ ...settings, totalSize: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Footer Size */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Footer Size: {getSizeLabel(settings.footerSize)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        value={settings.footerSize}
                        onChange={(e) => setSettings({ ...settings, footerSize: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Display Options</h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.showDateTime}
                          onChange={(e) => setSettings({ ...settings, showDateTime: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium">Show Date & Time</span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.showSeller}
                          onChange={(e) => setSettings({ ...settings, showSeller: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium">Show Seller Name</span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.showCustomer}
                          onChange={(e) => setSettings({ ...settings, showCustomer: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium">Show Customer Name</span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.showDiscount}
                          onChange={(e) => setSettings({ ...settings, showDiscount: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium">Show Discount</span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.showPaymentMethod}
                          onChange={(e) => setSettings({ ...settings, showPaymentMethod: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium">Show Payment Method</span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.autoCut}
                          onChange={(e) => setSettings({ ...settings, autoCut: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium">Auto-cut Paper</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Paper Width
                    </label>
                    <select
                      value={settings.paperWidth}
                      onChange={(e) => setSettings({ ...settings, paperWidth: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    >
                      <option value={58}>58mm (Standard)</option>
                      <option value={80}>80mm (Wide)</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-all font-semibold text-lg"
              >
                <Save className="h-6 w-6" />
                Save All Settings
              </button>
            </div>

            {/* Preview Panel - Part 2 in next chunk */}

            {/* Live Preview Panel */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Live Preview</h2>
              </div>
              
              <div className="bg-gray-900 text-white p-6 rounded-lg font-mono overflow-auto max-h-[600px]">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className={`font-bold ${getPreviewSize(settings.storeNameSize)}`}>
                    {settings.storeName || 'GPOWER CRM'}
                  </div>
                  {settings.storeAddress && (
                    <div className={`text-gray-300 mt-1 whitespace-pre-line ${getPreviewSize(settings.addressSize)}`}>
                      {settings.storeAddress}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">================================</div>
                </div>

                {/* Date & Time */}
                {settings.showDateTime && (
                  <div className="mb-4 text-xs">
                    <div>Date: 15-1-2025</div>
                    <div>Time: 2:30 PM</div>
                  </div>
                )}

                {/* Seller */}
                {settings.showSeller && (
                  <div className="mb-4 text-xs">
                    <div>Seller: admin@gpower.com</div>
                  </div>
                )}

                {/* Customer */}
                {settings.showCustomer && (
                  <div className="mb-4 text-xs">
                    <div>Customer: John Doe</div>
                  </div>
                )}

                <div className="text-xs text-gray-400 mb-2">================================</div>

                {/* Items */}
                <div className="mb-4">
                  <div className={`font-semibold mb-2 ${getPreviewSize(settings.itemsSize)}`}>ITEMS:</div>
                  <div className="text-xs text-gray-400 mb-2">--------------------------------</div>
                  
                  <div className="mb-3">
                    <div className={getPreviewSize(settings.itemsSize)}>Frozen Chicken</div>
                    <div className={`ml-2 ${getPreviewSize(settings.priceSize)}`}>2.5 x N5,000</div>
                    <div className={`ml-2 ${getPreviewSize(settings.priceSize)}`}>Total: N12,500</div>
                  </div>
                  
                  <div className="mb-3">
                    <div className={getPreviewSize(settings.itemsSize)}>Turkey Wings</div>
                    <div className={`ml-2 ${getPreviewSize(settings.priceSize)}`}>3.5 KG x N3,500</div>
                    <div className={`ml-2 ${getPreviewSize(settings.priceSize)}`}>Total: N12,250</div>
                  </div>
                </div>

                <div className="text-xs text-gray-400 mb-2">--------------------------------</div>

                {/* Totals */}
                <div className="mb-4">
                  <div className={getPreviewSize(settings.priceSize)}>Subtotal: N24,750</div>
                  {settings.showDiscount && (
                    <div className={getPreviewSize(settings.priceSize)}>Discount: -N500</div>
                  )}
                  <div className={`font-bold ${getPreviewSize(settings.totalSize)}`}>TOTAL: N24,250</div>
                </div>

                <div className="text-xs text-gray-400 mb-2">================================</div>

                {/* Payment */}
                {settings.showPaymentMethod && (
                  <>
                    <div className="mb-2">
                      <div className={`font-semibold ${getPreviewSize(settings.itemsSize)}`}>PAYMENT:</div>
                      <div className={getPreviewSize(settings.priceSize)}>CASH: N24,250</div>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">================================</div>
                  </>
                )}

                {/* Footer */}
                <div className="text-center mt-4">
                  <div className={getPreviewSize(settings.footerSize)}>
                    {settings.receiptFooter || 'Thank you!'}
                  </div>
                </div>

                {/* Disclaimer */}
                {settings.receiptDisclaimer && (
                  <>
                    <div className="text-xs text-gray-400 my-2">--------------------------------</div>
                    <div className={`text-center text-gray-300 whitespace-pre-line ${getPreviewSize(settings.footerSize)}`}>
                      {settings.receiptDisclaimer}
                    </div>
                  </>
                )}

                <div className="text-xs text-gray-400 mt-2">================================</div>

                {settings.autoCut && (
                  <div className="text-center text-xs text-gray-500 mt-2">
                    [Auto-cut enabled]
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-sm text-blue-900 mb-2">💡 Tips:</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Adjust text sizes for better readability</li>
                  <li>• Preview updates in real-time</li>
                  <li>• Paper width: {settings.paperWidth}mm</li>
                  <li>• Changes apply to all future receipts</li>
                  <li>• Test print after saving changes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
