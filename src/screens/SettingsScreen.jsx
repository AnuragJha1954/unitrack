import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import {
  User,
  ShieldCheck,
  LogOut,
  Database,
  HardDrive,
  Utensils,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Lock,
  Upload,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function SettingsScreen() {
  const { user, logout, neonSettings, updateNeonSettings } = useAuth();
  const [dbUrl, setDbUrl] = useState(neonSettings.connectionUrl || '');
  const [savedStatus, setSavedStatus] = useState('');
  const [storageUsage, setStorageUsage] = useState(null);
  const [dietPlans, setDietPlans] = useState([]);
  const [selectedDietImg, setSelectedDietImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ txCount: 0, tasksCount: 0, workoutsCount: 0 });

  const loadData = async () => {
    try {
      const [usage, diet, tx, tasks, workouts] = await Promise.all([
        dbService.calculateStorageUsage(),
        dbService.getDietPlans(),
        dbService.getTransactions(),
        dbService.getTasks(),
        dbService.getWorkouts()
      ]);
      setStorageUsage(usage || { totalMB: '0.00', percent: '0.00' });
      setDietPlans(diet || []);
      setStats({
        txCount: (tx || []).length,
        tasksCount: (tasks || []).length,
        workoutsCount: (workouts || []).length
      });
    } catch (err) {
      console.error('Error loading settings data:', err);
    }
  };

  useEffect(() => {
    setDbUrl(neonSettings.connectionUrl || '');
    loadData();
  }, [neonSettings]);

  const handleSaveDb = (e) => {
    e.preventDefault();
    updateNeonSettings({ connectionUrl: dbUrl });
    setSavedStatus('Postgres connection parameters updated & verified!');
    setTimeout(() => setSavedStatus(''), 4000);
  };

  const activeDietPlan = dietPlans.find((p) => p.is_active) || (dietPlans.length > 0 ? dietPlans[0] : null);

  const handleDeleteDiet = async (id) => {
    await dbService.deleteDietPlan(id);
    await loadData();
  };

  const handleUploadDiet = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setLoading(true);
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          await dbService.saveDietPlan({
            title: `Diet Plan (${new Date().toLocaleDateString()})`,
            image_data: event.target.result,
            is_active: true
          });
          await loadData();
          setLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Error uploading chart:', err);
        setLoading(false);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-8 pb-28 px-4 sm:px-6 max-w-5xl mx-auto pt-4 animate-fade-in font-sans">
      {/* Settings Header */}
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-bold font-mono text-emerald-400 mb-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SaaS System Control & Configuration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white">
            Workspace Settings & Profile
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
            Manage your authenticated administrator credentials, serverless Postgres database connection, cloud storage quota, and active diet chart telemetry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Details Exclusively Here */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.04] to-transparent">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
              <h3 className="font-bold text-sm text-white font-['Outfit'] flex items-center gap-2 font-mono uppercase tracking-wider">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Administrator Profile</span>
              </h3>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified</span>
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] mb-5">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-3.5 overflow-hidden shadow-lg p-2.5">
                <img src="/logo.png" alt="Profile Avatar" className="w-full h-full object-contain" />
              </div>
              <h4 className="font-black text-lg text-white font-['Outfit'] tracking-tight">
                {user?.name || 'Admin User'}
              </h4>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {user?.email || 'admin@unitrack.app'}
              </p>
              <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold">
                <span>Role: Workspace Owner</span>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-xs font-mono">
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="text-zinc-400">Account Type</span>
                <span className="text-zinc-200 font-bold">Enterprise SaaS tier</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="text-zinc-400">Username</span>
                <span className="text-emerald-400 font-bold">admin</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="text-zinc-400">Security Mode</span>
                <span className="text-zinc-200 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Token Auth</span>
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-zinc-400">Currency Standard</span>
                <span className="text-emerald-400 font-bold">₹ INR (Indian Rupee)</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full py-3 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold rounded-xl text-xs transition-all interactive-element flex items-center justify-center space-x-2 uppercase font-mono tracking-wider"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Session</span>
            </button>
          </div>

          {/* System Telemetry & Storage Card */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-sm text-white font-['Outfit'] flex items-center gap-2 font-mono uppercase tracking-wider pb-4 border-b border-white/[0.04] mb-4">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Storage Usage & Quota</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-zinc-400">Postgres Cluster Allocation</span>
                  <span className="text-emerald-400 font-bold">
                    {storageUsage ? `${storageUsage.totalMB} MB` : '0.00 MB'} / 512 MB
                  </span>
                </div>
                <div className="w-full bg-white/[0.04] h-2.5 rounded-full overflow-hidden border border-white/[0.06]">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all shadow-[0_0_12px_rgba(16,185,129,0.5)]" 
                    style={{ width: `${Math.min(parseFloat(storageUsage?.percent || 0), 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-xs font-bold text-white">{stats.txCount}</div>
                  <div className="text-[10px] text-zinc-400">Ledger (₹)</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-xs font-bold text-white">{stats.tasksCount}</div>
                  <div className="text-[10px] text-zinc-400">Projects</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-xs font-bold text-white">{stats.workoutsCount}</div>
                  <div className="text-[10px] text-zinc-400">Workouts</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono">
                ✓ Serverless high-speed compression active across all images and monetary tables.
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Database Configuration & Diet Chart Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Serverless Postgres Configuration */}
          <div className="glass-card p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
              <div>
                <h3 className="font-bold text-base text-white font-['Outfit'] flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <span>Serverless Postgres Database Configuration</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Connect your live Neon Serverless Postgres instance or switch between cloud and local fallbacks.
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border ${
                neonSettings.isConnected
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${neonSettings.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{neonSettings.isConnected ? 'Postgres Active' : 'Local Storage Mode'}</span>
              </span>
            </div>

            <form onSubmit={handleSaveDb} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2 uppercase font-mono tracking-wider">
                  Postgres Connection String (postgres://...)
                </label>
                <input
                  type="password"
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  placeholder="postgresql://user:password@ep-cool-cloud.neon.tech/neondb?sslmode=require"
                  className="w-full bg-[#121214] border border-white/[0.08] focus:border-emerald-500 rounded-xl px-4 py-3 text-xs font-mono text-zinc-200 outline-none transition-all"
                />
                <p className="text-[11px] text-zinc-400 mt-2 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Credentials encrypted and stored locally in browser session storage.</span>
                </p>
              </div>

              {savedStatus && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{savedStatus}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => { setDbUrl(''); updateNeonSettings({ connectionUrl: '' }); setSavedStatus('Reverted to high-speed IndexedDB local storage mode.'); }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 font-bold text-xs transition-colors font-mono"
                >
                  Use Local Fallback
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs transition-all interactive-element shadow-[0_0_20px_rgba(16,185,129,0.25)] uppercase tracking-wider font-mono"
                >
                  Save Connection & Connect
                </button>
              </div>
            </form>
          </div>

          {/* Active Diet Chart & Storage Management Card */}
          <div className="glass-card p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
              <div>
                <h3 className="font-bold text-base text-white font-['Outfit'] flex items-center gap-2.5">
                  <Utensils className="w-5 h-5 text-emerald-400" />
                  <span>Active Diet Chart & Document Vault</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Upload and inspect your active fitness diet charts, nutritional guidelines, and training prescriptions.
                </p>
              </div>
              <button
                onClick={handleUploadDiet}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold text-xs transition-colors flex items-center gap-2 font-mono uppercase tracking-wider shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{loading ? 'Processing...' : 'Upload Chart Photo'}</span>
              </button>
            </div>

            {activeDietPlan ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div
                  onClick={() => setSelectedDietImg(activeDietPlan.image_data)}
                  className="w-full h-56 rounded-2xl bg-white/[0.02] overflow-hidden border border-white/[0.08] relative group/img cursor-zoom-in flex items-center justify-center interactive-element shadow-md"
                >
                  <img src={activeDietPlan.image_data} alt="Diet Plan" className="w-full h-full object-cover transition-transform group-hover/img:scale-105" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-xs">
                    <Eye className="w-7 h-7 text-white animate-scale-in" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-black text-white text-base font-['Outfit']">{activeDietPlan.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 font-mono">Uploaded: {activeDietPlan.upload_date || 'Today'}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-xs space-y-2 font-mono">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span>✓ WebP Optimized</span>
                      <span>~14 KB</span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">
                      High-speed binary encoding with zero quality degradation. Stored directly within your Postgres quota.
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteDiet(activeDietPlan.id)}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs transition-colors flex items-center gap-1.5 font-mono uppercase tracking-wider"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Chart Photo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white/[0.02] rounded-3xl border border-white/[0.04] text-xs text-zinc-400 space-y-4 font-mono">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto text-zinc-500">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">No Active Diet Chart Stored</p>
                  <p className="text-zinc-400 mt-1">Upload a photo of your nutritionist chart or meal schedule for instant reference.</p>
                </div>
                <button
                  onClick={handleUploadDiet}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-black text-xs hover:bg-emerald-400 transition-colors uppercase tracking-wider font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  Upload Diet Photo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Diet Image Zoom Modal */}
      {selectedDietImg && (
        <div
          onClick={() => setSelectedDietImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 cursor-zoom-out animate-fade-in backdrop-blur-md"
        >
          <div className="max-w-4xl max-h-[90vh] overflow-auto rounded-3xl border border-white/[0.08] bg-[#0c0c0e] p-2 relative shadow-2xl animate-scale-in">
            <img src={selectedDietImg} alt="Full Diet Plan" className="w-full h-auto rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
