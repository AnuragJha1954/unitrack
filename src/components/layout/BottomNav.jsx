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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#111827] border-t border-[#1f2937] pb-safe shadow-lg">
      <div className="max-w-md mx-auto px-2 flex items-center justify-around h-16 relative">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <div key="quick-add" className="relative -top-4 flex flex-col items-center">
                <button
                  onClick={onOpenQuickAdd}
                  className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-slate-950 shadow-md active:scale-95 transition-all border-4 border-[#090d16]"
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
              className={`flex flex-col items-center justify-center w-12 py-1 relative transition-all ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.25] text-emerald-400' : 'stroke-[1.75]'}`} />
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
