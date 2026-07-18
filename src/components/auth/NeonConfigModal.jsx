import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Database, CheckCircle2, AlertCircle, RefreshCw, Server } from 'lucide-react';

export default function NeonConfigModal({ isOpen, onClose }) {
  const { neonSettings, updateNeonConfig } = useAuth();
  const [url, setUrl] = useState(neonSettings?.url || '');
  const [enabled, setEnabled] = useState(neonSettings?.enabled || false);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  if (!isOpen) return null;

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    setStatus({ state: 'testing', message: 'Testing connection to Neon Postgres...' });

    try {
      if (enabled && url.trim()) {
        const response = await fetch('/api/db', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Neon-Connection': url.trim()
          },
          body: JSON.stringify({
            action: 'setup',
            connectionString: url.trim()
          })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setStatus({ state: 'success', message: 'Connected & database tables verified!' });
          await updateNeonConfig(url, true);
        } else {
          setStatus({ state: 'error', message: data.error || 'Failed to verify database URL.' });
          return;
        }
      } else {
        await updateNeonConfig(url, enabled);
        setStatus({ state: 'success', message: 'Settings saved.' });
      }
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'Network error reaching /api/db' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-card bg-[#0b0f19]/95 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold font-['Outfit'] text-lg text-white">Neon Serverless Postgres</h3>
            <p className="text-xs text-slate-400">Sync data via Vercel Serverless Functions (`@neondatabase/serverless`).</p>
          </div>
        </div>

        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Enable Neon Cloud Sync</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <p className="text-[11px] text-slate-400">
              When disabled or offline, UNItrack runs automatically via instant local `IndexedDB` storage with zero data loss.
            </p>
          </div>

          {enabled && (
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Neon Connection String (`DATABASE_URL`)
              </label>
              <input
                type="text"
                placeholder="postgres://user:pass@ep-xxxx.neon.tech/dbname?sslmode=require"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Found in your Neon Dashboard under Connection Details (use pooled or direct string).
              </p>
            </div>
          )}

          {status.state !== 'idle' && (
            <div
              className={`p-3 rounded-xl flex items-center space-x-2 text-xs font-medium border ${
                status.state === 'testing'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : status.state === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {status.state === 'testing' && <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
              {status.state === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
              {status.state === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
              <span>{status.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              {enabled ? 'Test Connection & Save' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
