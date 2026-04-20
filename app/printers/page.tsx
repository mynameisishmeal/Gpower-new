'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Printer, Copy } from 'lucide-react';

interface PrinterData {
  _id: string;
  email: string;
  serviceUUID: string;
  characteristicUUID: string;
  isOwned: boolean;
}

export default function PrintersPage() {
  const [printers, setPrinters] = useState<PrinterData[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || '';
    setUserEmail(email);
    fetchPrinters(email);
  }, []);

  const fetchPrinters = async (email: string) => {
    setLoading(true);
    const res = await fetch(`/api/printers/list?email=${email}`);
    const data = await res.json();
    if (data.success) {
      setPrinters(data.printers);
    }
    setLoading(false);
  };

  const clonePrinter = async (printerId: string) => {
    if (!userEmail) {
      alert('User email not found. Please login again.');
      return;
    }

    const res = await fetch('/api/printers/clone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ printerId, userEmail })
    });

    const data = await res.json();
    if (data.success) {
      alert('Printer cloned successfully!');
      fetchPrinters(userEmail);
    } else {
      alert('Failed to clone printer: ' + data.error);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="card-shadow bg-white rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Printer className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Available Printers</h1>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Loading printers...</div>
              </div>
            ) : printers.length === 0 ? (
              <div className="text-center py-12">
                <Printer className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No printers found in database</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {printers.map((printer) => (
                  <div
                    key={printer._id}
                    className={`card-shadow rounded-lg p-6 ${
                      printer.isOwned ? 'bg-green-50 border-2 border-green-500' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Printer className={`h-8 w-8 ${printer.isOwned ? 'text-green-600' : 'text-gray-600'}`} />
                      {printer.isOwned && (
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          Your Printer
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Owner</label>
                        <p className="text-sm font-medium text-gray-900">{printer.email}</p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Service UUID</label>
                        <p className="text-xs font-mono text-gray-700 break-all bg-gray-100 p-2 rounded">
                          {printer.serviceUUID || '(empty - needs configuration)'}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Characteristic UUID</label>
                        <p className="text-xs font-mono text-gray-700 break-all bg-gray-100 p-2 rounded">
                          {printer.characteristicUUID || '(empty - needs configuration)'}
                        </p>
                      </div>

                      {!printer.isOwned && printer.serviceUUID && printer.characteristicUUID && (
                        <button
                          onClick={() => clonePrinter(printer._id)}
                          className="w-full mt-4 btn-modern bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Clone This Printer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
