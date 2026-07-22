import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import {
  Wallet,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  PieChart as PieIcon,
  BarChart3,
  Filter,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function FinanceTracker({ onOpenQuickAdd }) {
  const { user, transactions, subscriptions, refreshAll } = useAuth();
  const [subTab, setSubTab] = useState('transactions'); // 'transactions', 'subscriptions', 'analytics'

  // Filter state for transactions
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterCategory, setFilterCategory] = useState('all');

  // New Subscription Quick Form state inside Subscriptions tab
  const [showSubForm, setShowSubForm] = useState(false);
  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subCycle, setSubCycle] = useState('monthly');
  const [subNextDue, setSubNextDue] = useState(new Date().toISOString().split('T')[0]);

  // Category Icon map
  const categoryMeta = {
    food: { label: 'Dining & Food', icon: 'DIN', color: '#10b981' },
    transport: { label: 'Transport', icon: 'TRN', color: '#06b6d4' },
    shopping: { label: 'Shopping', icon: 'SHP', color: '#8b5cf6' },
    bills: { label: 'Bills & Utilities', icon: 'BIL', color: '#f59e0b' },
    health: { label: 'Health & Fitness', icon: 'HLT', color: '#ec4899' },
    entertainment: { label: 'Entertainment', icon: 'ENT', color: '#3b82f6' },
    other: { label: 'Other', icon: 'OTH', color: '#64748b' }
  };

  // Filter transactions
  const filteredTx = transactions.filter((t) => {
    const matchMonth = t.date.startsWith(selectedMonth);
    const matchCat = filterCategory === 'all' || t.category === filterCategory;
    return matchMonth && matchCat;
  });

  // Calculate totals
  const totalExpense = filteredTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const totalIncome = filteredTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const netBalance = totalIncome - totalExpense;

  // Chart data calculation
  const categoryTotals = {};
  filteredTx.forEach((t) => {
    if (t.type === 'expense') {
      const cat = t.category || 'other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(t.amount || 0);
    }
  });

  const doughnutData = {
    labels: Object.keys(categoryTotals).map((k) => categoryMeta[k]?.label || k),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map((k) => categoryMeta[k]?.color || '#64748b'),
        borderColor: '#0b0f19',
        borderWidth: 2
      }
    ]
  };

  const barData = {
    labels: Object.keys(categoryTotals).map((k) => categoryMeta[k]?.label || k),
    datasets: [
      {
        label: 'Spending by Category (₹)',
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map((k) => categoryMeta[k]?.color || '#06b6d4'),
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#cbd5e1', font: { size: 11, family: 'Plus Jakarta Sans' } }
      }
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  const handleDeleteTx = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await dbService.deleteTransaction(id);
    await refreshAll();
  };

  const handleDeleteSub = async (id) => {
    if (!window.confirm('Delete this recurring subscription?')) return;
    await dbService.deleteSubscription(id);
    await refreshAll();
  };

  const handleAddSubSubmit = async (e) => {
    e.preventDefault();
    if (!user || !subName || !subAmount) return;
    await dbService.addSubscription({
      userId: user.id,
      name: subName,
      amount: subAmount,
      billingCycle: subCycle,
      nextDueDate: subNextDue,
      remindDays: 3
    });
    setSubName('');
    setSubAmount('');
    setShowSubForm(false);
    await refreshAll();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-5 pb-24 px-4 max-w-4xl mx-auto pt-2 animate-fade-in">
      {/* Module Title & Stats Bar */}
      <div className="bg-[#111827] rounded-3xl p-5 border border-[#1f2937] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-['Outfit'] text-white">Finance Tracker</h2>
            <p className="text-xs text-slate-400">Track daily spending, subscriptions, and category analytics.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:space-x-3 bg-slate-900 p-2 rounded-2xl border border-[#1f2937]">
          <div className="px-2 text-center sm:text-left">
            <span className="text-[10px] text-slate-400 block">Expense</span>
            <span className="text-sm sm:text-base font-mono font-bold text-rose-400">₹{totalExpense.toFixed(0)}</span>
          </div>
          <div className="px-2 border-x border-[#1f2937] text-center sm:text-left">
            <span className="text-[10px] text-slate-400 block">Income</span>
            <span className="text-sm sm:text-base font-mono font-bold text-emerald-400">₹{totalIncome.toFixed(0)}</span>
          </div>
          <div className="px-2 text-center sm:text-left">
            <span className="text-[10px] text-slate-400 block">Net</span>
            <span className={`text-sm sm:text-base font-mono font-bold ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{netBalance.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex bg-[#18181b] p-1.5 rounded-2xl border border-[#27272a] max-w-md mx-auto">
        {[
          { id: 'transactions', label: 'Transactions', icon: Wallet },
          { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw },
          { id: 'analytics', label: 'Analytics', icon: PieIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 interactive-element ${
                isActive ? 'bg-emerald-500 text-zinc-950 shadow-sm font-bold' : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: TRANSACTIONS */}
      {subTab === 'transactions' && (
        <div className="space-y-4">
          {/* Filters & Quick Add Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-2 glass-card rounded-2xl p-3 border border-white/10">
            <div className="flex items-center space-x-2">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryMeta).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenQuickAdd}
              className="px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl hover:bg-emerald-500/30 transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>
          </div>

          {/* Transactions List */}
          <div className="space-y-2">
            {filteredTx.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-xs">
                No transactions recorded for this month/category. Tap '+ Quick Log' above!
              </div>
            ) : (
              filteredTx.map((t) => {
                const meta = categoryMeta[t.category] || categoryMeta.other;
                const isExpense = t.type === 'expense';
                return (
                  <div
                    key={t.id}
                    className="glass-card glass-card-hover rounded-2xl p-3.5 border border-white/5 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-[11px] font-mono font-extrabold text-zinc-200 tracking-wider shrink-0">
                        {meta.icon}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm truncate">{meta.label}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{t.date}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{t.note || 'No description provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className={`font-mono font-extrabold text-base ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isExpense ? '-' : '+'}₹{parseFloat(t.amount).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleDeleteTx(t.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SUBSCRIPTIONS */}
      {subTab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between glass-card rounded-2xl p-4 border border-white/10">
            <div>
              <h3 className="font-bold text-sm text-white">Recurring Subscriptions</h3>
              <p className="text-xs text-slate-400">Get automatic renewal reminder alerts before billing date.</p>
            </div>
            <button
              onClick={() => setShowSubForm(!showSubForm)}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl shadow-sm interactive-element flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{showSubForm ? 'Close Form' : 'Add Subscription'}</span>
            </button>
          </div>

          {/* New Subscription Form */}
          {showSubForm && (
            <form onSubmit={handleAddSubSubmit} className="glass-card bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/40 space-y-3 animate-fade-in">
              <h4 className="font-bold text-xs text-emerald-400 font-['Outfit']">New Recurring Bill</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Service Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Netflix, Gym Membership, AWS"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="14.99"
                    value={subAmount}
                    onChange={(e) => setSubAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Billing Cycle</label>
                  <select
                    value={subCycle}
                    onChange={(e) => setSubCycle(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Next Due Date *</label>
                  <input
                    type="date"
                    required
                    value={subNextDue}
                    onChange={(e) => setSubNextDue(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:brightness-110 transition-all mt-2"
              >
                Save Subscription
              </button>
            </form>
          )}

          {/* Subscriptions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subscriptions.length === 0 ? (
              <div className="col-span-2 glass-card rounded-2xl p-8 text-center text-slate-400 text-xs">
                No active subscriptions added. Tap 'Add Subscription' to get due date reminder badges!
              </div>
            ) : (
              subscriptions.map((s) => {
                const diffTime = new Date(s.next_due_date) - new Date(todayStr);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isDueSoon = diffDays >= 0 && diffDays <= 5;
                const isOverdue = diffDays < 0;

                return (
                  <div
                    key={s.id}
                    className={`glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between ${
                      isDueSoon
                        ? 'border-emerald-500/50 bg-[#18181b] animate-pulse-subtle'
                        : isOverdue
                        ? 'border-red-500/50 bg-[#18181b]'
                        : 'border-[#27272a]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                          {s.billing_cycle}
                        </span>
                        <h4 className="font-bold text-white text-base mt-0.5">{s.name}</h4>
                      </div>
                      <span className="font-mono font-extrabold text-lg text-emerald-400">
                        ₹{parseFloat(s.amount).toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className={`w-3.5 h-3.5 ${isDueSoon ? 'text-emerald-400' : 'text-zinc-400'}`} />
                        <span className={isDueSoon ? 'text-emerald-300 font-bold' : isOverdue ? 'text-red-400 font-bold' : 'text-zinc-300'}>
                          Due: {s.next_due_date} ({isOverdue ? `${Math.abs(diffDays)}d overdue` : diffDays === 0 ? 'Today!' : `in ${diffDays}d`})
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteSub(s.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete subscription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ANALYTICS */}
      {subTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Doughnut Chart: Spending Breakdown */}
            <div className="glass-card rounded-3xl p-5 border border-white/10">
              <h3 className="font-bold text-sm text-white font-['Outfit'] mb-3">Spending Breakdown by Category</h3>
              <div className="h-64 relative">
                {Object.keys(categoryTotals).length > 0 ? (
                  <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No expense data recorded to generate pie chart.
                  </div>
                )}
              </div>
            </div>

            {/* Bar Chart: Spending Breakdown */}
            <div className="glass-card rounded-3xl p-5 border border-white/10">
              <h3 className="font-bold text-sm text-white font-['Outfit'] mb-3">Category Comparison Bar Chart</h3>
              <div className="h-64 relative">
                {Object.keys(categoryTotals).length > 0 ? (
                  <Bar data={barData} options={chartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No expense data recorded to generate bar chart.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
