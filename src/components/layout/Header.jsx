import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Database, Wifi } from 'lucide-react';

export default function Header({ onOpenAuth, onOpenNeonConfig }) {
  const { user, neonSettings } = useAuth();
  const isNeonConnected = neonSettings?.enabled && Boolean(neonSettings?.url);

  return (
    <header className="sticky top-0 z-40 bg-[#111827] border-b border-[#1f2937] px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 font-['Outfit'] text-base shadow-sm">
          U
        </div>
        <div>
          <h1 className="text-base font-bold font-['Outfit'] tracking-tight text-white flex items-center gap-1.5">
            UNItrack
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Neon Database Status Badge */}
        <button
          onClick={onOpenNeonConfig}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            isNeonConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Configure Neon Serverless Postgres"
        >
          {isNeonConnected ? <Wifi className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline font-mono text-[11px]">{isNeonConnected ? 'Neon Sync' : 'Local Storage'}</span>
        </button>

        {/* User Profile Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-all text-xs text-slate-200 font-medium"
        >
          <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-[11px] font-bold text-slate-950">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className="max-w-[100px] truncate">{user?.name || 'Admin'}</span>
        </button>
      </div>
    </header>
  );
}
