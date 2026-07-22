import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, Wallet, CheckSquare, Dumbbell, Plus } from 'lucide-react';

export default function BottomNav({ onOpenQuickAdd }) {
  const { activeTab, setActiveTab } = useAuth();

  // Exactly 2 items on the left, 1 action button dead center, 2 items on the right
  const navItems = [
    { id: 'home', label: 'Command', icon: Home },
    { id: 'finance', label: 'Ledger (₹)', icon: Wallet },
    { id: 'quick_add', isAction: true },
    { id: 'tasks', label: 'Projects', icon: CheckSquare },
    { id: 'gym', label: 'Fitness & Diet', icon: Dumbbell, activeMatch: ['gym', 'diet', 'fitness_diet'] },
  ];

  const handleNavClick = (item) => {
    if (item.isAction) {
      onOpenQuickAdd();
      return;
    }
    setActiveTab(item.id);
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:w-[520px] sm:left-1/2 sm:-translate-x-1/2 z-40 bg-[#09090b]/80 backdrop-blur-3xl border border-white/[0.06] rounded-full shadow-[0_20px_60px_-10px_rgba(0,0,0,0.95)] h-16 transition-all px-3 flex items-center justify-around font-sans">
      {navItems.map((item) => {
        if (item.isAction) {
          return (
            <div key="quick-add" className="flex items-center justify-center px-1">
              <button
                onClick={onOpenQuickAdd}
                className="w-13 h-13 -top-4 relative rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.35)] border-4 border-[#09090b] transition-all hover:scale-105 active:scale-95 interactive-element group"
                title="Open Quick Add Modal"
              >
                <Plus className="w-6 h-6 stroke-[3] transition-transform group-hover:rotate-90" />
              </button>
            </div>
          );
        }

        const Icon = item.icon;
        const isActive = activeTab === item.id || (item.activeMatch && item.activeMatch.includes(activeTab));

        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-full transition-all interactive-element min-w-[64px] ${
              isActive 
                ? 'text-emerald-400 bg-white/[0.04] font-bold border border-white/[0.06] shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent hover:bg-white/[0.02]'
            }`}
          >
            <Icon className={`w-4 h-4 transition-transform ${isActive ? 'stroke-[2.5] text-emerald-400 scale-105' : 'stroke-[1.75]'}`} />
            <span className={`text-[10px] mt-1 tracking-tight transition-colors font-sans ${isActive ? 'text-emerald-400 font-bold' : 'text-zinc-400 font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
