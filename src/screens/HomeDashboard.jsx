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
  Flame,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
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
  const pendingTasks = todayTasks.filter((t) => !t.completed);
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
    <div className="space-y-5 pb-24 px-4 max-w-4xl mx-auto pt-2 animate-fade-in">
      {/* Hero Welcome Section */}
      <div className="glass-card bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-800/90 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-white">
              Welcome back, {user?.name ? user.name.split(' ')[0] : 'Champion'}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Here is your command summary across finances, tasks, workouts & diet today.
            </p>
          </div>

          <button
            onClick={onOpenQuickAdd}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg neon-glow-cyan hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2 sm:self-start shrink-0"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Quick Log</span>
          </button>
        </div>
      </div>

      {/* Module Summary Grid (2x2 on Desktop / Stacked on Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MODULE 1: FINANCE SUMMARY CARD */}
        <div
          onClick={() => setActiveTab('finance')}
          className="glass-card glass-card-hover rounded-3xl p-5 border border-white/10 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-125" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white font-['Outfit'] group-hover:text-emerald-400 transition-colors">
                    Finance Tracker
                  </h3>
                  <p className="text-[11px] text-slate-400">This Month's Spending</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="flex items-baseline space-x-2 my-2">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                ${monthExpenses.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">spent in {now.toLocaleDateString('en-US', { month: 'short' })}</span>
            </div>

            {/* Upcoming Subscription Renewal Alert Pill */}
            {upcomingSubs.length > 0 ? (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center space-x-2 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
                <div className="flex-1 overflow-hidden">
                  <span className="font-bold">{upcomingSubs[0].name}</span> renewal due in{' '}
                  <span className="font-mono font-bold text-white">
                    {Math.ceil((new Date(upcomingSubs[0].next_due_date) - new Date(todayStr)) / (1000 * 60 * 60 * 24))}d
                  </span>{' '}
                  (${parseFloat(upcomingSubs[0].amount).toFixed(2)})
                </div>
              </div>
            ) : (
              <div className="mt-3 p-2 rounded-xl bg-slate-800/60 border border-white/5 flex items-center space-x-2 text-xs text-slate-400">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>All subscriptions up to date</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>View transactions & charts</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* MODULE 2: TASK & TO-DO SUMMARY CARD */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="glass-card glass-card-hover rounded-3xl p-5 border border-white/10 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-125" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white font-['Outfit'] group-hover:text-purple-400 transition-colors">
                    Task Planner
                  </h3>
                  <p className="text-[11px] text-slate-400">Today's Priorities</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5 my-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">
                  {completedTasksCount} of {todayTasks.length} done today
                </span>
                <span className="text-purple-400 font-mono">{taskProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500 rounded-full"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>
            </div>

            {/* Quick Task List items */}
            <div className="mt-3 space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {todayTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={(e) => handleQuickToggleTask(task, e)}
                  className="flex items-center justify-between bg-slate-900/70 hover:bg-slate-800/80 p-2 rounded-xl border border-white/5 transition-all text-xs"
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <button
                      type="button"
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                        task.completed ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-slate-500'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span className={`truncate ${task.completed ? 'task-strikethrough' : 'text-slate-200 font-medium'}`}>
                      {task.title}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                      task.priority === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
              {todayTasks.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-3">No tasks scheduled for today. Tap to add!</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-purple-400 font-semibold">
            <span>Open Calendar & Carry-Over</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* MODULE 3: GYM / EXERCISE SUMMARY CARD */}
        <div
          onClick={() => setActiveTab('gym')}
          className="glass-card glass-card-hover rounded-3xl p-5 border border-white/10 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-125" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white font-['Outfit'] group-hover:text-amber-400 transition-colors">
                    Gym Tracker
                  </h3>
                  <p className="text-[11px] text-slate-400">Progressive Overload & Volume</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>

            {lastWorkout ? (
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3 my-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Last logged: {lastWorkout.date}
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    {lastWorkout.sets?.length || 3} sets
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <h4 className="font-bold text-white text-sm truncate">{lastWorkout.exercise_name}</h4>
                  <span className="font-mono text-base font-extrabold text-emerald-400">
                    {lastWorkout.total_volume} kg vol
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 text-center text-xs text-slate-400 my-2">
                No workouts logged yet. Start logging sets today!
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
              Start Today's Session
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* MODULE 4: DIET PLAN SUMMARY CARD */}
        <div
          onClick={() => setActiveTab('diet')}
          className="glass-card glass-card-hover rounded-3xl p-5 border border-white/10 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-125" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white font-['Outfit'] group-hover:text-cyan-400 transition-colors">
                    Diet Plan Viewer
                  </h3>
                  <p className="text-[11px] text-slate-400">Active Macro Chart & Schedule</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>

            {activeDietPlan ? (
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3 my-2 flex items-center space-x-3">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDietImg(activeDietPlan.image_data);
                  }}
                  className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden border border-cyan-500/40 relative shrink-0 group/img flex items-center justify-center"
                >
                  <img src={activeDietPlan.image_data} alt="Diet Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="font-bold text-white text-xs truncate">{activeDietPlan.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Uploaded: {activeDietPlan.upload_date}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                    ✓ Active Plan
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 text-center text-xs text-slate-400 my-2">
                No diet plan uploaded. Tap to upload chart photo!
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-cyan-400 font-semibold">
            <span>View diet history & zoom</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Full-Screen Diet Image Zoom Modal when clicked from Home */}
      {selectedDietImg && (
        <div
          onClick={() => setSelectedDietImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <div className="max-w-2xl max-h-[90vh] overflow-auto rounded-3xl border border-cyan-500/40 bg-[#0b0f19] p-2 relative shadow-2xl">
            <img src={selectedDietImg} alt="Full Diet Plan" className="w-full h-auto rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
