import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import {
  Wallet,
  CheckSquare,
  Dumbbell,
  Plus,
  ChevronRight,
  Database
} from 'lucide-react';

export default function HomeDashboard({ onOpenQuickAdd }) {
  const { user, setActiveTab, neonSettings } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [storageUsage, setStorageUsage] = useState(null);

  const refreshAll = async () => {
    try {
      const [allTasks, allTx, allWorkouts, usage] = await Promise.all([
        dbService.getTasks(),
        dbService.getTransactions(),
        dbService.getWorkouts(),
        dbService.calculateStorageUsage()
      ]);
      setTasks(allTasks || []);
      setTransactions(allTx || []);
      setWorkouts(allWorkouts || []);
      setStorageUsage(usage || { totalMB: '0.00', percent: '0.00' });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    refreshAll();
  }, [neonSettings]);

  // Calculations
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Financial calculations
  const monthTx = transactions.filter((t) => {
    if (!t.date) return false;
    const txDate = new Date(t.date);
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
  });

  const monthExpenses = monthTx
    .filter((t) => t.type === 'expense' || !t.type)
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense' || !t.type)
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const netBalance = totalIncome - totalExpenses;

  // Tasks calculations
  const todayTasks = tasks.filter((t) => t.due_date === todayStr);
  const completedToday = todayTasks.filter((t) => t.completed).length;
  const overdueTasks = tasks.filter((t) => !t.completed && t.due_date && t.due_date < todayStr);

  // Workouts calculations
  const lastWorkout = workouts.length > 0 ? workouts[0] : null;

  return (
    <div className="space-y-8 pb-28 px-4 sm:px-6 max-w-6xl mx-auto pt-4 animate-fade-in font-sans">
      {/* Top Executive Header - Minimalist Open Surface */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white/[0.02] border border-white/[0.04] rounded-3xl p-6 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-bold font-mono text-emerald-400 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>EXECUTIVE COMMAND CENTER</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 font-sans">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white flex items-center gap-2">
            <span>Welcome back, {user?.name || 'Admin'}</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-medium max-w-xl leading-relaxed">
            Real-time telemetry across personal projects, financial ledgers (₹ INR), fitness volume & serverless Postgres quota.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-center shrink-0">
          <button
            onClick={onOpenQuickAdd}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.25)] transition-all interactive-element flex items-center space-x-2 text-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.75]" />
            <span className="font-['Outfit'] uppercase font-mono tracking-wider">New Entry</span>
          </button>
        </div>
      </div>

      {/* 4 Key Executive Metric Cards - Ultra Sleek & Non-Boxy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Financial Balance */}
        <div 
          onClick={() => setActiveTab('finance')}
          className="glass-card glass-card-hover p-5 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-2 font-mono uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Net Ledger (₹)</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ₹ INR
            </span>
          </div>
          <div className="my-2">
            <div className={`text-3xl font-black font-mono tracking-tight ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{netBalance.toFixed(2)}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Monthly spent: <span className="font-mono text-zinc-200 font-bold">₹{monthExpenses.toFixed(2)}</span>
            </p>
          </div>
          <div className="pt-3 mt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-400 group-hover:text-emerald-400 transition-colors font-medium">
            <span>View full financial report</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Metric 2: Active Tasks & Projects */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className="glass-card glass-card-hover p-5 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-2 font-mono uppercase tracking-wider">
              <CheckSquare className="w-4 h-4 text-purple-400" />
              <span>Tasks & Projects</span>
            </span>
            {overdueTasks.length > 0 && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                {overdueTasks.length} overdue
              </span>
            )}
          </div>
          <div className="my-2">
            <div className="text-3xl font-black font-mono tracking-tight text-white flex items-baseline gap-1.5">
              <span>{completedToday}</span>
              <span className="text-sm font-medium text-zinc-500">/ {todayTasks.length} today</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 truncate font-mono">
              {tasks.filter(t => !t.completed).length} active action items in queue
            </p>
          </div>
          <div className="pt-3 mt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-400 group-hover:text-purple-400 transition-colors font-medium">
            <span>Open project board</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Metric 3: Training & Fitness Volume */}
        <div 
          onClick={() => setActiveTab('gym')}
          className="glass-card glass-card-hover p-5 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-2 font-mono uppercase tracking-wider">
              <Dumbbell className="w-4 h-4 text-cyan-400" />
              <span>Gym Volume</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {workouts.length} sessions
            </span>
          </div>
          <div className="my-2">
            <div className="text-3xl font-black font-mono tracking-tight text-white">
              {lastWorkout ? `${lastWorkout.total_volume || 0} kg` : '0 kg'}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 truncate font-mono">
              {lastWorkout ? `Last: ${lastWorkout.exercise_name} (${lastWorkout.sets?.length || 0} sets)` : 'No recent workout logged'}
            </p>
          </div>
          <div className="pt-3 mt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-400 group-hover:text-cyan-400 transition-colors font-medium">
            <span>Log workout sets</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Metric 4: Postgres Storage & Space Meter */}
        <div 
          onClick={() => setActiveTab('settings')}
          className="glass-card glass-card-hover p-5 cursor-pointer group flex flex-col justify-between border-white/[0.06] bg-white/[0.02]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-2 font-mono uppercase tracking-wider">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Postgres Quota</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              512 MB Free
            </span>
          </div>
          <div className="my-2">
            <div className="text-3xl font-black font-mono tracking-tight text-white flex items-baseline gap-1.5">
              <span>{storageUsage ? `${storageUsage.totalMB} MB` : '0.00 MB'}</span>
              <span className="text-xs font-normal text-zinc-500">used</span>
            </div>
            {/* Ultra sleek space bar */}
            <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden my-2.5 border border-white/[0.05]">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                style={{ width: `${Math.min(parseFloat(storageUsage?.percent || 0), 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400 truncate font-mono">
              WebP image compression & cloud storage active
            </p>
          </div>
          <div className="pt-3 mt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-400 group-hover:text-emerald-400 transition-colors font-medium">
            <span>Open settings & storage</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
