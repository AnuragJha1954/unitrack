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
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-purple-500 p-[2px] animate-spin">
          <div className="w-full h-full bg-[#0b0f19] rounded-3xl flex items-center justify-center" />
        </div>
        <p className="text-sm font-bold font-['Outfit'] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 animate-pulse">
          Loading UNItrack Personal Ecosystem...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
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
