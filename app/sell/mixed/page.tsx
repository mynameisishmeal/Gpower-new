'use client';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Trash2, Bluetooth, Printer, TestTube2 } from 'lucide-react';
import { BluetoothPrinter } from '@/lib/bluetooth';
import { useToast } from '@/components/Toast';
import { SearchableSelect } from '@/components/SearchableSelect';

interface Product {
  _id: string;
  productname: string;
  productprice: number;
  productweight: number;
  productquantity: number;
}

interface Stock {
  _id: string;
  stockname: string;
  stockprice: number;
  stockweight: number;
  stockquantity: number;
}

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  total: number;
  type: 'carton' | 'piece';
}

export default function SellMixedPage() {
  const { showToast, ToastContainer } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [discount, setDiscount] = useState('');
  const [saleType, setSaleType] = useState<'carton' | 'piece'>('carton');
  const [printerMode, setPrinterMode] = useState<'wireless' | 'wired' | 'test'>('wireless');
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [bluetoothPrinter, setBluetoothPrinter] = useState<BluetoothPrinter | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [receiptSettings, setReceiptSettings] = useState({
    storeName: 'GPOWER CRM',
    storeAddress: '',
    receiptFooter: 'Thank you!',
    receiptDisclaimer: ''
  });
  const [paymentMethods, setPaymentMethods] = useState({
    cash: { checked: false, amount: '' },
    transfer: { checked: false, amount: '' },
    card: { checked: false, amount: '' },
    credit: { checked: false, amount: '' }
  });

  useEffect(() => {
    // Load printer mode on mount
    const loadPrinterMode = async () => {
      const mode = (localStorage.getItem('printerType') || 'wireless') as 'wireless' | 'wired' | 'test';
      console.log('Detected printer mode:', mode);
      setPrinterMode(mode);
      
      if (mode === 'wireless') {
        // Load UUIDs from localStorage
        const serviceUUID = localStorage.getItem('serviceUUID') || undefined;
        const characteristicUUID = localStorage.getItem('characteristicUUID') || undefined;
        
        const printer = new BluetoothPrinter(serviceUUID, characteristicUUID);
        setBluetoothPrinter(printer);
        
        // Try to restore previous connection
        const restored = await printer.tryRestoreConnection();
        if (restored) {
          setBluetoothConnected(true);
          showToast('Bluetooth connection restored!', 'success');
        } else {
          setBluetoothConnected(false);
        }
      }
    };

    loadPrinterMode();

    // Listen for storage changes (when settings are updated in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'printerType') {
        loadPrinterMode();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on window focus (when user returns from settings page)
    const handleFocus = () => {
      loadPrinterMode();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal - (parseFloat(discount) || 0) > 0 ? subtotal - (parseFloat(discount) || 0) : 0;
  const paymentTotal = Object.values(paymentMethods).reduce((sum, pm) => sum + (pm.checked ? (Number(pm.amount) || 0) : 0), 0);
  const remaining = total - paymentTotal;

  // Auto-update cash payment when cart or discount changes
  useEffect(() => {
    if (cart.length > 0) {
      setPaymentMethods(prev => ({
        ...prev,
        cash: { checked: true, amount: total.toString() }
      }));
    }
  }, [cart, discount]);

  useEffect(() => {
    fetchProducts();
    fetchStock();
    fetchCustomers();
    fetchReceiptSettings();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products/list');
    const data = await res.json();
    setProducts(data.products || []);
  };

  const fetchStock = async () => {
    const res = await fetch('/api/stock/list');
    const data = await res.json();
    setStock(data.stocks || []);
  };

  const fetchCustomers = async () => {
    const res = await fetch('/api/customers/list');
    const data = await res.json();
    setCustomers(data.customers?.map((c: any) => c.name) || []);
  };

  const fetchReceiptSettings = async () => {
    const res = await fetch('/api/settings/get');
    const data = await res.json();
    if (data.success) {
      setReceiptSettings({
        storeName: data.settings.storeName || 'GPOWER CRM',
        storeAddress: data.settings.storeAddress || '',
        receiptFooter: data.settings.receiptFooter || 'Thank you!',
        receiptDisclaimer: data.settings.receiptDisclaimer || ''
      });
    }
  };

  const addToCart = () => {
    if (!selectedItem) return;
    if (saleType === 'carton') {
      const item = stock.find(s => s._id === selectedItem);
      if (!item) return;
      if (item.stockquantity < Number(quantity)) {
        showToast(`Insufficient stock! Only ${item.stockquantity} cartons available`, 'error');
        return;
      }
      const itemTotal = item.stockprice * Number(quantity);
      setCart([...cart, { name: item.stockname, price: item.stockprice, quantity: Number(quantity), total: itemTotal, type: 'carton' }]);
    } else {
      const item = products.find(p => p._id === selectedItem);
      if (!item) return;
      const itemTotal = item.productprice * Number(quantity);
      setCart([...cart, { name: item.productname, price: item.productprice, quantity: Number(quantity), total: itemTotal, type: 'piece' }]);
    }
    setSelectedItem('');
    setQuantity('1');
    fetchProducts();
    fetchStock();
  };

  const clearAll = () => {
    setCart([]);
    setPaymentMethods({
      cash: { checked: false, amount: '' },
      transfer: { checked: false, amount: '' },
      card: { checked: false, amount: '' },
      credit: { checked: false, amount: '' }
    });
  };

  const handlePaymentCheck = (method: keyof typeof paymentMethods, checked: boolean) => {
    setPaymentMethods(prev => ({
      ...prev,
      [method]: { ...prev[method], checked, amount: checked ? prev[method].amount : '' }
    }));
  };

  const handlePaymentAmount = (method: keyof typeof paymentMethods, amount: string) => {
    const numAmount = Number(amount) || 0;
    const currentTotal = Object.entries(paymentMethods).reduce((sum, [key, pm]) => {
      if (key === method) return sum;
      return sum + (pm.checked ? (Number(pm.amount) || 0) : 0);
    }, 0);
    
    if (currentTotal + numAmount > total) {
      showToast('Payment total cannot exceed sale total!', 'error');
      return;
    }
    
    setPaymentMethods(prev => ({
      ...prev,
      [method]: { ...prev[method], amount }
    }));
  };

  const handleBluetoothToggle = async () => {
    if (!bluetoothPrinter) {
      showToast('Bluetooth printer not initialized', 'error');
      return;
    }

    if (bluetoothConnected) {
      await bluetoothPrinter.disconnect();
      setBluetoothConnected(false);
      showToast('Bluetooth disconnected', 'info');
    } else {
      showToast('Connecting to Bluetooth printer...', 'info');
      const connected = await bluetoothPrinter.connect();
      if (connected) {
        setBluetoothConnected(true);
        showToast('Bluetooth connected successfully!', 'success');
      } else {
        setBluetoothConnected(false);
        showToast('Failed to connect to Bluetooth printer', 'error');
      }
    }
  };

  const handlePrint = async () => {
    if (cart.length === 0) {
      showToast('Cart is empty!', 'warning');
      return;
    }

    const hasPaymentMethod = Object.values(paymentMethods).some(pm => pm.checked);
    if (!hasPaymentMethod) {
      showToast('Please select at least one payment method!', 'error');
      return;
    }

    if (remaining > 0) {
      showToast(`Payment incomplete! Remaining: ₦${remaining.toLocaleString()}`, 'error');
      return;
    }

    if (printerMode === 'wireless') {
      if (!bluetoothPrinter || !bluetoothConnected) {
        showToast('Bluetooth printer not connected!', 'error');
        return;
      }
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const currentTime = `${displayHours}:${minutes} ${ampm}`;
    const currentDate = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;

    let receipt = '\n================================\n';
    receipt += `       ${receiptSettings.storeName}\n`;
    if (receiptSettings.storeAddress) {
      receipt += `${receiptSettings.storeAddress}\n`;
    }
    receipt += '================================\n';
    receipt += `Date: ${currentDate}\n`;
    receipt += `Time: ${currentTime}\n`;
    receipt += '================================\n\n';
    if (customerName) {
      receipt += `Customer: ${customerName}\n\n`;
    }
    receipt += 'ITEMS:\n';
    receipt += '--------------------------------\n';
    
    cart.forEach(item => {
      receipt += `${item.name}\n`;
      receipt += `  ${item.quantity} ${item.type === 'carton' ? 'x' : 'KG x'} N${item.price.toLocaleString()}\n`;
      receipt += `  Total: N${item.total.toLocaleString()}\n\n`;
    });
    
    receipt += '--------------------------------\n';
    receipt += `Subtotal: N${subtotal.toLocaleString()}\n`;
    if (discount && parseFloat(discount) > 0) {
      receipt += `Discount: -N${parseFloat(discount).toLocaleString()}\n`;
    }
    receipt += `TOTAL: N${total.toLocaleString()}\n`;
    receipt += '================================\n';
    
    receipt += '\nPAYMENT:\n';
    Object.entries(paymentMethods).forEach(([method, pm]) => {
      if (pm.checked && Number(pm.amount) > 0) {
        receipt += `${method.toUpperCase()}: N${Number(pm.amount).toLocaleString()}\n`;
      }
    });
    
    receipt += '\n================================\n';
    receipt += `     ${receiptSettings.receiptFooter}\n`;
    if (receiptSettings.receiptDisclaimer) {
      receipt += '--------------------------------\n';
      receipt += `${receiptSettings.receiptDisclaimer}\n`;
    }
    receipt += '================================\n\n\n\n';

    if (printerMode === 'wireless') {
      if (!bluetoothPrinter) {
        console.warn('Bluetooth printer not initialized - skipping print');
        showToast('Sale completed (print skipped - Bluetooth not initialized)', 'warning');
        await handleCompleteSale();
        return;
      }
      if (!bluetoothConnected) {
        console.warn('Bluetooth not connected - skipping print');
        showToast('Sale completed (print skipped - Bluetooth not connected)', 'warning');
        await handleCompleteSale();
        return;
      }
      
      console.log('Attempting to send data to Bluetooth printer...');
      const success = await bluetoothPrinter.sendData(receipt);
      console.log('Bluetooth send result:', success);
      
      if (success) {
        showToast('Receipt printed successfully!', 'success');
      } else {
        showToast('Sale completed (print may have failed)', 'warning');
      }
      await handleCompleteSale();
    } else if (printerMode === 'wired') {
      // Wired printing logic
      try {
        const wiredPrinterName = localStorage.getItem('wiredPrinterName') || '';
        const res = await fetch('/api/print/wired', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: receipt, printerName: wiredPrinterName })
        });
        
        const data = await res.json();
        
        if (!data || data.success === false) {
          showToast('Print failed: ' + (data?.error || 'Unknown error'), 'error');
          return;
        }
        
        if (data.webSerial && data.formattedText) {
          // Linux/Mac: Use Web Serial API
          showToast('Web Serial printing not yet implemented', 'warning');
          await handleCompleteSale();
        } else if (data.printed) {
          // Windows: Successfully printed
          showToast('Receipt printed successfully!', 'success');
          await handleCompleteSale();
        } else {
          showToast('Print failed: ' + (data.error || 'No print path available'), 'error');
        }
      } catch (err: any) {
        showToast('Wired printing error: ' + err.message, 'error');
      }
    } else if (printerMode === 'test') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast('✅ Test Mode: Print simulated!', 'success');
      await handleCompleteSale();
    }
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      showToast('Cart is empty!', 'warning');
      return;
    }

    const hasPaymentMethod = Object.values(paymentMethods).some(pm => pm.checked);
    if (!hasPaymentMethod) {
      showToast('Please select at least one payment method!', 'error');
      return;
    }

    if (remaining > 0) {
      showToast(`Payment incomplete! Remaining: ₦${remaining.toLocaleString()}`, 'error');
      return;
    }

    const seller = localStorage.getItem('userEmail') || 'Unknown';

    const salesData = cart.map(item => ({
      Column0: item.name,
      Column1: item.price,
      Column2: item.quantity,
      Column3: item.total,
      saletype: item.type === 'carton' ? 'Cartons' : 'Kilos',
      customer: customerName || 'Walk-in'
    }));

    const paymentDetails = Object.entries(paymentMethods)
      .filter(([_, pm]) => pm.checked && Number(pm.amount) > 0)
      .map(([method, pm]) => ({ method, amount: Number(pm.amount) }));

    const res = await fetch('/api/sales/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        data: salesData, 
        paymentDetails, 
        seller,
        discount: parseFloat(discount) || 0,
        customerName 
      })
    });

    if (res.ok) {
      const result = await res.json();
      showToast('Sale completed successfully!', 'success');
      
      // Store sale info for receipt
      if (result.data) {
        localStorage.setItem('lastSaleTime', result.data.datentime || new Date().toLocaleString());
      }
      
      clearAll();
      setDiscount('');
      setCustomerName('');
      fetchProducts();
      fetchStock();
    } else {
      const error = await res.json();
      showToast(error.message || 'Sale failed! Please try again.', 'error');
    }
  };

  const stockOptions = stock.map(s => ({
    value: s._id,
    label: `${s.stockname} | ₦${s.stockprice} | ${s.stockquantity} Cartons`
  }));

  const productOptions = products.map(p => ({
    value: p._id,
    label: `${p.productname} | ₦${p.productprice}/kg`
  }));

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Sell Mixed (Cartons + Kilos)</h1>
            <p className="text-sm text-gray-600 mt-1">Printer Mode: <span className="font-semibold capitalize">{printerMode}</span></p>
          </div>
          {printerMode === 'wireless' && (
            <button 
              onClick={handleBluetoothToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm md:text-base ${bluetoothConnected ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'}`}
            >
              <Bluetooth className="h-5 w-5" />
              <span className="hidden sm:inline">{bluetoothConnected ? `Connected: ${bluetoothPrinter?.getDeviceName() || 'Device'}` : 'Connect Bluetooth'}</span>
              <span className="sm:hidden">{bluetoothConnected ? 'Connected' : 'Connect'}</span>
            </button>
          )}
          {printerMode === 'wired' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm md:text-base">
              <Printer className="h-5 w-5" />
              <span>Wired: {localStorage.getItem('wiredPrinterName') || 'Not configured'}</span>
            </div>
          )}
          {printerMode === 'test' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold text-sm md:text-base">
              <TestTube2 className="h-5 w-5" />
              <span>Test Mode Active</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-800">Cart</h2>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <div className="text-sm">
                    <span className="text-gray-600">Subtotal: </span>
                    <span className="font-bold text-blue-600">₦{subtotal.toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={clearAll} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all w-full sm:w-auto">Clear All</button>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Subtotal</p>
                    <p className="text-lg font-bold text-gray-900">₦{subtotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total</p>
                    <p className="text-lg font-bold text-blue-600">₦{total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Payment</p>
                    <p className="text-lg font-bold text-green-600">₦{paymentTotal.toLocaleString()}</p>
                  </div>
                </div>
                {remaining > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-red-600">Remaining:</span>
                      <span className="text-xl font-bold text-red-600">₦{remaining.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${item.type === 'carton' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {item.type === 'carton' ? 'Carton' : 'Kilo (KG)'}
                        </span>
                      </td>
                      <td className="px-4 py-3">₦{item.price.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              const newQty = Math.max(0.5, Number((item.quantity - 0.5).toFixed(1)));
                              const updated = [...cart];
                              updated[idx] = { ...item, quantity: newQty, total: Number((item.price * newQty).toFixed(2)) };
                              setCart(updated);
                            }}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 min-w-[60px] text-center">{item.quantity} {item.type === 'carton' ? 'Cartons' : 'KG'}</span>
                          <button 
                            onClick={() => {
                              const newQty = Number((item.quantity + 0.5).toFixed(1));
                              const updated = [...cart];
                              updated[idx] = { ...item, quantity: newQty, total: Number((item.price * newQty).toFixed(2)) };
                              setCart(updated);
                            }}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">₦{item.total.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Item</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name (Optional)</label>
                <SearchableSelect
                  options={[
                    { value: '', label: 'Walk-in Customer' },
                    ...customers.map(c => ({ value: c, label: c }))
                  ]}
                  value={customerName}
                  onChange={setCustomerName}
                  placeholder="Search or type new customer name"
                  allowCustom={true}
                />
              </div>

              <div className="flex gap-2 mb-4">
                <button onClick={() => setSaleType('carton')} className={`flex-1 px-4 py-2 rounded-lg ${saleType === 'carton' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Carton</button>
                <button onClick={() => setSaleType('piece')} className={`flex-1 px-4 py-2 rounded-lg ${saleType === 'piece' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Kilo (KG)</button>
              </div>
              <SearchableSelect
                options={saleType === 'carton' ? stockOptions : productOptions}
                value={selectedItem}
                onChange={setSelectedItem}
                placeholder={`Select ${saleType === 'carton' ? 'Stock' : 'Product'}`}
              />
              {saleType === 'piece' ? (
                <div className="flex items-center gap-2 mb-4">
                  <button 
                    onClick={() => setQuantity(String(Math.max(0.5, Number(quantity || 0) - 0.5)))}
                    className="px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold text-xl"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)}
                    min="0"
                    step="0.5"
                    placeholder="Quantity (KG)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button 
                    onClick={() => setQuantity(String(Number(quantity || 0) + 0.5))}
                    className="px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-4">
                  <button 
                    onClick={() => setQuantity(String(Math.max(0.5, Number(quantity || 0) - 0.5)))}
                    className="px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold text-xl"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)}
                    min="0" 
                    step="0.5" 
                    placeholder="Quantity (Cartons)" 
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                  <button 
                    onClick={() => setQuantity(String(Number(quantity || 0) + 0.5))}
                    className="px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              )}
              <button onClick={addToCart} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">Add to Cart</button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Methods</h2>
              
              <div className="mb-4 pb-4 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount</label>
                <input 
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Enter discount amount"
                />
              </div>
              
              {Object.entries(paymentMethods).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <label className="flex items-center mb-2">
                    <input type="checkbox" checked={value.checked} onChange={(e) => handlePaymentCheck(key as keyof typeof paymentMethods, e.target.checked)} className="mr-2 w-5 h-5" />
                    <span className="font-semibold capitalize">{key}</span>
                  </label>
                  {value.checked && (
                    <input type="number" value={value.amount} onChange={(e) => handlePaymentAmount(key as keyof typeof paymentMethods, e.target.value)} placeholder={`${key} amount`} className="w-full px-4 py-2 border border-gray-300 rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <button 
                onClick={handlePrint} 
                disabled={(printerMode === 'wireless' && !bluetoothConnected) || cart.length === 0 || remaining !== 0} 
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {printerMode === 'test' ? 'Simulate Print & Complete Sale' : 'Print Receipt & Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
