import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';
import { Database, Wifi, Search, X, Command, ChevronDown, Server, HardDrive } from 'lucide-react';

export default function Header({ onOpenAuth, onOpenNeonConfig }) {
  const { user, neonSettings, setActiveTab } = useAuth();
  const isNeonConnected = neonSettings?.enabled && Boolean(neonSettings?.url);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [storageSummary, setStorageSummary] = useState(null);

  useEffect(() => {
    dbService.calculateStorageUsage().then(usage => setStorageSummary(usage));
  }, [neonSettings]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase().trim();
    if (q.includes('task') || q.includes('todo') || q.includes('project')) {
      setActiveTab('tasks');
    } else if (q.includes('finance') || q.includes('money') || q.includes('expense') || q.includes('inr') || q.includes('rupee') || q.includes('₹')) {
      setActiveTab('finance');
    } else if (q.includes('gym') || q.includes('workout') || q.includes('lift')) {
      setActiveTab('gym');
    } else if (q.includes('diet') || q.includes('food') || q.includes('meal') || q.includes('photo')) {
      setActiveTab('diet');
    } else {
      setActiveTab('home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-2xl border-b border-white/[0.04] px-4 py-3 flex items-center justify-between transition-all gap-4">
      {/* Brand & Workspace Dropdown */}
      <div className="flex items-center space-x-3 shrink-0">
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-2.5 cursor-pointer group interactive-element"
        >
          <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] group-hover:border-emerald-500/40 flex items-center justify-center overflow-hidden transition-all shadow-sm">
            <img 
              src="/unitrack-logo.png" 
              alt="UNItrack Logo" 
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden w-full h-full items-center justify-center bg-emerald-500 font-bold text-zinc-950 font-['Outfit'] text-sm">
              U
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-extrabold font-['Outfit'] tracking-tight text-zinc-100 group-hover:text-emerald-400 transition-colors">
              UNItrack
            </h1>
          </div>
        </div>

        {/* Workspace Switcher Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.05] text-[11px] font-medium text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Production</span>
          <ChevronDown className="w-3 h-3 text-zinc-500" />
        </div>
      </div>

      {/* Global Command & Search Bar */}
      <form 
        onSubmit={handleSearchSubmit}
        className={`flex-1 max-w-md hidden md:flex items-center bg-white/[0.02] border transition-all rounded-xl px-3.5 py-2 ${
          isSearchFocused ? 'border-emerald-500/40 bg-white/[0.04] shadow-[0_0_20px_rgba(16,185,129,0.06)]' : 'border-white/[0.05] hover:border-white/[0.1]'
        }`}
      >
        <Search className={`w-3.5 h-3.5 mr-2.5 shrink-0 transition-colors ${isSearchFocused ? 'text-emerald-400' : 'text-zinc-500'}`} />
        <input 
          type="text"
          placeholder="Search records (₹), projects, workouts... (Press Enter)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none font-sans"
        />
        {searchQuery && (
          <button 
            type="button" 
            onClick={() => setSearchQuery('')}
            className="text-zinc-500 hover:text-zinc-300 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Right Action Badges */}
      <div className="flex items-center space-x-2.5 shrink-0">
        {/* Neon Database & Storage Gauge Badge */}
        <button
          onClick={onOpenNeonConfig}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all interactive-element shadow-sm ${
            isNeonConnected
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15'
              : 'bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:text-zinc-100 hover:border-white/[0.1]'
          }`}
          title="Configure Serverless Postgres & View 512 MB Space Usage"
        >
          {isNeonConnected ? <Wifi className="w-3.5 h-3.5 animate-pulse text-emerald-400 shrink-0" /> : <Database className="w-3.5 h-3.5 shrink-0 text-zinc-400" />}
          <span className="font-mono text-[11px] tracking-tight">
            {isNeonConnected ? 'Postgres' : 'Local'}
          </span>
          {storageSummary && (
            <span className="hidden sm:inline-block font-mono text-[10px] opacity-75 pl-1.5 border-l border-white/[0.08]">
              {storageSummary.totalMB} MB
            </span>
          )}
        </button>

        {/* User Profile Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center space-x-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] px-3 py-1.5 rounded-xl interactive-element text-xs text-zinc-200 font-medium transition-all"
        >
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Profile" className="w-3.5 h-3.5 object-contain" />
          </div>
          <span className="max-w-[90px] truncate hidden sm:inline text-[11px] font-mono">{user?.name || 'Admin'}</span>
        </button>
      </div>
    </header>
  );
}
