import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import {
  Utensils,
  Dumbbell,
  Camera,
  Upload,
  Eye,
  CheckCircle2,
  Trash2,
  Calendar,
  Plus,
  Sparkles,
  Maximize2,
  X,
  History
} from 'lucide-react';

export default function DietViewer({ onOpenQuickAdd }) {
  const { user, dietPlans, refreshAll, setActiveTab } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Upload Form state
  const [title, setTitle] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const activePlan = dietPlans.find((p) => p.is_active) || (dietPlans.length > 0 ? dietPlans[0] : null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!user || !imageBase64) return;
    setLoading(true);
    try {
      await dbService.uploadDietPlan({
        userId: user.id,
        title: title || 'Diet Schedule ' + new Date().toLocaleDateString(),
        imageData: imageBase64,
        uploadDate,
        isActive
      });
      setTitle('');
      setImageBase64('');
      setShowUploadForm(false);
      await refreshAll();
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (id) => {
    if (!user) return;
    await dbService.setActiveDietPlan(id, user.id);
    await refreshAll();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this diet plan version?')) return;
    await dbService.deleteDietPlan(id);
    await refreshAll();
  };

  return (
    <div className="space-y-6 pb-28 px-4 max-w-4xl mx-auto pt-2 animate-fade-in font-sans">
      {/* Top Switcher between Gym and Diet - Floating Capsule */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-1 bg-white/[0.02] p-1.5 rounded-full border border-white/[0.05] shadow-inner">
          <button
            onClick={() => setActiveTab('gym')}
            className="px-5 py-2 rounded-full text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-2 interactive-element transition-all"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Gym Workouts</span>
          </button>
          <button
            onClick={() => {}}
            className="px-5 py-2 rounded-full text-xs font-bold bg-emerald-500 text-zinc-950 flex items-center gap-2 shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
          >
            <Utensils className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Diet & Macro Storage</span>
          </button>
        </div>
      </div>

      {/* Module Header */}
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] transition-all">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-zinc-100 tracking-tight">Diet Plan & Macro Viewer</h2>
            <p className="text-xs text-zinc-400 mt-1">Upload and access your nutritionist diet schedules anytime offline.</p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.25)] interactive-element flex items-center justify-center space-x-2 shrink-0 tracking-wider uppercase font-mono"
        >
          <Plus className="w-4 h-4 stroke-[2.75]" />
          <span>{showUploadForm ? 'Close Form' : 'Upload Diet Plan'}</span>
        </button>
      </div>

      {/* Upload Form Section */}
      {showUploadForm && (
        <form onSubmit={handleUploadSubmit} className="glass-card bg-white/[0.03] rounded-3xl p-6 border border-emerald-500/30 space-y-5 animate-fade-in">
          <h3 className="font-bold text-sm text-emerald-400 font-['Outfit'] flex items-center gap-2 uppercase tracking-wider font-mono">
            <Upload className="w-4 h-4" /> Upload New Diet Chart / Macro Table
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-300 font-bold block mb-1.5 font-mono uppercase tracking-wider">Plan Title</label>
              <input
                type="text"
                placeholder="e.g. Summer Shred Macro Schedule v3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50 font-sans transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-300 font-bold block mb-1.5 font-mono uppercase tracking-wider">Effective Date</label>
              <input
                type="date"
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50 font-sans transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-300 font-bold block mb-2 font-mono uppercase tracking-wider">Select Image from Camera / Gallery *</label>
            <div className="border border-dashed border-white/[0.1] rounded-3xl p-8 text-center bg-white/[0.01] hover:border-emerald-400/50 hover:bg-white/[0.02] transition-all relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {imageBase64 ? (
                <div className="space-y-3">
                  <img src={imageBase64} alt="Preview" className="max-h-48 mx-auto rounded-2xl object-contain border border-white/[0.08] shadow-lg animate-scale-in" />
                  <span className="inline-block px-3.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/40 font-mono">
                    ✓ Image Selected & Ready
                  </span>
                </div>
              ) : (
                <div className="py-6 space-y-2.5">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400 animate-pulse-subtle">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm text-zinc-100">Tap to Take Photo or Choose from Gallery</h4>
                  <p className="text-xs text-zinc-400 font-mono">Supports JPG, PNG, WEBP, SVG diet sheets</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <label className="flex items-center space-x-2.5 text-xs text-zinc-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded bg-white/[0.04] border-white/[0.1] text-emerald-500 focus:ring-0"
              />
              <span>Set immediately as Active Diet Plan</span>
            </label>

            <button
              type="submit"
              disabled={loading || !imageBase64}
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold rounded-2xl shadow-sm interactive-element text-xs disabled:opacity-50 uppercase font-mono tracking-wider"
            >
              {loading ? 'Saving...' : 'Save & Store Diet Plan'}
            </button>
          </div>
        </form>
      )}

      {/* ACTIVE DIET PLAN HERO DISPLAY */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" /> Currently Active Diet Plan
        </h3>

        {activePlan ? (
          <div className="glass-card glass-card-hover rounded-3xl p-6 border border-emerald-500/30 relative overflow-hidden group">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <div>
                <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase font-mono mb-1.5">
                  Active Macro Schedule
                </span>
                <h3 className="text-2xl font-black font-['Outfit'] text-white tracking-tight">{activePlan.title}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">Uploaded on: {activePlan.upload_date}</p>
              </div>

              <button
                onClick={() => setSelectedImage(activePlan.image_data)}
                className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-emerald-400 font-bold text-xs rounded-xl interactive-element flex items-center gap-2 shrink-0 font-mono"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full-Screen Zoom</span>
              </button>
            </div>

            {/* Diet Image Box */}
            <div
              onClick={() => setSelectedImage(activePlan.image_data)}
              className="w-full max-h-[520px] rounded-2xl overflow-hidden bg-white/[0.01] border border-white/[0.04] flex items-center justify-center cursor-pointer relative group/view"
            >
              <img src={activePlan.image_data} alt={activePlan.title} className="w-full h-auto object-contain max-h-[520px]" />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/view:opacity-100 flex flex-col items-center justify-center transition-all backdrop-blur-xs">
                <Maximize2 className="w-10 h-10 text-white mb-2 animate-scale-in" />
                <span className="text-xs font-bold text-white bg-black/80 px-4 py-2 rounded-full border border-white/20 font-mono">
                  Click / Tap to Open Full Zoomable Viewer
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-12 text-center text-zinc-400 text-xs border border-white/[0.04] font-mono">
            No active diet plan found. Tap '+ Upload Diet Plan' above to store your nutritionist sheet!
          </div>
        )}
      </div>

      {/* VERSION HISTORY LIST */}
      {dietPlans.length > 1 && (
        <div className="space-y-4 pt-6 border-t border-white/[0.04]">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" /> Past Diet Plan Versions ({dietPlans.length - 1})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dietPlans.map((plan) => {
              if (plan.is_active) return null;
              return (
                <div
                  key={plan.id}
                  className="glass-card glass-card-hover rounded-2xl p-4.5 border border-white/[0.04] flex items-center justify-between gap-3"
                >
                  <div
                    onClick={() => setSelectedImage(plan.image_data)}
                    className="flex items-center space-x-3.5 overflow-hidden flex-1 cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-xl bg-white/[0.02] overflow-hidden border border-white/[0.05] shrink-0 relative flex items-center justify-center">
                      <img src={plan.image_data} alt="thumb" className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-zinc-100 text-sm truncate">{plan.title}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Uploaded: {plan.upload_date}</p>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
                        <Eye className="w-3 h-3" /> Tap to view
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 shrink-0">
                    <button
                      onClick={() => handleSetActive(plan.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] interactive-element uppercase font-mono tracking-wider"
                    >
                      Set Active
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 rounded-lg hover:bg-white/[0.04]"
                      title="Delete version"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL-SCREEN ZOOM MODAL */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-xl animate-fade-in cursor-zoom-out"
        >
          <div className="relative max-w-4xl w-full max-h-[95vh] flex flex-col items-center justify-center animate-scale-in">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-2 px-4 py-2 bg-white/[0.06] border border-white/[0.1] rounded-full text-zinc-100 font-bold text-xs flex items-center gap-1.5 shadow-2xl interactive-element backdrop-blur-md"
            >
              <X className="w-4 h-4" /> Close Viewer
            </button>
            <div className="overflow-auto max-h-[85vh] w-full rounded-3xl border border-white/[0.08] bg-[#0c0c0e] p-2 flex items-center justify-center shadow-2xl">
              <img src={selectedImage} alt="Diet Full Viewer" className="max-w-full max-h-[82vh] object-contain rounded-2xl" />
            </div>
            <p className="text-xs text-zinc-400 mt-3 font-mono">Pinch to zoom / Drag to pan on mobile screen</p>
          </div>
        </div>
      )}
    </div>
  );
}
