import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import {
  Dumbbell,
  Utensils,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
  History,
  Activity
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function GymTracker() {
  const { user, workouts, refreshAll, setActiveTab } = useAuth();
  const [subTab, setSubTab] = useState('log'); // 'log', 'progress', 'history'

  // Log form state
  const [exerciseName, setExerciseName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [sets, setSets] = useState([
    { reps: '', weight: '' }
  ]);

  // Progress chart selected exercise
  const uniqueExercises = Array.from(new Set(workouts.map((w) => w.exercise_name))).filter(Boolean);
  const [chartExercise, setChartExercise] = useState(uniqueExercises[0] || '');

  // History card expansion state
  const [expandedWorkouts, setExpandedWorkouts] = useState({});

  const commonExercises = [
    'Bench Press',
    'Barbell Squat',
    'Deadlift',
    'Overhead Press',
    'Pull-ups',
    'Barbell Row',
    'Lat Pulldown',
    'Incline Dumbbell Press',
    'Bicep Curls'
  ];

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

  const liveVolume = sets.reduce((sum, s) => sum + (parseFloat(s.reps || 0) * parseFloat(s.weight || 0)), 0);

  const handleSubmitWorkout = async (e) => {
    e.preventDefault();
    if (!user || !exerciseName || sets.length === 0) return;
    await dbService.logWorkout({
      userId: user.id,
      date: workoutDate,
      exerciseName,
      sets
    });
    setSubTab('progress');
    setChartExercise(exerciseName);
    await refreshAll();
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Delete this workout session?')) return;
    await dbService.deleteWorkout(id);
    await refreshAll();
  };

  const toggleExpand = (id) => {
    setExpandedWorkouts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Chart data setup
  const exerciseWorkouts = workouts
    .filter((w) => w.exercise_name.toLowerCase() === chartExercise.toLowerCase())
    .sort((a, b) => a.date.localeCompare(b.date));

  const chartLabels = exerciseWorkouts.map((w) => w.date);
  const chartVolumes = exerciseWorkouts.map((w) => parseFloat(w.total_volume || 0));

  const maxVolume = chartVolumes.length > 0 ? Math.max(...chartVolumes) : 0;
  const totalSessions = exerciseWorkouts.length;

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: `${chartExercise} Total Volume (kg)`,
        data: chartVolumes,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderWidth: 3,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#0b0f19',
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.3
      }
    ]
  };

  const lineChartOptions = {
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

  return (
    <div className="space-y-5 pb-28 px-4 max-w-4xl mx-auto pt-2 animate-fade-in font-sans">
      {/* Top Switcher between Gym and Diet */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-1.5 bg-[#121214] p-1.5 rounded-xl border border-[#27272a] shadow-sm">
          <button
            onClick={() => {}}
            className="px-4 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-500 text-zinc-950 flex items-center gap-1.5 shadow-sm"
          >
            <Dumbbell className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Gym Workouts</span>
          </button>
          <button
            onClick={() => setActiveTab('diet')}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 interactive-element"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Diet & Macro Storage</span>
          </button>
        </div>
      </div>

      {/* Module Banner */}
      <div className="bg-[#111827] rounded-3xl p-5 border border-[#1f2937] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-['Outfit'] text-white">Gym & Exercise Tracker</h2>
            <p className="text-xs text-slate-400">Log workout sets, auto-calculate volume, and visualize progressive overload.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900 p-2.5 rounded-2xl border border-[#1f2937] shrink-0">
          <Award className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-[10px] text-slate-400 block font-medium uppercase">Total Sessions</span>
            <span className="text-sm font-mono font-bold text-white">{workouts.length} Workouts Logged</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex bg-[#18181b] p-1.5 rounded-2xl border border-[#27272a] max-w-md mx-auto">
        {[
          { id: 'log', label: 'Log Workout', icon: Plus },
          { id: 'progress', label: 'Progress Chart', icon: TrendingUp },
          { id: 'history', label: 'History', icon: History }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 interactive-element ${
                isActive ? 'bg-emerald-500 text-zinc-950 shadow-sm font-bold' : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: LOG WORKOUT */}
      {subTab === 'log' && (
        <form onSubmit={handleSubmitWorkout} className="glass-card rounded-3xl p-5 border border-white/10 space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Exercise Name *</label>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Bench Press, Squats, Pull-ups"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-base font-bold text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex flex-wrap gap-1.5">
                  {commonExercises.slice(0, 5).map((name) => (
                    <button
                      type="button"
                      key={name}
                      onClick={() => setExerciseName(name)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium interactive-element ${
                        exerciseName === name
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold'
                          : 'bg-[#18181b] text-zinc-400 border border-[#27272a] hover:text-zinc-100'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Workout Date</label>
              <input
                type="date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Sets Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-400" />
                Sets (Reps × Weight)
              </span>
              <button
                type="button"
                onClick={handleAddSet}
                className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl hover:bg-emerald-500/30 interactive-element flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Set</span>
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {sets.map((s, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-[#18181b] p-3 rounded-2xl border border-[#27272a]">
                  <span className="w-8 h-8 rounded-xl bg-[#121214] border border-[#27272a] flex items-center justify-center font-mono font-bold text-xs text-emerald-400 shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 flex items-center space-x-2">
                    <span className="text-xs text-zinc-400">Reps:</span>
                    <input
                      type="number"
                      value={s.reps}
                      onChange={(e) => handleUpdateSet(idx, 'reps', e.target.value)}
                      className="w-full bg-[#121214] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-center font-mono font-bold text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex-1 flex items-center space-x-2">
                    <span className="text-xs text-zinc-400">Weight (kg):</span>
                    <input
                      type="number"
                      step="0.5"
                      value={s.weight}
                      onChange={(e) => handleUpdateSet(idx, 'weight', e.target.value)}
                      className="w-full bg-[#121214] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-center font-mono font-bold text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  {sets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSet(idx)}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Auto-calculated Total Volume Preview */}
            <div className="bg-[#18181b] rounded-2xl p-4 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="text-xs text-zinc-300 font-medium">Calculated Session Volume:</span>
              </div>
              <span className="text-xl font-mono font-extrabold text-emerald-400">
                {liveVolume.toLocaleString()} kg
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold rounded-2xl shadow-sm interactive-element text-sm flex items-center justify-center space-x-2"
          >
            <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            <span>Save Workout Session</span>
          </button>
        </form>
      )}

      {/* SUB-TAB 2: PROGRESS CHART */}
      {subTab === 'progress' && (
        <div className="space-y-4 animate-fade-in">
          {/* Exercise Selector */}
          <div className="glass-card rounded-2xl p-4 border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Select Exercise to Visualize Overload:
            </span>
            <select
              value={chartExercise}
              onChange={(e) => setChartExercise(e.target.value)}
              className="bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            >
              {uniqueExercises.length === 0 ? (
                <option value="">No exercises logged yet</option>
              ) : (
                uniqueExercises.map((ex) => (
                  <option key={ex} value={ex}>{ex}</option>
                ))
              )}
            </select>
          </div>

          {/* Stats Summary row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-2xl p-4 border border-[#27272a] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Personal Best Volume</span>
                <h4 className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">{maxVolume.toLocaleString()} kg</h4>
              </div>
              <Award className="w-8 h-8 text-emerald-400/30" />
            </div>
            <div className="glass-card rounded-2xl p-4 border border-[#27272a] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Sessions Logged</span>
                <h4 className="text-xl font-mono font-extrabold text-zinc-100 mt-0.5">{uniqueExercises.length > 0 ? workouts.filter(w => w.exercise_name === chartExercise).length : 0} sessions</h4>
              </div>
              <Activity className="w-8 h-8 text-zinc-500/30" />
            </div>
          </div>

          {/* Line Chart Card */}
          <div className="glass-card rounded-3xl p-5 border border-white/10">
            <h3 className="font-bold text-sm text-white font-['Outfit'] mb-4 flex items-center justify-between">
              <span>Progressive Overload Curve ({chartExercise})</span>
              <span className="text-xs text-slate-400 font-normal">Volume across chronological sessions</span>
            </h3>

            <div className="h-72 relative">
              {exerciseWorkouts.length > 0 ? (
                <Line data={lineChartData} options={lineChartOptions} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 space-y-2">
                  <Activity className="w-8 h-8 text-slate-600" />
                  <span>No sessions logged yet for "{chartExercise}". Log a session to see the overload curve!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WORKOUT HISTORY */}
      {subTab === 'history' && (
        <div className="space-y-3 animate-fade-in">
          {workouts.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-xs">
              No workout sessions recorded. Tap 'Log Workout' to start saving your gym history!
            </div>
          ) : (
            workouts.map((w) => {
              const isExpanded = expandedWorkouts[w.id];
              return (
                <div
                  key={w.id}
                  className="glass-card glass-card-hover rounded-2xl border border-[#27272a] overflow-hidden transition-all"
                >
                  <div
                    onClick={() => toggleExpand(w.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#18181b] transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-emerald-400 font-bold font-mono text-xs">
                        {w.sets?.length || 3}s
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-zinc-100 text-base font-['Outfit']">{w.exercise_name}</h4>
                          <span className="text-[10px] text-zinc-400 font-mono">{w.date}</span>
                        </div>
                        <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                          Total Vol: {w.total_volume} kg
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkout(w.id);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-xl transition-all"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button type="button" className="p-1 text-zinc-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Sets Detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-[#18181b] border-t border-[#27272a] space-y-2 animate-fade-in">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Set Breakdown:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {w.sets && w.sets.map((set, i) => (
                          <div key={i} className="bg-[#121214] p-2.5 rounded-xl border border-[#27272a] text-center">
                            <span className="text-[10px] text-zinc-400 block font-mono">Set #{set.set_number || i + 1}</span>
                            <span className="text-xs font-mono font-bold text-zinc-100">
                              {set.reps} reps × {set.weight} kg
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
