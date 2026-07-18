import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import {
  Wallet,
  CheckSquare,
  Dumbbell,
  Utensils,
  ArrowRight,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ChevronRight,
  Eye
} from 'lucide-react';

export default function HomeDashboard({ onOpenQuickAdd }) {
  const {
    user,
    transactions,
    subscriptions,
    tasks,
    workouts,
    dietPlans,
    setActiveTab,
    refreshAll
  } = useAuth();

  const [selectedDietImg, setSelectedDietImg] = useState(null);

  // Calculate Finance Stats
  const now = new Date();
  const currentMonthPrefix = now.toISOString().slice(0, 7);
  const monthExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthPrefix))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  // Upcoming subscriptions within 5 days
  const todayStr = now.toISOString().split('T')[0];
  const upcomingSubs = subscriptions.filter((s) => {
    const diffTime = new Date(s.next_due_date) - new Date(todayStr);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 5;
  });

  // Calculate Task Stats (Today's Tasks)
  const todayTasks = tasks.filter((t) => t.due_date === todayStr);
  const completedTasksCount = todayTasks.filter((t) => t.completed).length;
  const taskProgress = todayTasks.length > 0 ? Math.round((completedTasksCount / todayTasks.length) * 100) : 0;

  // Last Workout Stat
  const lastWorkout = workouts.length > 0 ? workouts[0] : null;

  // Active Diet Plan
  const activeDietPlan = dietPlans.find((p) => p.is_active) || (dietPlans.length > 0 ? dietPlans[0] : null);

  const handleQuickToggleTask = async (task, e) => {
    e.stopPropagation();
    await dbService.toggleTask(task.id, !task.completed);
    await refreshAll();
  };

  return (
    <div className="space-y-5 pb-24 px-4 max-w-4xl mx-auto pt-4 animate-fade-in">
      {/* Minimalist Hero Welcome Card */}
      <div className="glass-card rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-zinc-100 tracking-tight">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Admin'} 👋
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Your daily overview across expenses, tasks, workouts & diet.
          </p>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-2xl shadow-sm interactive-element flex items-center justify-center space-x-2 sm:self-start shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Quick Log</span>
        </button>
      </div>

      {/* Module Summary Grid (2x2 on Desktop / Stacked on Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MODULE 1: FINANCE SUMMARY CARD */}
        <div
          onClick={() => setActiveTab('finance')}
          className="glass-card glass-card-hover rounded-3xl p-5 flex flex-col justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-100 font-['Outfit'] group-hover:text-emerald-400 transition-colors">
                    Finance Tracker
                  </h3>
                  <p className="text-[11px] text-zinc-400">This Month's Spending</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="flex items-baseline space-x-2 my-3">
              <span className="text-3xl font-extrabold font-mono text-zinc-100 tracking-tight">
                ₹{monthExpenses.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-400">spent in {now.toLocaleDateString('en-US', { month: 'short' })}</span>
            </div>

            {/* Upcoming Subscription Renewal Alert Pill */}
            {upcomingSubs.length > 0 ? (
              <div className="mt-3 p-2.5 rounded-xl bg-[#18181b] border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-300 animate-pulse-subtle">
                <AlertTriangle className="w-4 h-4 shrink-0 text-emerald-400" />
                <div className="flex-1 overflow-hidden">
                  <span className="font-bold">{upcomingSubs[0].name}</span> due in{' '}
                  <span className="font-mono font-bold text-zinc-100">
                    {Math.ceil((new Date(upcomingSubs[0].next_due_date) - new Date(todayStr)) / (1000 * 60 * 60 * 24))}d
                  </span>{' '}
                  (₹{parseFloat(upcomingSubs[0].amount).toFixed(2)})
                </div>
              </div>
            ) : (
              <div className="mt-3 p-2 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center space-x-2 text-xs text-zinc-400">
                <span>All subscriptions up to date</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>View transactions & charts</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* MODULE 2: TASK & TO-DO SUMMARY CARD */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="glass-card glass-card-hover rounded-3xl p-5 flex flex-col justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-100 font-['Outfit'] group-hover:text-emerald-400 transition-colors">
                    Task Planner
                  </h3>
                  <p className="text-[11px] text-zinc-400">Today's Priorities</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="space-y-1.5 my-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-300">
                  {completedTasksCount} of {todayTasks.length} done today
                </span>
                <span className="text-emerald-400 font-mono">{taskProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#18181b] overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>
            </div>

            <div className="mt-3 space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {todayTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={(e) => handleQuickToggleTask(task, e)}
                  className="flex items-center justify-between bg-[#18181b] hover:bg-[#27272a] p-2 rounded-xl border border-[#27272a] transition-all text-xs"
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <button
                      type="button"
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                        task.completed ? 'bg-emerald-500 border-emerald-500 text-zinc-950 scale-105' : 'border-zinc-500'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-3 h-3 stroke-[3] animate-scale-in" />}
                    </button>
                    <span className={`truncate ${task.completed ? 'task-strikethrough' : 'text-zinc-200 font-medium'}`}>
                      {task.title}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                      task.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#27272a] text-zinc-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
              {todayTasks.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-3">No tasks scheduled for today. Tap to add!</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>Open Calendar & Carry-Over</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* MODULE 3: GYM / EXERCISE SUMMARY CARD */}
        <div
          onClick={() => setActiveTab('gym')}
          className="glass-card glass-card-hover rounded-3xl p-5 flex flex-col justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-100 font-['Outfit'] group-hover:text-emerald-400 transition-colors">
                    Gym Tracker
                  </h3>
                  <p className="text-[11px] text-zinc-400">Progressive Overload & Volume</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>

            {lastWorkout ? (
              <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-3 my-3 space-y-1.5 transition-all">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Last logged: {lastWorkout.date}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {lastWorkout.sets?.length || 0} sets
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <h4 className="font-bold text-zinc-100 text-sm truncate">{lastWorkout.exercise_name}</h4>
                  <span className="font-mono text-base font-extrabold text-zinc-100">
                    {lastWorkout.total_volume} kg vol
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 text-center text-xs text-zinc-400 my-3">
                No workouts logged yet. Start logging sets today!
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>Start Today's Session</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* MODULE 4: DIET PLAN SUMMARY CARD */}
        <div
          onClick={() => setActiveTab('diet')}
          className="glass-card glass-card-hover rounded-3xl p-5 flex flex-col justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-100 font-['Outfit'] group-hover:text-emerald-400 transition-colors">
                    Diet Plan Viewer
                  </h3>
                  <p className="text-[11px] text-zinc-400">Active Macro Chart & Schedule</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>

            {activeDietPlan ? (
              <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-3 my-3 flex items-center space-x-3 transition-all">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDietImg(activeDietPlan.image_data);
                  }}
                  className="w-16 h-16 rounded-xl bg-[#121214] overflow-hidden border border-[#27272a] relative shrink-0 group/img flex items-center justify-center interactive-element"
                >
                  <img src={activeDietPlan.image_data} alt="Diet Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-5 h-5 text-white animate-scale-in" />
                  </div>
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="font-bold text-zinc-100 text-xs truncate">{activeDietPlan.title}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Uploaded: {activeDietPlan.upload_date}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    ✓ Active Plan
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 text-center text-xs text-zinc-400 my-3">
                No diet plan uploaded. Tap to upload chart photo!
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>View diet history & zoom</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Full-Screen Diet Image Zoom Modal when clicked from Home */}
      {selectedDietImg && (
        <div
          onClick={() => setSelectedDietImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 cursor-zoom-out animate-fade-in"
        >
          <div className="max-w-2xl max-h-[90vh] overflow-auto rounded-3xl border border-[#27272a] bg-[#121214] p-2 relative shadow-2xl animate-scale-in">
            <img src={selectedDietImg} alt="Full Diet Plan" className="w-full h-auto rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
