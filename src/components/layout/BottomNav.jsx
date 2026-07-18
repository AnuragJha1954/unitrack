import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, Wallet, CheckSquare, Dumbbell, Utensils, Plus } from 'lucide-react';

export default function BottomNav({ onOpenQuickAdd }) {
  const { activeTab, setActiveTab } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, color: 'cyan' },
    { id: 'finance', label: 'Finance', icon: Wallet, color: 'emerald' },
    { id: 'quick_add', isFab: true },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'purple' },
    { id: 'gym', label: 'Gym', icon: Dumbbell, color: 'amber' },
    { id: 'diet', label: 'Diet', icon: Utensils, color: 'cyan' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-white/10 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-md mx-auto px-2 flex items-center justify-around h-16 relative">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <div key="quick-add" className="relative -top-5 flex flex-col items-center">
                <button
                  onClick={onOpenQuickAdd}
                  className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-500 via-emerald-500 to-purple-500 flex items-center justify-center text-white shadow-lg neon-glow-cyan transform hover:scale-110 active:scale-95 transition-all border-2 border-[#0b0f19]"
                  title="Quick Add Action"
                >
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </button>
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-12 py-1 relative transition-all duration-200 ${
                isActive ? 'text-cyan-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-all ${isActive ? 'stroke-[2.5] text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'stroke-[1.75]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight font-medium ${isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
