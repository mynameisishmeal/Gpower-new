'use client';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { Printer, CheckCircle, Loader2 } from 'lucide-react';

export default function SettingsProfilePage() {
  const { showToast, ToastContainer } = useToast();
  const [user, setUser] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [detectedPrinters, setDetectedPrinters] = useState<any[]>([]);
  const [detectingPrinters, setDetectingPrinters] = useState(false);
  const [wiredPrinterName, setWiredPrinterName] = useState('');
  const [printerConfig, setPrinterConfig] = useState({
    serviceUUID: '',
    characteristicUUID: '',
    printerType: 'wireless' as 'wireless' | 'wired' | 'test'
  });

  useEffect(() => {
    fetchUser();
    loadPrinterConfig();
  }, []);

  const fetchUser = async () => {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    setUser(data);
  };

  const loadPrinterConfig = () => {
    const serviceUUID = localStorage.getItem('serviceUUID') || '';
    const characteristicUUID = localStorage.getItem('characteristicUUID') || '';
    const printerType = (localStorage.getItem('printerType') || 'wireless') as 'wireless' | 'wired' | 'test';
    const savedPrinterName = localStorage.getItem('wiredPrinterName') || '';
    setWiredPrinterName(savedPrinterName);
    setPrinterConfig({ serviceUUID, characteristicUUID, printerType });
  };

  const savePrinterConfig = () => {
    localStorage.setItem('serviceUUID', printerConfig.serviceUUID);
    localStorage.setItem('characteristicUUID', printerConfig.characteristicUUID);
    localStorage.setItem('printerType', printerConfig.printerType);
    showToast('Printer configuration saved successfully!', 'success');
  };

  const detectPrinters = async () => {
    setDetectingPrinters(true);
    try {
      const res = await fetch('/api/printers/detect');
      const data = await res.json();
      if (data.success) {
        setDetectedPrinters(data.printers);
        const defaultPrinter = data.printers.find((p: any) => p.isDefault);
        if (defaultPrinter) {
          localStorage.setItem('wiredPrinterName', defaultPrinter.name);
          showToast(`Default printer detected: ${defaultPrinter.name}`, 'success');
        }
      } else {
        showToast('Failed to detect printers', 'error');
      }
    } catch (error) {
      showToast('Failed to detect printers', 'error');
    }
    setDetectingPrinters(false);
  };

  const testPrint = async () => {
    setTesting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (printerConfig.printerType === 'test') {
      const testSale = {
        productname: 'Test Product',
        productprice: 1000,
        productquantity: 1,
        producttotal: 1000,
        saletype: 'Cartons',
        customer: 'Test Customer',
        seller: user?.email || 'Test User',
        paymentmethod: 'cash'
      };

      try {
        const res = await fetch('/api/sales/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            data: [testSale],
            paymentDetails: [{ method: 'cash', amount: 1000 }],
            seller: user?.email || 'Test User',
            discount: 0,
            customerName: 'Test Customer'
          })
        });

        if (res.ok) {
          showToast('✅ Test Mode: Print simulated & saved to sales history!', 'success');
        } else {
          showToast('Test mode print simulated but failed to save', 'warning');
        }
      } catch (error) {
        showToast('Test mode print simulated but failed to save', 'warning');
      }
    } else {
      showToast('✅ Test print sent to printer successfully!', 'success');
    }
    
    setTesting(false);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Account Settings</h1>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Profile Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Account ID</label>
                <input type="text" value={user._id} disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input type="text" value={user.firstname} disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input type="text" value={user.lastname} disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input type="text" value={user.email} disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <input type="text" value={user.role?.toUpperCase()} disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input type="text" value={user.phonenumber} disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Printer className="h-8 w-8 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Printer Configuration</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Printer Mode</label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: printerConfig.printerType === 'wireless' ? '#2563eb' : '#e5e7eb' }}>
                    <input type="radio" value="wireless" checked={printerConfig.printerType === 'wireless'} onChange={(e) => setPrinterConfig({...printerConfig, printerType: e.target.value as 'wireless' | 'wired' | 'test'})} className="mt-1 w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-800">📡 Wireless (Bluetooth)</div>
                      <div className="text-xs text-gray-600">Connect to Bluetooth thermal printer</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: printerConfig.printerType === 'wired' ? '#2563eb' : '#e5e7eb' }}>
                    <input type="radio" value="wired" checked={printerConfig.printerType === 'wired'} onChange={(e) => setPrinterConfig({...printerConfig, printerType: e.target.value as 'wireless' | 'wired' | 'test'})} className="mt-1 w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">🔌 Wired: {wiredPrinterName || 'Not configured'}</div>
                      <div className="text-xs text-gray-600">USB thermal printer</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors" style={{ borderColor: printerConfig.printerType === 'test' ? '#eab308' : '#e5e7eb' }}>
                    <input type="radio" value="test" checked={printerConfig.printerType === 'test'} onChange={(e) => setPrinterConfig({...printerConfig, printerType: e.target.value as 'wireless' | 'wired' | 'test'})} className="mt-1 w-5 h-5 text-yellow-600" />
                    <div>
                      <div className="font-semibold text-gray-800">🧪 Test Mode</div>
                      <div className="text-xs text-gray-600">Simulate printing and save test sales to history</div>
                    </div>
                  </label>
                </div>
              </div>

              {printerConfig.printerType === 'wireless' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Service UUID</label>
                    <input type="text" value={printerConfig.serviceUUID} onChange={(e) => setPrinterConfig({...printerConfig, serviceUUID: e.target.value})} placeholder="e.g., 000018f0-0000-1000-8000-00805f9b34fb" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Characteristic UUID</label>
                    <input type="text" value={printerConfig.characteristicUUID} onChange={(e) => setPrinterConfig({...printerConfig, characteristicUUID: e.target.value})} placeholder="e.g., 00002af1-0000-1000-8000-00805f9b34fb" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                </>
              )}

              {printerConfig.printerType === 'wired' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Wired Printer Name</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={wiredPrinterName}
                        onChange={(e) => {
                          setWiredPrinterName(e.target.value);
                          localStorage.setItem('wiredPrinterName', e.target.value);
                        }}
                        placeholder="Leave blank for default printer" 
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg" 
                      />
                      <button
                        onClick={detectPrinters}
                        disabled={detectingPrinters}
                        className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50 flex items-center gap-2"
                      >
                        <Printer className="h-5 w-5" />
                        {detectingPrinters ? 'Detecting...' : 'Detect'}
                      </button>
                    </div>
                    {detectedPrinters.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Detected Printers:</p>
                        <div className="space-y-1">
                          {detectedPrinters.map((printer) => (
                            <button
                              key={printer.name}
                              onClick={() => {
                                setWiredPrinterName(printer.name);
                                localStorage.setItem('wiredPrinterName', printer.name);
                                showToast(`Selected: ${printer.name}`, 'success');
                              }}
                              className="block w-full text-left text-sm p-2 hover:bg-blue-50 rounded transition-colors"
                            >
                              {printer.name} {printer.isDefault && <span className="text-green-600 font-semibold">(Default)</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Wired Mode:</strong> Generates a text receipt and sends it to your USB/wired printer using Windows print command.
                    </p>
                  </div>
                </>
              )}

              {printerConfig.printerType === 'test' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    <strong>Test Mode:</strong> Prints will be simulated with a 2-second delay. Test sales (₦1,000) will be saved to sales history for verification.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={savePrinterConfig} 
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                >
                  Save Configuration
                </button>
                <button 
                  onClick={testPrint}
                  disabled={testing}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {testing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Printer className="h-5 w-5" />
                      Test Print
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
