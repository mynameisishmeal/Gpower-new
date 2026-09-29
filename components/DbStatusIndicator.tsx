'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Database, CheckCircle2, AlertTriangle, RefreshCw, X, ChevronUp, ChevronDown } from 'lucide-react';

interface DbStatus {
  success: boolean;
  connected: boolean;
  host?: string;
  database?: string;
  userCount?: number;
  collectionsCount?: number;
  latencyMs?: number;
  error?: string;
}

export default function DbStatusIndicator() {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkConnection = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health/db', { cache: 'no-store' });
      const text = await res.text();
      let data: DbStatus;
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          success: false,
          connected: false,
          error: `Server responded with HTTP ${res.status}: ${text.slice(0, 150) || 'Empty response'}`
        };
      }

      setStatus(data);
      setLastChecked(new Date().toLocaleTimeString());
      if (!data.connected) {
        setExpanded(true); // Auto-expand when there is an issue so user sees it
      }
    } catch (err: any) {
      setStatus({
        success: false,
        connected: false,
        error: err?.message || 'Failed to communicate with local API server'
      });
      setLastChecked(new Date().toLocaleTimeString());
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    // Poll every 30 seconds
    const timer = setInterval(checkConnection, 30000);
    return () => clearInterval(timer);
  }, [checkConnection]);

  if (!status && loading) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-full text-xs shadow-lg border border-slate-700/50">
        <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
        <span>Testing Database Connection...</span>
      </div>
    );
  }

  const isConnected = status?.connected === true;

  return (
    <div className="fixed bottom-4 left-4 z-50 font-sans">
      {/* Expanded Details Card */}
      {expanded && (
        <div className="mb-2 w-80 bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-700 overflow-hidden animate-fadeIn backdrop-blur-md">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Database className={`h-4 w-4 ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`} />
              <span className="font-semibold text-sm">Database Diagnostics</span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-800">
              <span className="text-slate-400">Connection Status:</span>
              <span className={`font-semibold flex items-center gap-1 ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isConnected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {isConnected ? (
              <>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Database Name:</span>
                  <span className="font-mono text-slate-200">{status?.database || 'mfvpos'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Response Latency:</span>
                  <span className="text-emerald-400 font-mono">{status?.latencyMs || 0} ms</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Registered Users:</span>
                  <span className="text-slate-200 font-mono">{status?.userCount ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Collections:</span>
                  <span className="text-slate-200 font-mono">{status?.collectionsCount ?? 0}</span>
                </div>
              </>
            ) : (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-200 text-[11px] leading-relaxed break-words">
                <p className="font-semibold text-rose-300 mb-1">Connection Error:</p>
                {status?.error || 'Unable to connect to MongoDB'}
              </div>
            )}

            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
              <span>Last checked: {lastChecked || 'just now'}</span>
              <button
                onClick={checkConnection}
                disabled={loading}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium cursor-pointer transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Re-test</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Pill Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-md border transition-all cursor-pointer ${
          isConnected
            ? 'bg-slate-900/90 text-emerald-300 border-emerald-500/30 hover:bg-slate-800'
            : 'bg-rose-950/90 text-rose-200 border-rose-500/50 hover:bg-rose-900 animate-pulse'
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
        <Database className="h-3.5 w-3.5" />
        <span>{isConnected ? `MongoDB Connected (${status?.latencyMs || 0}ms)` : 'Database Error'}</span>
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
      </button>
    </div>
  );
}
