import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import QuickAddModal from './components/common/QuickAddModal';
import AuthModal from './components/auth/AuthModal';
import NeonConfigModal from './components/auth/NeonConfigModal';

import HomeDashboard from './screens/HomeDashboard';
import FinanceTracker from './screens/FinanceTracker';
import TaskPlanner from './screens/TaskPlanner';
import GymTracker from './screens/GymTracker';
import DietViewer from './screens/DietViewer';
import SettingsScreen from './screens/SettingsScreen';
import { LogIn, ShieldCheck, Lock } from 'lucide-react';

function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!username || !password) return;
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-zinc-950 font-sans">
      <div className="w-full max-w-md bg-[#0c0c0e] border border-[#27272a] rounded-3xl p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative animate-fade-in">
        {/* Top Minimalist Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-sm">
            <img src="/logo.png" alt="UNItrack Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold font-['Outfit'] text-white tracking-tight">
            UNItrack Enterprise Suite
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 font-mono">
            Serverless Postgres & Financial Ledger
          </p>

          <div className="mt-4 bg-[#18181b] border border-[#27272a] rounded-2xl p-3.5 text-left flex items-start space-x-3">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-zinc-300 space-y-0.5 leading-relaxed">
              <span className="font-bold text-white block">Secure Workspace Gating</span>
              <span>Authorized access only. For demonstration or shared access, use username <code className="text-emerald-400 font-mono font-bold bg-[#121214] px-1 rounded">admin</code> and password <code className="text-emerald-400 font-mono font-bold bg-[#121214] px-1 rounded">admin</code>.</span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="text-xs text-zinc-400 font-bold block mb-1 uppercase font-mono tracking-wider">
              Username
            </label>
            <input
              type="text"
              required
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-bold block mb-1 uppercase font-mono tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-black rounded-2xl shadow-[0_4px_25px_rgba(16,185,129,0.3)] active:scale-95 transition-all text-sm mt-4 flex items-center justify-center gap-2 uppercase font-mono tracking-wider interactive-element"
          >
            <LogIn className="w-4 h-4 stroke-[2.5]" />
            <span>{loading ? 'Authenticating Workspace...' : 'Sign In to Workspace →'}</span>
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#27272a] flex items-center justify-center space-x-2 text-[11px] text-zinc-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Serverless Postgres 512MB Quota Protected</span>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const { activeTab, loading, user } = useAuth();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [neonModalOpen, setNeonModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 p-1 animate-pulse flex items-center justify-center overflow-hidden shadow-sm">
          <img src="/logo.png" alt="UNItrack Logo" className="w-full h-full object-cover rounded-xl" />
        </div>
        <p className="text-xs font-bold font-['Outfit'] text-zinc-400 animate-pulse tracking-wide">
          Loading UNItrack...
        </p>
      </div>
    );
  }

  // If user is not logged in, enforce full-screen Login Screen gate
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
      {/* Top Header */}
      <Header
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenNeonConfig={() => setNeonModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden pt-3">
        {activeTab === 'home' && <HomeDashboard onOpenQuickAdd={() => setQuickAddOpen(true)} />}
        {activeTab === 'finance' && <FinanceTracker onOpenQuickAdd={() => setQuickAddOpen(true)} />}
        {activeTab === 'tasks' && <TaskPlanner onOpenQuickAdd={() => setQuickAddOpen(true)} />}
        {activeTab === 'gym' && <GymTracker />}
        {activeTab === 'diet' && <DietViewer onOpenQuickAdd={() => setQuickAddOpen(true)} />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav onOpenQuickAdd={() => setQuickAddOpen(true)} />

      {/* Native Android PWA Install Banner */}
      <PWAInstallPrompt />

      {/* Modals */}
      <QuickAddModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <NeonConfigModal isOpen={neonModalOpen} onClose={() => setNeonModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
