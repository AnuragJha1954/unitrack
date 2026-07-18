import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Flame,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function TaskPlanner({ onOpenQuickAdd }) {
  const { user, tasks, refreshAll } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [carryOverMessage, setCarryOverMessage] = useState('');

  // Generate date pills (-5 days to +10 days from today)
  const generateDatePills = () => {
    const pills = [];
    const base = new Date();
    for (let i = -5; i <= 10; i++) {
      const dt = new Date(base);
      dt.setDate(dt.getDate() + i);
      const iso = dt.toISOString().split('T')[0];
      pills.push({
        iso,
        dayName: dt.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: dt.getDate(),
        monthName: dt.toLocaleDateString('en-US', { month: 'short' }),
        isToday: iso === todayStr
      });
    }
    return pills;
  };

  const datePills = generateDatePills();

  // Filter tasks for selectedDate
  const dayTasks = tasks.filter((t) => t.due_date === selectedDate);
  const pendingTasks = dayTasks.filter((t) => !t.completed);
  const completedTasks = dayTasks.filter((t) => t.completed);

  const handleToggle = async (task) => {
    await dbService.toggleTask(task.id, !task.completed);
    await refreshAll();
  };

  const handleDelete = async (id) => {
    await dbService.deleteTask(id);
    await refreshAll();
  };

  const handleCarryOver = async () => {
    if (!user) return;
    const tomorrowDt = new Date(selectedDate);
    tomorrowDt.setDate(tomorrowDt.getDate() + 1);
    const tomorrowStr = tomorrowDt.toISOString().split('T')[0];

    const movedCount = await dbService.carryOverTasks(user.id, selectedDate, tomorrowStr);
    await refreshAll();
    if (movedCount > 0) {
      setCarryOverMessage(`Migrated ${movedCount} unfinished task(s) to ${tomorrowStr}!`);
      setTimeout(() => setCarryOverMessage(''), 4000);
    } else {
      setCarryOverMessage('No unfinished tasks found to migrate for this date.');
      setTimeout(() => setCarryOverMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-5 pb-24 px-4 max-w-4xl mx-auto pt-2 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#111827] rounded-3xl p-5 border border-[#1f2937] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-['Outfit'] text-white">Task & To-Do Planner</h2>
            <p className="text-xs text-slate-400">Manage daily goals, priorities, and carry over unfinished items.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCarryOver}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
            title="Carry over unfinished tasks to tomorrow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Carry Over Unfinished →</span>
          </button>
          <button
            onClick={onOpenQuickAdd}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl shadow-sm interactive-element flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {carryOverMessage && (
        <div className="p-3.5 rounded-2xl bg-[#18181b] border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span>✨ {carryOverMessage}</span>
        </div>
      )}

      {/* Horizontal Date Selector Pills */}
      <div className="glass-card rounded-3xl p-4 space-y-3 transition-all">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Selected Date: <strong className="text-zinc-100 font-mono">{selectedDate}</strong>
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#18181b] border border-[#27272a] rounded-xl px-2.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          {datePills.map((p) => {
            const isSelected = p.iso === selectedDate;
            const hasTasks = tasks.some((t) => t.due_date === p.iso);
            return (
              <button
                key={p.iso}
                onClick={() => setSelectedDate(p.iso)}
                className={`flex flex-col items-center justify-center min-w-[58px] py-2.5 rounded-2xl border interactive-element shrink-0 relative ${
                  isSelected
                    ? 'bg-emerald-500 text-zinc-950 font-bold border-emerald-400 shadow-sm scale-105'
                    : p.isToday
                    ? 'bg-[#18181b] text-emerald-400 border-emerald-500/40'
                    : 'bg-[#18181b] text-zinc-400 border-[#27272a] hover:border-zinc-500 hover:text-zinc-100'
                }`}
              >
                <span className="text-[10px] uppercase font-medium">{p.dayName}</span>
                <span className="text-base font-extrabold font-mono mt-0.5">{p.dayNum}</span>
                <span className="text-[9px] opacity-80">{p.monthName}</span>
                {hasTasks && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full absolute top-1.5 right-1.5 ${
                      isSelected ? 'bg-zinc-950' : 'bg-emerald-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300 flex items-center justify-between">
          <span>Pending Tasks ({pendingTasks.length})</span>
          {pendingTasks.length > 0 && <span className="text-xs font-normal text-zinc-400 font-mono">Tap to mark complete</span>}
        </h3>

        {pendingTasks.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-xs border border-dashed border-white/10">
            No pending tasks for this date. Tap '+ Add Task' above or select another day!
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingTasks.map((task) => {
              const priorityColors = {
                high: 'bg-red-500/15 border-red-500/30 text-red-400',
                medium: 'bg-[#18181b] border-[#27272a] text-zinc-300',
                low: 'bg-[#18181b] border-[#27272a] text-zinc-500'
              };
              return (
                <div
                  key={task.id}
                  onClick={() => handleToggle(task)}
                  className="glass-card glass-card-hover rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-start space-x-3 overflow-hidden flex-1">
                    <button
                      type="button"
                      className="mt-0.5 w-5 h-5 rounded-lg border border-zinc-600 hover:border-emerald-400 flex items-center justify-center shrink-0 transition-all text-zinc-400"
                    >
                      <Circle className="w-3 h-3" />
                    </button>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-zinc-100 text-sm truncate">{task.title}</h4>
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${priorityColors[task.priority] || priorityColors.medium}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{task.description}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(task.id);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all shrink-0"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <div className="pt-4 space-y-2.5 border-t border-[#27272a]">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
              Completed ({completedTasks.length})
            </h3>
            {completedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggle(task)}
                className="glass-card rounded-2xl p-3.5 bg-[#18181b] flex items-center justify-between gap-3 cursor-pointer opacity-70 hover:opacity-100 transition-all"
              >
                <div className="flex items-center space-x-3 overflow-hidden flex-1">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500 border border-emerald-500 flex items-center justify-center text-zinc-950 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-sm font-medium task-strikethrough text-zinc-400 truncate">
                    {task.title}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(task.id);
                  }}
                  className="p-1.5 text-zinc-500 hover:text-red-400 rounded-xl transition-all shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
