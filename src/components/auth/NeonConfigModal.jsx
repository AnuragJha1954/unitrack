import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';
import { imgbbService } from '../../services/imgbbService';
import { X, Database, CheckCircle2, AlertCircle, RefreshCw, Server, CloudUpload, Trash2, HardDrive, ShieldCheck } from 'lucide-react';

export default function NeonConfigModal({ isOpen, onClose }) {
  const { user, neonSettings, updateNeonConfig, refreshAll } = useAuth();
  const [url, setUrl] = useState(neonSettings?.url || '');
  const [enabled, setEnabled] = useState(neonSettings?.enabled || false);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  // ImgBB External Storage Config
  const [imgbbConfig, setImgbbConfig] = useState(() => imgbbService.getConfig());
  const [imgbbEnabled, setImgbbEnabled] = useState(imgbbConfig.enabled);
  const [imgbbKey, setImgbbKey] = useState(imgbbConfig.apiKey);

  // Storage Gauge
  const [storageUsage, setStorageUsage] = useState(null);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStorageStats();
      const cfg = imgbbService.getConfig();
      setImgbbEnabled(cfg.enabled);
      setImgbbKey(cfg.apiKey);
    }
  }, [isOpen]);

  const loadStorageStats = async () => {
    const usage = await dbService.calculateStorageUsage();
    setStorageUsage(usage);
  };

  if (!isOpen) return null;

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    setStatus({ state: 'testing', message: 'Testing connection & saving storage settings...' });

    // Save ImgBB Config
    imgbbService.saveConfig({ enabled: imgbbEnabled, apiKey: imgbbKey.trim() });

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
          setStatus({ state: 'success', message: 'Connected to Neon & Storage settings updated!' });
          await updateNeonConfig(url, true);
        } else {
          setStatus({ state: 'error', message: data.error || 'Failed to verify database URL.' });
          return;
        }
      } else {
        await updateNeonConfig(url, enabled);
        setStatus({ state: 'success', message: 'Settings saved locally.' });
      }
      await refreshAll();
      setTimeout(() => onClose(), 1400);
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'Network error reaching /api/db' });
    }
  };

  const handleCleanup = async () => {
    if (!user) return;
    if (!window.confirm('Clean up completed tasks older than 30 days to reclaim storage?')) return;
    setCleaning(true);
    const res = await dbService.compactAndCleanupStorage(user.id);
    await loadStorageStats();
    await refreshAll();
    setCleaning(false);
    setStatus({ state: 'success', message: `Cleaned up ${res.removedTasks} old items!` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl glass-card bg-[#121214] border border-[#27272a] rounded-3xl p-6 shadow-2xl relative animate-scale-in max-h-[90vh] overflow-y-auto">
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
            <h3 className="font-bold font-['Outfit'] text-lg text-zinc-100">Database & Storage Engine</h3>
            <p className="text-xs text-zinc-400">Optimize your 512 MB Neon quota & manage external sync.</p>
          </div>
        </div>

        {/* Live DB Space Meter (512 MB limit) */}
        {storageUsage && (
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 mb-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-zinc-200">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>Neon Postgres Quota Usage</span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {storageUsage.totalMB} MB / 512.00 MB ({storageUsage.percentage}%)
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-[#27272a] overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-700 rounded-full"
                style={{ width: `${Math.max(1, Math.min(100, parseFloat(storageUsage.percentage)))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-[#27272a]">
              <span>
                {storageUsage.breakdown.diet_plans?.count || 0} photos | {storageUsage.breakdown.transactions?.count || 0} txs | {storageUsage.breakdown.tasks?.count || 0} tasks
              </span>
              <button
                type="button"
                onClick={handleCleanup}
                disabled={cleaning}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{cleaning ? 'Compacting...' : 'Compact & Cleanup'}</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleTestAndSave} className="space-y-4">
          {/* Neon Postgres Sync Section */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                Enable Neon Cloud Sync
              </span>
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
                  className="w-full bg-[#121214] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
            <p className="text-[11px] text-zinc-400">
              Syncs all modules across devices. Images automatically compress to ultra-tiny WebP (`~12KB`) to maximize your 512 MB quota.
            </p>
          </div>

          {/* 100% Free External Image Hosting Option (ImgBB Free API) */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <CloudUpload className="w-4 h-4 text-emerald-400" />
                  100% Free External Image Storage (`0 KB` in Postgres)
                </span>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Save 0 bytes inside your DB by hosting photos via ImgBB Free API (no credit card needed).
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={imgbbEnabled}
                  onChange={(e) => setImgbbEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#27272a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {imgbbEnabled && (
              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">
                  ImgBB Free API Key (From <a href="https://api.imgbb.com/" target="_blank" rel="noreferrer" className="text-emerald-400 underline">api.imgbb.com</a>)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
                  value={imgbbKey}
                  onChange={(e) => setImgbbKey(e.target.value)}
                  className="w-full bg-[#121214] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

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
              {enabled ? 'Test & Save Config' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
