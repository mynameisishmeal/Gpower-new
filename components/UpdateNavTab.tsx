'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpCircle, RefreshCw, CheckCircle2, Download, X, Sparkles, AlertCircle } from 'lucide-react';

interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  percent?: number;
  message?: string;
}

export default function UpdateNavTab() {
  const [isElectron, setIsElectron] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [updateInfo, setUpdateInfo] = useState<UpdateStatus | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [checkingManual, setCheckingManual] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>('');
  const [manualMessage, setManualMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
      setIsElectron(true);
      const api = window.electronAPI;

      api.getVersion().then((v: string) => {
        if (v) setCurrentVersion(v);
      });

      const cleanup = api.onUpdateStatus((data: UpdateStatus) => {
        setUpdateInfo(data);
        setLastCheckedTime(new Date().toLocaleTimeString());
        if (data.status === 'not-available') {
          setManualMessage('You are running the latest version.');
        } else if (data.status === 'error') {
          setManualMessage(data.message || 'Unable to reach update server.');
        }
      });

      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }
  }, []);

  if (!isElectron) {
    return null;
  }

  const handleManualCheck = async () => {
    if (!window.electronAPI) return;
    setCheckingManual(true);
    setManualMessage(null);
    try {
      const res = await window.electronAPI.checkForUpdates();
      setLastCheckedTime(new Date().toLocaleTimeString());
      if (!res?.success && res?.error) {
        if (res.error.includes('406') || res.error.includes('No published versions') || res.error.includes('Cannot parse releases feed')) {
          setManualMessage('No new releases published on GitHub yet. You are up to date.');
        } else {
          setManualMessage(res.error);
        }
      }
    } catch (err: any) {
      setManualMessage(err?.message || 'Failed to check for updates.');
    } finally {
      setTimeout(() => setCheckingManual(false), 1000);
    }
  };

  const handleInstallNow = () => {
    window.electronAPI?.installUpdate();
  };

  const isDownloaded = updateInfo?.status === 'downloaded';
  const isAvailable = updateInfo?.status === 'available' || updateInfo?.status === 'downloading';

  return (
    <>
      {/* Nav Item Button with Dynamic Badge */}
      <button
        onClick={() => setModalOpen(true)}
        className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
          isDownloaded
            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 shadow-sm'
            : isAvailable
            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        title="Check for updates"
      >
        {isDownloaded ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 animate-bounce" />
        ) : isAvailable ? (
          <ArrowUpCircle className="h-4 w-4 text-amber-600 animate-pulse" />
        ) : (
          <Sparkles className="h-4 w-4 text-indigo-600" />
        )}

        <span>Updates</span>

        {/* Dynamic Status Badge */}
        {isDownloaded && (
          <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
            Restart
          </span>
        )}

        {isAvailable && !isDownloaded && (
          <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow">
            {updateInfo?.status === 'downloading' && typeof updateInfo?.percent === 'number'
              ? `${updateInfo.percent}%`
              : 'New'}
          </span>
        )}
      </button>

      {/* Interactive Updates Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden font-sans">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/30">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <ArrowUpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">Software Updates</h3>
                  <p className="text-xs text-gray-500">Gpower CRM Desktop</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Version Info Card */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                <div>
                  <div className="text-xs font-medium text-gray-500">Current Installed Version</div>
                  <div className="text-base font-bold text-gray-900 font-mono mt-0.5">
                    v{currentVersion || '0.1.0'}
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                  Desktop Edition
                </span>
              </div>

              {/* Status Section */}
              {isDownloaded ? (
                /* Ready to Install (GREEN STATE) */
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2.5 text-emerald-800">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm">Update Ready to Install!</h4>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Version {updateInfo?.version || 'new update'} has finished downloading.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleInstallNow}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Restart & Apply Update</span>
                  </button>
                </div>
              ) : isAvailable ? (
                /* Update Available / Downloading State */
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-800">
                    <Download className="h-5 w-5 text-amber-600 flex-shrink-0 animate-bounce" />
                    <div>
                      <h4 className="font-semibold text-sm">New Update Detected</h4>
                      <p className="text-xs text-amber-700 mt-0.5">
                        {updateInfo?.version ? `Version ${updateInfo.version}` : 'Latest release'} is downloading automatically in the background.
                      </p>
                    </div>
                  </div>

                  {typeof updateInfo?.percent === 'number' && (
                    <div className="space-y-1.5">
                      <div className="w-full bg-amber-200/80 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${updateInfo.percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-medium text-amber-800">
                        <span>Downloading update...</span>
                        <span>{updateInfo.percent}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Up to Date or Idle State */
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold">
                      {manualMessage || 'Your system is checking for remote updates automatically.'}
                    </span>
                  </div>
                  {lastCheckedTime && (
                    <div className="text-[11px] text-gray-500">
                      Last checked: {lastCheckedTime}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={checkingManual || isDownloaded || updateInfo?.status === 'downloading'}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${checkingManual ? 'animate-spin' : ''}`} />
                  <span>{checkingManual ? 'Checking GitHub...' : 'Check for Updates'}</span>
                </button>

                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
