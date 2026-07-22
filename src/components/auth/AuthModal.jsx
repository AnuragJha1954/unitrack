import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, LogIn, UserPlus, ShieldCheck, Settings, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { user, login, logout, setActiveTab } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!username || !password) return;
      await login(username, password);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#0e0e11] border border-white/[0.08] w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors p-1 rounded-xl hover:bg-white/[0.04]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white font-['Outfit'] tracking-tight">
              Account Status
            </h3>
            <p className="text-xs text-zinc-400">
              {user ? 'Active SaaS Session' : 'Workspace Authentication'}
            </p>
          </div>
        </div>

        {user ? (
          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-xs text-zinc-300 leading-relaxed font-sans">
              All profile credentials, serverless Postgres configuration, and cloud storage quotas are managed directly inside <span className="text-emerald-400 font-bold">Workspace Settings</span>.
            </div>

            <button
              onClick={() => { setActiveTab('settings'); onClose(); }}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-xs shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all interactive-element flex items-center justify-center space-x-2 uppercase tracking-wider font-mono"
            >
              <Settings className="w-4 h-4 stroke-[2.5]" />
              <span>Open Workspace Settings</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full py-3.5 bg-rose-500/15 border border-rose-500/40 text-rose-300 font-bold rounded-2xl text-xs hover:bg-rose-500/25 transition-all interactive-element uppercase font-mono tracking-wider"
            >
              Log Out of Workspace
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-medium">{error}</div>}

            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1 uppercase font-mono tracking-wider">Username</label>
              <input
                type="text"
                required
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1 uppercase font-mono tracking-wider">Password</label>
              <input
                type="password"
                required
                placeholder="admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl shadow-md active:scale-95 transition-all text-sm mt-3 flex items-center justify-center gap-2 uppercase font-mono tracking-wider"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In →'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
