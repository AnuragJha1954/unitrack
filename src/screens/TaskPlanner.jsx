import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import ProjectsCardList from '../components/common/ProjectsCardList';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  LayoutGrid,
  ListTodo
} from 'lucide-react';

export default function TaskPlanner({ onOpenQuickAdd }) {
  const { user, tasks, refreshAll } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [carryOverMessage, setCarryOverMessage] = useState('');
  const [activeView, setActiveView] = useState('projects'); // 'projects' | 'planner'

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

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
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
      setCarryOverMessage(`Migrated ${movedCount} unfinished item(s) to ${tomorrowStr}!`);
      setTimeout(() => setCarryOverMessage(''), 4000);
    } else {
      setCarryOverMessage('No unfinished items found to migrate for this date.');
      setTimeout(() => setCarryOverMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-28 px-4 max-w-6xl mx-auto pt-4 animate-fade-in font-sans">
      {/* Top Banner & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121214] border border-[#27272a] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-white flex items-center gap-2">
              <span>Projects & Action Items</span>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono border border-purple-500/20">
                KANBAN & LIST
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Linear-inspired high-speed action item tracking and project budgeting in Indian Rupees (₹).
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-center shrink-0">
          <div className="flex items-center bg-[#18181b] p-1 rounded-xl border border-[#27272a]">
            {[
              { id: 'projects', label: 'Kanban Projects Board', icon: LayoutGrid },
              { id: 'planner', label: 'Daily Action Checklist', icon: ListTodo }
            ].map((v) => {
              const Icon = v.icon;
              const isActive = activeView === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all interactive-element ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm border border-purple-400'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onOpenQuickAdd}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold rounded-xl shadow-sm interactive-element flex items-center gap-1 text-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.75]" />
            <span className="font-['Outfit']">New Project / Task</span>
          </button>
        </div>
      </div>

      {carryOverMessage && (
        <div className="p-3.5 rounded-xl bg-[#18181b] border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-sm">
          <span>✨ {carryOverMessage}</span>
        </div>
      )}

      {/* VIEW 1: PROJECTS BOARD */}
      {activeView === 'projects' && (
        <ProjectsCardList
          items={tasks}
          onOpenQuickAdd={onOpenQuickAdd}
          onSelectItem={handleToggle}
          title="SaaS Projects & Modules"
        />
      )}

      {/* VIEW 2: DAILY ACTION CHECKLIST */}
      {activeView === 'planner' && (
        <div className="space-y-6 animate-fade-in">
          {/* Date Selector Banner */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Selected Date: <strong className="text-white font-mono">{selectedDate}</strong></span>
              </span>
              <div className="flex items-center space-x-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#18181b] border border-[#27272a] rounded-lg px-2.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  onClick={handleCarryOver}
                  className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-xs rounded-lg active:scale-95 transition-all flex items-center gap-1.5"
                  title="Carry over unfinished tasks to tomorrow"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Migrate Unfinished →</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1">
              {datePills.map((p) => {
                const isSelected = p.iso === selectedDate;
                const hasTasks = tasks.some((t) => t.due_date === p.iso);
                return (
                  <button
                    key={p.iso}
                    onClick={() => setSelectedDate(p.iso)}
                    className={`flex flex-col items-center justify-center min-w-[56px] py-2.5 rounded-xl border interactive-element shrink-0 relative transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-zinc-950 font-extrabold border-emerald-400 shadow-sm scale-105'
                        : p.isToday
                        ? 'bg-[#18181b] text-emerald-400 border-emerald-500/40'
                        : 'bg-[#18181b] text-zinc-400 border-[#27272a] hover:border-zinc-500 hover:text-zinc-100'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold">{p.dayName}</span>
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

          {/* Pending Tasks Queue */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#27272a]">
              <h3 className="font-bold text-sm text-white font-['Outfit'] flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-purple-400" />
                <span>Pending Action Items ({pendingTasks.length})</span>
              </h3>
              {pendingTasks.length > 0 && <span className="text-xs text-zinc-500 font-mono">Click item to toggle status</span>}
            </div>

            {pendingTasks.length === 0 ? (
              <div className="py-10 text-center text-zinc-500 text-xs">
                No pending action items for this date. Tap '+ New Project / Task' above to start!
              </div>
            ) : (
              <div className="divide-y divide-[#1f1f24]">
                {pendingTasks.map((task) => {
                  const priorityColors = {
                    high: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
                    medium: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                    low: 'bg-[#18181b] border-[#27272a] text-zinc-400'
                  };
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggle(task)}
                      className="py-3 flex items-center justify-between saas-row px-2 rounded-lg cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden flex-1">
                        <Circle className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors shrink-0" />
                        <div className="overflow-hidden flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-zinc-100 text-sm truncate">{task.title}</h4>
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${priorityColors[task.priority] || priorityColors.medium}`}>
                              {task.priority || 'medium'}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{task.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        {task.project && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-zinc-300">
                            {task.project}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDelete(task.id, e)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors rounded-md hover:bg-[#18181b]"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Completed Section */}
            {completedTasks.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#27272a] space-y-2">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  Completed ({completedTasks.length})
                </h3>
                <div className="divide-y divide-[#1f1f24]">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggle(task)}
                      className="py-2.5 flex items-center justify-between saas-row px-2 rounded-lg cursor-pointer opacity-60 hover:opacity-100 transition-all"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden flex-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-sm font-medium task-strikethrough text-zinc-400 truncate">
                          {task.title}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleDelete(task.id, e)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-md transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
