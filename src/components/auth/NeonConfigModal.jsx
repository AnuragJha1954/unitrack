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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-card bg-[#121214] border border-[#27272a] rounded-3xl p-6 shadow-2xl relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-400 hover:text-zinc-100 interactive-element"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold font-['Outfit'] text-lg text-zinc-100">Neon Serverless Postgres</h3>
            <p className="text-xs text-zinc-400">Sync all your personal modules across devices 100% free.</p>
          </div>
        </div>

        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-100">Enable Neon Cloud Sync</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <p className="text-[11px] text-zinc-400">
              When disabled or offline, UNItrack runs automatically via instant local `IndexedDB` storage with zero data loss.
            </p>
          </div>

          {enabled && (
            <div>
              <label className="text-xs text-zinc-300 font-medium block mb-1">
                Neon Connection String (`DATABASE_URL`)
              </label>
              <input
                type="text"
                placeholder="postgres://user:pass@ep-xxxx.neon.tech/dbname?sslmode=require"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Found in your Neon Dashboard under Connection Details (use pooled or direct string).
              </p>
            </div>
          )}

          {status.state !== 'idle' && (
            <div
              className={`p-3 rounded-xl flex items-center space-x-2 text-xs font-medium border ${
                status.state === 'testing'
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  : status.state === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/15 border-red-500/30 text-red-300'
              }`}
            >
              {status.state === 'testing' && <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-emerald-400" />}
              {status.state === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
              {status.state === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
              <span>{status.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-100 interactive-element"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold rounded-xl text-xs shadow-sm interactive-element"
            >
              {enabled ? 'Test Connection & Save' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
