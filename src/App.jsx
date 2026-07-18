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

function MainApp() {
  const { activeTab, loading } = useAuth();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [neonModalOpen, setNeonModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-[2px] animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-zinc-950 font-['Outfit'] text-base">
            U
          </div>
        </div>
        <p className="text-xs font-bold font-['Outfit'] text-zinc-400 animate-pulse tracking-wide">
          Loading UNItrack...
        </p>
      </div>
    );
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
