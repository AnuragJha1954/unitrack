import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Database, Wifi } from 'lucide-react';

export default function Header({ onOpenAuth, onOpenNeonConfig }) {
  const { user, neonSettings } = useAuth();
  const isNeonConnected = neonSettings?.enabled && Boolean(neonSettings?.url);

  return (
    <header className="sticky top-0 z-40 bg-[#121214]/95 backdrop-blur-md border-b border-[#27272a] px-4 py-3 flex items-center justify-between shadow-sm transition-all">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-zinc-950 font-['Outfit'] text-base shadow-sm interactive-element">
          U
        </div>
        <div>
          <h1 className="text-base font-bold font-['Outfit'] tracking-tight text-zinc-100 flex items-center gap-1.5">
            UNItrack
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Neon Database Sync Badge */}
        <button
          onClick={onOpenNeonConfig}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border interactive-element ${
            isNeonConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:text-zinc-100'
          }`}
          title="Configure Neon Serverless Postgres"
        >
          {isNeonConnected ? <Wifi className="w-3.5 h-3.5 animate-pulse" /> : <Database className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline font-mono text-[11px]">{isNeonConnected ? 'Neon Sync' : 'Local Storage'}</span>
        </button>

        {/* User Profile Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center space-x-2 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] px-3 py-1.5 rounded-lg interactive-element text-xs text-zinc-200 font-medium"
        >
          <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-[11px] font-bold text-zinc-950">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className="max-w-[100px] truncate">{user?.name || 'Admin'}</span>
        </button>
      </div>
    </header>
  );
}
