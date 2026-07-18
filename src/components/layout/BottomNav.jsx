import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, Wallet, CheckSquare, Dumbbell, Utensils, Plus } from 'lucide-react';

export default function BottomNav({ onOpenQuickAdd }) {
  const { activeTab, setActiveTab } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'quick_add', isFab: true },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'gym', label: 'Gym', icon: Dumbbell },
    { id: 'diet', label: 'Diet', icon: Utensils },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#121214] border-t border-[#27272a] pb-safe shadow-2xl transition-all">
      <div className="max-w-md mx-auto px-2 flex items-center justify-around h-16 relative">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <div key="quick-add" className="relative -top-4 flex flex-col items-center">
                <button
                  onClick={onOpenQuickAdd}
                  className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-zinc-950 shadow-lg interactive-element border-4 border-[#09090b]"
                  title="Quick Add Action"
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
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
              className={`flex flex-col items-center justify-center w-12 py-1 relative interactive-element ${
                isActive ? 'text-emerald-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.25] text-emerald-400 -translate-y-0.5' : 'stroke-[1.75]'}`} />
              <span className={`text-[11px] mt-1 tracking-tight transition-colors ${isActive ? 'text-emerald-400 font-bold' : 'text-zinc-500 font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-emerald-400 rounded-full animate-scale-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
