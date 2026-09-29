'use client';

import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, CheckCircle2, X } from 'lucide-react';

interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  percent?: number;
  message?: string;
}

export default function UpdateChecker() {
  const [isElectron, setIsElectron] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [updateInfo, setUpdateInfo] = useState<UpdateStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
      setIsElectron(true);
      const api = window.electronAPI;

      // Get app version
      api.getVersion().then((v: string) => setCurrentVersion(v));

      // Listen for remote update events
      const cleanup = api.onUpdateStatus((data: UpdateStatus) => {
        setUpdateInfo(data);
        if (data.status === 'available' || data.status === 'downloaded') {
          setDismissed(false);
        }
      });

      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }
  }, []);

  if (!isElectron || dismissed || !updateInfo) {
    return null;
  }

  const handleInstall = () => {
    window.electronAPI?.installUpdate();
  };

  // Only show floating card when an update is actively available, downloading, or downloaded
  if (updateInfo.status === 'not-available' || updateInfo.status === 'checking' || updateInfo.status === 'error') {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-slate-700/60 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {updateInfo.status === 'downloading' && (
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
          )}
          {updateInfo.status === 'downloaded' && (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          )}
          {updateInfo.status === 'available' && (
            <Download className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          )}
          
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              {updateInfo.status === 'downloaded' ? 'Update Ready to Install' : 'Software Update'}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {updateInfo.message || `Version ${updateInfo.version || ''}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar for Downloads */}
      {updateInfo.status === 'downloading' && typeof updateInfo.percent === 'number' && (
        <div className="mt-3">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${updateInfo.percent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>Downloading...</span>
            <span>{updateInfo.percent}%</span>
          </div>
        </div>
      )}

      {/* Action button when downloaded */}
      {updateInfo.status === 'downloaded' && (
        <div className="mt-3 pt-2 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={() => setDismissed(true)}
            className="text-xs px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="text-xs px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restart & Apply
          </button>
        </div>
      )}
    </div>
  );
}
