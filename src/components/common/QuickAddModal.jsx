import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/dbService';
import { X, DollarSign, CheckSquare, Dumbbell, Utensils, Plus, Trash2, Camera } from 'lucide-react';

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

  // Gym form state
  const [exerciseName, setExerciseName] = useState('Bench Press');
  const [sets, setSets] = useState([{ reps: '10', weight: '60' }, { reps: '8', weight: '65' }]);

  // Diet form state
  const [dietTitle, setDietTitle] = useState('');
  const [dietImageBase64, setDietImageBase64] = useState('');

  if (!isOpen) return null;

  const handleAddSet = () => {
    const last = sets[sets.length - 1] || { reps: '10', weight: '50' };
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
          priority: taskPriority
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 animate-fade-in">
      <div className="w-full max-w-lg bg-[#111827] border-t sm:border border-[#1f2937] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1f2937] flex items-center justify-between">
          <h3 className="font-bold text-lg text-white font-['Outfit'] flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
            Quick Add
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Module Selector Tabs */}
        <div className="grid grid-cols-4 p-2 gap-1.5 bg-slate-900 border-b border-[#1f2937]">
          {[
            { id: 'transaction', label: 'Finance', icon: DollarSign },
            { id: 'task', label: 'Task', icon: CheckSquare },
            { id: 'workout', label: 'Gym', icon: Dumbbell },
            { id: 'diet', label: 'Diet Plan', icon: Utensils }
          ].map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-2 px-1 rounded-xl text-xs font-medium flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-slate-800 border border-[#1f2937] text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {tab === 'transaction' && (
            <>
              <div className="flex bg-slate-900 p-1 rounded-xl border border-[#1f2937]">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    txType === 'expense' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'text-slate-400'
                  }`}
                >
                  Expense (-)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    txType === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400'
                  }`}
                >
                  Income (+)
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-[#1f2937] rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Category</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-[#1f2937] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="food">🍔 Food & Dining</option>
                    <option value="transport">🚗 Transport</option>
                    <option value="shopping">🛍️ Shopping</option>
                    <option value="bills">⚡ Bills & Utilities</option>
                    <option value="health">💊 Health & Fitness</option>
                    <option value="entertainment">🎬 Entertainment</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-900 border border-[#1f2937] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Groceries"
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  className="w-full bg-slate-900 border border-[#1f2937] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </>
          )}

          {tab === 'task' && (
            <>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="What needs to be done?"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-[#1f2937] rounded-xl px-4 py-3 text-base font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full bg-slate-900 border border-[#1f2937] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full bg-slate-900 border border-[#1f2937] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="high">🔥 High Priority</option>
                    <option value="medium">⚡ Medium Priority</option>
                    <option value="low">🌱 Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Add extra notes or sub-tasks..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-[#1f2937] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </>
          )}

          {tab === 'workout' && (
            <>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Exercise Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barbell Squat, Bench Press, Pull-ups"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full bg-slate-900 border border-[#1f2937] rounded-xl px-4 py-3 text-base font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-400 font-medium">Sets (Reps × Weight in kg/lbs)</label>
                  <button
                    type="button"
                    onClick={handleAddSet}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Set
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {sets.map((s, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-[#1f2937]">
                      <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                      <div className="flex-1 flex items-center space-x-1">
                        <input
                          type="number"
                          placeholder="Reps"
                          value={s.reps}
                          onChange={(e) => handleUpdateSet(idx, 'reps', e.target.value)}
                          className="w-20 bg-slate-800 border border-[#1f2937] rounded-lg px-2 py-1.5 text-sm text-center text-white font-mono"
                        />
                        <span className="text-xs text-slate-500">reps</span>
                      </div>
                      <div className="flex-1 flex items-center space-x-1">
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Weight"
                          value={s.weight}
                          onChange={(e) => handleUpdateSet(idx, 'weight', e.target.value)}
                          className="w-20 bg-slate-800 border border-[#1f2937] rounded-lg px-2 py-1.5 text-sm text-center text-white font-mono"
                        />
                        <span className="text-xs text-slate-500">kg</span>
                      </div>
                      {sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSet(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'diet' && (
            <>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Plan Title / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Macro Chart"
                  value={dietTitle}
                  onChange={(e) => setDietTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-[#1f2937] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Upload Diet Chart / Sheet Photo *</label>
                <div className="border-2 border-dashed border-[#1f2937] rounded-2xl p-4 text-center bg-slate-900 hover:bg-slate-800 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {dietImageBase64 ? (
                    <div className="space-y-2">
                      <img src={dietImageBase64} alt="Diet Preview" className="max-h-36 mx-auto rounded-xl object-contain border border-[#1f2937]" />
                      <p className="text-xs text-emerald-400 font-medium">✓ Image loaded ready to save</p>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-300 font-medium">Tap to upload from Gallery or take Photo</p>
                      <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2 text-sm mt-4"
          >
            <span>{loading ? 'Saving to Database...' : `Save ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
