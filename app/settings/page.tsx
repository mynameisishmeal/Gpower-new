'use client';

import { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';

interface DetectedPrinter {
  name: string;
  isDefault: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    businessName: 'Gpower Frozen Foods',
    address: '',
    phone: '',
    email: '',
    taxRate: '0',
    currency: 'NGN',
    printerName: ''
  });
  const [detectedPrinters, setDetectedPrinters] = useState<DetectedPrinter[]>([]);
  const [detectingPrinters, setDetectingPrinters] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('settings');
    if (saved) {
      setSettings({...settings, ...JSON.parse(saved)});
    }
  }, []);

  const detectPrinters = async () => {
    setDetectingPrinters(true);
    try {
      const res = await fetch('/api/printers/detect');
      const data = await res.json();
      if (data.success) {
        setDetectedPrinters(data.printers);
        const defaultPrinter = data.printers.find((p: DetectedPrinter) => p.isDefault);
        if (defaultPrinter) {
          setSettings({...settings, printerName: defaultPrinter.name});
        }
      }
    } catch (error) {
      alert('Failed to detect printers');
    }
    setDetectingPrinters(false);
  };

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('Settings saved!');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Business Name</label>
          <input 
            type="text"
            className="w-full p-2 border rounded"
            value={settings.businessName}
            onChange={(e) => setSettings({...settings, businessName: e.target.value})}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Address</label>
          <input 
            type="text"
            className="w-full p-2 border rounded"
            value={settings.address}
            onChange={(e) => setSettings({...settings, address: e.target.value})}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Phone</label>
          <input 
            type="tel"
            className="w-full p-2 border rounded"
            value={settings.phone}
            onChange={(e) => setSettings({...settings, phone: e.target.value})}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Email</label>
          <input 
            type="email"
            className="w-full p-2 border rounded"
            value={settings.email}
            onChange={(e) => setSettings({...settings, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Tax Rate (%)</label>
          <input 
            type="number"
            step="0.01"
            min="0"
            className="w-full p-2 border rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={settings.taxRate}
            onChange={(e) => setSettings({...settings, taxRate: e.target.value})}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Currency</label>
          <select 
            className="w-full p-2 border rounded"
            value={settings.currency}
            onChange={(e) => setSettings({...settings, currency: e.target.value})}
          >
            <option value="NGN">NGN (₦)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Printer Name</label>
          <div className="flex gap-2">
            <input 
              type="text"
              className="flex-1 p-2 border rounded"
              value={settings.printerName}
              onChange={(e) => setSettings({...settings, printerName: e.target.value})}
              placeholder="Leave empty for default printer"
            />
            <button
              onClick={detectPrinters}
              disabled={detectingPrinters}
              className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-700"
            >
              <Printer className="h-4 w-4" />
              {detectingPrinters ? 'Detecting...' : 'Detect'}
            </button>
          </div>
          {detectedPrinters.length > 0 && (
            <div className="mt-2 p-3 bg-gray-50 rounded border">
              <p className="text-sm font-medium mb-2">Detected Printers:</p>
              <div className="space-y-1">
                {detectedPrinters.map((printer) => (
                  <button
                    key={printer.name}
                    onClick={() => setSettings({...settings, printerName: printer.name})}
                    className="block w-full text-left text-sm p-2 hover:bg-blue-50 rounded"
                  >
                    {printer.name} {printer.isDefault && <span className="text-green-600 font-semibold">(Default)</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
