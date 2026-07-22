import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';
import { X, Wallet, CheckSquare, Dumbbell, Utensils, Plus, Trash2, Camera, Sparkles, Check, ArrowRight } from 'lucide-react';

export default function QuickAddModal({ isOpen, onClose }) {
  const { user, refreshAll, setActiveTab } = useAuth();
  const [tab, setTab] = useState('transaction');
  const [loading, setLoading] = useState(false);

  // Transaction form state
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('food');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txNote, setTxNote] = useState('');
  const [txType, setTxType] = useState('expense');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskProject, setTaskProject] = useState('General');

  // Gym form state
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState([{ reps: '10', weight: '60' }]);

  // Diet form state
  const [dietTitle, setDietTitle] = useState('');
  const [dietImageBase64, setDietImageBase64] = useState('');

  if (!isOpen) return null;

  const handleAddSet = () => {
    const last = sets[sets.length - 1] || { reps: '10', weight: '60' };
    setSets([...sets, { reps: last.reps, weight: last.weight }]);
  };

  const handleUpdateSet = (index, field, value) => {
    const updated = [...sets];
    updated[index][field] = value;
    setSets(updated);
  };

  const handleRemoveSet = (index) => {
    setSets(sets.filter((_, i) => i !== index));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDietImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      if (tab === 'transaction') {
        if (!txAmount) return;
        await dbService.addTransaction({
          userId: user.id,
          amount: txAmount,
          category: txCategory,
          date: txDate,
          note: txNote,
          type: txType
        });
        setActiveTab('finance');
      } else if (tab === 'task') {
        if (!taskTitle) return;
        await dbService.addTask({
          userId: user.id,
          title: taskTitle,
          description: taskDesc,
          dueDate: taskDate,
          priority: taskPriority,
          project: taskProject
        });
        setActiveTab('tasks');
      } else if (tab === 'workout') {
        if (!exerciseName || sets.length === 0) return;
        await dbService.logWorkout({
          userId: user.id,
          date: new Date().toISOString().split('T')[0],
          exerciseName,
          sets
        });
        setActiveTab('gym');
      } else if (tab === 'diet') {
        if (!dietImageBase64) return;
        await dbService.uploadDietPlan({
          userId: user.id,
          title: dietTitle || 'Diet Chart ' + new Date().toLocaleDateString(),
          imageData: dietImageBase64,
          uploadDate: new Date().toISOString().split('T')[0],
          isActive: true
        });
        setActiveTab('diet');
      }

      await refreshAll();
      onClose();
    } catch (err) {
      console.error('Quick Add Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const categoryChips = [
    { id: 'food', label: 'Dining & Food' },
    { id: 'transport', label: 'Transport' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'bills', label: 'Bills & Utilities' },
    { id: 'health', label: 'Health & Fitness' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'other', label: 'Other / SaaS' },
  ];

  const priorityChips = [
    { id: 'high', label: 'High Priority', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300' },
    { id: 'medium', label: 'Medium Priority', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' },
    { id: 'low', label: 'Low Priority', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-[#0c0c0e] border border-[#27272a] rounded-t-3xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden max-h-[92vh] flex flex-col transition-all">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#27272a] bg-[#121214] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Quick Command Entry
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Store logs directly to Postgres
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition-all interactive-element"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Module Selector Pills */}
        <div className="grid grid-cols-4 p-2.5 gap-2 bg-[#121214] border-b border-[#27272a]">
          {[
            { id: 'transaction', label: 'Ledger (₹)', icon: Wallet },
            { id: 'task', label: 'Project Task', icon: CheckSquare },
            { id: 'workout', label: 'Gym Set', icon: Dumbbell },
            { id: 'diet', label: 'Diet Chart', icon: Utensils }
          ].map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                type="button"
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all interactive-element ${
                  isActive
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:bg-[#18181b] hover:text-zinc-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[3]' : 'stroke-[1.75]'}`} />
                <span className="tracking-tight">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {tab === 'transaction' && (
            <div className="space-y-4 animate-fade-in">
              {/* Type Switcher */}
              <div className="flex bg-[#18181b] p-1 rounded-xl border border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all interactive-element flex items-center justify-center gap-1 ${
                    txType === 'expense' ? 'bg-rose-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  <span>Expense (-)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all interactive-element flex items-center justify-center gap-1 ${
                    txType === 'income' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  <span>Income (+)</span>
                </button>
              </div>

              {/* Glowing Amount Field strictly in ₹ */}
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1.5 uppercase tracking-wider font-mono">
                  Amount strictly in ₹ INR *
                </label>
                <div className="flex items-center bg-[#18181b] border-2 border-[#27272a] focus-within:border-emerald-500 rounded-2xl overflow-hidden transition-all shadow-inner">
                  <div className="px-4 py-3 bg-[#121214] border-r border-[#27272a] text-emerald-400 font-black text-2xl font-mono select-none">
                    ₹
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent px-4 py-3 text-2xl sm:text-3xl font-black text-white focus:outline-none font-mono tracking-tight"
                  />
                </div>
              </div>

              {/* Quick Category Chips */}
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1.5 uppercase tracking-wider font-mono">
                  Select Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categoryChips.map((chip) => {
                    const isSelected = txCategory === chip.id;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setTxCategory(chip.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all interactive-element flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:text-zinc-100 hover:border-zinc-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                        <span>{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date and Note Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Note / Merchant</label>
                  <input
                    type="text"
                    placeholder="e.g. Swiggy Lunch, AWS Cloud"
                    value={txNote}
                    onChange={(e) => setTxNote(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {tab === 'task' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1.5 uppercase tracking-wider font-mono">
                  Action Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="What needs to be built or completed?"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  autoFocus
                  className="w-full bg-[#18181b] border-2 border-[#27272a] focus:border-purple-500 rounded-2xl px-4 py-3 text-base font-bold text-zinc-100 focus:outline-none shadow-inner transition-all"
                />
              </div>

              {/* Quick Priority Selector Chips */}
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1.5 uppercase tracking-wider font-mono">
                  Priority Level
                </label>
                <div className="flex gap-2">
                  {priorityChips.map((chip) => {
                    const isSelected = taskPriority === chip.id;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setTaskPriority(chip.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all interactive-element flex items-center justify-center gap-1 ${
                          isSelected ? `${chip.color} shadow-sm border-2 scale-105` : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:text-zinc-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{chip.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Project / Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. SaaS Launch, Marketing"
                    value={taskProject}
                    onChange={(e) => setTaskProject(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Details & Sub-tasks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Add technical specification or sub-tasks..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {tab === 'workout' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1.5 uppercase tracking-wider font-mono">
                  Exercise / Movement Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barbell Squat, Overhead Press, Deadlift"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  autoFocus
                  className="w-full bg-[#18181b] border-2 border-[#27272a] focus:border-cyan-500 rounded-2xl px-4 py-3 text-base font-bold text-zinc-100 focus:outline-none shadow-inner transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider font-mono">
                    Sets (Reps × Weight in kg)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSet}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs hover:bg-cyan-500/20 interactive-element flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Set</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {sets.map((s, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-[#18181b] p-2.5 rounded-xl border border-[#27272a]">
                      <span className="w-7 text-center text-xs font-mono font-extrabold text-cyan-400 bg-[#121214] py-1 rounded-md border border-[#27272a]">
                        #{idx + 1}
                      </span>
                      <div className="flex-1 flex items-center space-x-1.5">
                        <input
                          type="number"
                          placeholder="Reps"
                          value={s.reps}
                          onChange={(e) => handleUpdateSet(idx, 'reps', e.target.value)}
                          className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-2 py-1.5 text-sm text-center text-zinc-100 font-mono focus:outline-none focus:border-cyan-500 font-bold"
                        />
                        <span className="text-xs text-zinc-500 font-mono">reps</span>
                      </div>
                      <div className="flex-1 flex items-center space-x-1.5">
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Weight"
                          value={s.weight}
                          onChange={(e) => handleUpdateSet(idx, 'weight', e.target.value)}
                          className="w-full bg-[#121214] border border-[#27272a] rounded-lg px-2 py-1.5 text-sm text-center text-zinc-100 font-mono focus:outline-none focus:border-cyan-500 font-bold"
                        />
                        <span className="text-xs text-zinc-500 font-mono">kg</span>
                      </div>
                      {sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSet(idx)}
                          className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'diet' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1.5 uppercase tracking-wider font-mono">
                  Chart Title / Schedule Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nutritionist Fat Loss Schedule v2"
                  value={dietTitle}
                  onChange={(e) => setDietTitle(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1.5 uppercase tracking-wider font-mono">
                  Upload Diet Chart Photo *
                </label>
                <div className="border-2 border-dashed border-[#27272a] rounded-2xl p-5 text-center bg-[#18181b] hover:border-emerald-400 transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  {dietImageBase64 ? (
                    <div className="space-y-2">
                      <img src={dietImageBase64} alt="Diet Preview" className="max-h-36 mx-auto rounded-xl object-contain border border-[#27272a] shadow-md animate-scale-in" />
                      <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <Check className="w-4 h-4" />
                        <span>High-Speed WebP Compression Ready</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-zinc-200 font-bold">Tap to upload or snap Chart Photo</p>
                      <p className="text-[10px] text-zinc-500 font-mono">Supports JPG, PNG, WEBP with automatic DB resizing</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* High Impact Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-black rounded-2xl shadow-[0_4px_25px_rgba(16,185,129,0.3)] interactive-element flex items-center justify-center space-x-2 text-sm uppercase tracking-wider font-mono transition-transform active:scale-95 mt-6"
          >
            <span>{loading ? 'Committing to Postgres...' : `Save ${tab.toUpperCase()} RECORD →`}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
