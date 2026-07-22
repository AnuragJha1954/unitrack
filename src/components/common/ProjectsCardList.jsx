import React, { useState } from 'react';
import { Search, Calendar, ChevronDown, Plus, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

/**
 * Production-grade Projects & Cards List view inspired by elite SaaS tools (Linear & Vercel).
 * Features filter pills (`All projects`, `Recently viewed`), rounded dark glassmorphic cards with status tags,
 * calendar countdowns (`📅 3 days left`), and monetary tracking strictly in Indian Rupees (`₹`).
 */
export default function ProjectsCardList({ items = [], onOpenQuickAdd, onSelectItem, title = "SaaS Projects & Modules" }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter items by search query and tab
  const filteredItems = items.filter((item) => {
    const matchesQuery = !searchQuery.trim() || 
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.project && item.project.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;
    if (filter === 'recent') {
      return item.priority === 'high' || item.is_active || item.type === 'subscription' || item.project;
    }
    if (filter === 'priority') {
      return item.priority === 'high';
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Top Title & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-white flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono border border-purple-500/20">
              {filteredItems.length} active
            </span>
          </h2>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm interactive-element self-start sm:self-center"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.75]" />
          <span className="font-['Outfit']">New Project / Task</span>
        </button>
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.04]">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search projects, modules, budgets (₹)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.05] focus:border-emerald-500/50 rounded-xl px-4 py-2 pl-9 text-xs text-zinc-100 placeholder-zinc-500 font-sans transition-all focus:outline-none"
          />
          <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-500" />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'recent', label: 'Recently Viewed' },
            { id: 'priority', label: 'High Priority' }
          ].map((f) => {
            const isActive = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all interactive-element whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] font-sans'
                    : 'bg-white/[0.02] text-zinc-400 hover:text-white border border-white/[0.04]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {filteredItems.length === 0 ? (
          <div className="md:col-span-2 glass-card rounded-3xl p-10 text-center space-y-2 font-mono">
            <p className="text-zinc-400 text-xs font-medium">No projects found matching your criteria.</p>
            <button
              onClick={() => { setFilter('all'); setSearchQuery(''); }}
              className="text-emerald-400 font-bold text-xs hover:underline uppercase tracking-wider"
            >
              Reset filters & search
            </button>
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const targetDate = item.due_date || item.next_due_date || item.upload_date || todayStr;
            const diffDays = Math.ceil((new Date(targetDate) - new Date(todayStr)) / (1000 * 60 * 60 * 24));
            const isPriority = item.priority === 'high' || item.type === 'expense';
            const isCompleted = item.completed;

            return (
              <div
                key={item.id || idx}
                onClick={() => onSelectItem && onSelectItem(item)}
                className={`glass-card glass-card-hover p-6 transition-all interactive-element group cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isCompleted ? 'opacity-60' : ''
                }`}
              >
                <div>
                  {/* Top Pill Tag & Right Arrow */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          isPriority
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : item.priority === 'medium' || item.type === 'subscription'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}
                      >
                        {item.priority ? (item.priority === 'high' ? 'High Priority' : item.priority) : item.type ? item.type : 'SaaS Module'}
                      </span>
                      {item.project && (
                        <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.05] text-zinc-300 text-[10px] font-mono">
                          {item.project}
                        </span>
                      )}
                    </div>

                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Card Title & Amount */}
                  <div className="flex items-start justify-between gap-3 my-2.5">
                    <h3 className={`text-base sm:text-lg font-bold font-['Outfit'] tracking-tight ${
                      isCompleted ? 'task-strikethrough text-zinc-500' : 'text-white group-hover:text-emerald-400 transition-colors'
                    }`}>
                      {item.title || item.name || 'Untitled SaaS Module'}
                    </h3>

                    {item.amount && (
                      <span className="text-base font-black font-mono text-emerald-400 shrink-0 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        ₹{parseFloat(item.amount).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 font-sans">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Calendar Countdown & Stacked Badges */}
                <div className="flex items-center justify-between mt-6 pt-3.5 border-t border-white/[0.04] text-xs text-zinc-400 font-mono">
                  <div className="flex items-center space-x-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      {diffDays === 0
                        ? 'Due Today'
                        : diffDays < 0
                        ? `${Math.abs(diffDays)}d overdue`
                        : `${diffDays}d left`}
                    </span>
                  </div>

                  {/* Stacked Badges */}
                  <div className="flex items-center -space-x-1.5 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#121214] flex items-center justify-center text-[8px] font-extrabold text-zinc-950">
                      U
                    </div>
                    <div className="w-5 h-5 rounded-full bg-purple-600 border-2 border-[#121214] flex items-center justify-center text-[8px] font-extrabold text-white">
                      PRO
                    </div>
                    <div className="w-5 h-5 rounded-full bg-white/[0.06] border-2 border-[#121214] flex items-center justify-center text-[8px] font-mono font-bold text-zinc-300">
                      +{(idx % 3) + 1}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
