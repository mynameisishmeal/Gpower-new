'use client';

import React, { useEffect, useState } from 'react';
import { Bluetooth, Printer, X, RefreshCw, CheckCircle2 } from 'lucide-react';

interface DiscoveredDevice {
  deviceId: string;
  deviceName?: string;
}

export default function BluetoothChooserModal() {
  const [isElectron, setIsElectron] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
      setIsElectron(true);
      const api = window.electronAPI;

      if (api.onBluetoothDevicesFound) {
        const cleanup = api.onBluetoothDevicesFound((deviceList: DiscoveredDevice[]) => {
          console.log('[BluetoothPicker] Discovered devices updated:', deviceList);
          setDevices(prev => {
            // Merge newly discovered devices avoiding duplicates
            const map = new Map<string, DiscoveredDevice>();
            prev.forEach(d => map.set(d.deviceId, d));
            (deviceList || []).forEach(d => map.set(d.deviceId, d));
            return Array.from(map.values());
          });
          setIsOpen(true);
        });

        return () => {
          if (typeof cleanup === 'function') cleanup();
        };
      }
    }
  }, []);

  if (!isElectron || !isOpen) {
    return null;
  }

  const handleSelectDevice = (deviceId: string) => {
    setConnectingId(deviceId);
    if (window.electronAPI?.selectBluetoothDevice) {
      window.electronAPI.selectBluetoothDevice(deviceId);
    }
    setTimeout(() => {
      setIsOpen(false);
      setConnectingId(null);
      setDevices([]);
    }, 400);
  };

  const handleCancel = () => {
    if (window.electronAPI?.cancelBluetoothDevice) {
      window.electronAPI.cancelBluetoothDevice();
    }
    setIsOpen(false);
    setConnectingId(null);
    setDevices([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden font-sans animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Bluetooth className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">Select Bluetooth Printer</h3>
              <p className="text-xs text-gray-500">Pairing with ESC/POS Receipt Printer</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Scanning status banner */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-blue-900 text-xs font-medium">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin flex-shrink-0" />
            <span>Scanning for nearby Bluetooth devices... Make sure your printer is turned on.</span>
          </div>

          {/* Device list */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {devices.length === 0 ? (
              <div className="py-8 text-center text-gray-500 space-y-2">
                <Printer className="h-8 w-8 mx-auto text-gray-300 animate-bounce" />
                <p className="text-xs font-medium">No Bluetooth devices discovered yet</p>
                <p className="text-[11px] text-gray-400">Searching within range (10 meters)...</p>
              </div>
            ) : (
              devices.map((device, idx) => {
                const isConnecting = connectingId === device.deviceId;
                const displayName = device.deviceName || `Bluetooth Device ${idx + 1}`;
                const isLikelyPrinter = /print|pos|xp|mpt|thermal|rpp|receipt/i.test(displayName);

                return (
                  <div
                    key={device.deviceId || idx}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isLikelyPrinter
                        ? 'border-blue-300 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-400 shadow-sm'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isLikelyPrinter ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Printer className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-xs text-gray-900 truncate flex items-center gap-1.5">
                          <span>{displayName}</span>
                          {isLikelyPrinter && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                              Printer
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono truncate">
                          {device.deviceId}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectDevice(device.deviceId)}
                      disabled={isConnecting}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                        isConnecting
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                      }`}
                    >
                      {isConnecting ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <span>Connect</span>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">PIN: 0000 or 1234 (handled automatically)</span>
            <button
              onClick={handleCancel}
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
