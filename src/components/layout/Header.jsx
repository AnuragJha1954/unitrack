import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Database, User, Sparkles, Wifi, WifiOff } from 'lucide-react';

export default function Header({ onOpenAuth, onOpenNeonConfig }) {
  const { user, neonSettings } = useAuth();
  const isNeonConnected = neonSettings?.enabled && Boolean(neonSettings?.url);

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-white/10 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 p-[1px] flex items-center justify-center shadow-lg neon-glow-cyan">
          <div className="w-full h-full bg-[#0b0f19] rounded-xl flex items-center justify-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-extrabold text-xl font-['Outfit']">U</span>
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold font-['Outfit'] tracking-tight text-white flex items-center gap-1.5">
            UNI<span className="text-cyan-400 font-extrabold">track</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">PWA</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Neon Database Status Badge */}
        <button
          onClick={onOpenNeonConfig}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
            isNeonConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 neon-glow-emerald'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Configure Neon Serverless Postgres"
        >
          {isNeonConnected ? <Wifi className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline font-mono">{isNeonConnected ? 'Neon Cloud' : 'Offline / Local'}</span>
        </button>

        {/* User Profile Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 px-3 py-1.5 rounded-full transition-all text-xs text-slate-200 font-medium"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
          </div>
          <span className="max-w-[100px] truncate">{user?.name || 'Guest'}</span>
        </button>
      </div>
    </header>
  );
}
