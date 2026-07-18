import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import {
  Utensils,
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
  const { user, dietPlans, refreshAll } = useAuth();
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
    <div className="space-y-6 pb-24 px-4 max-w-4xl mx-auto pt-2 animate-fade-in">
      {/* Module Header */}
      <div className="glass-card rounded-3xl p-5 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-['Outfit'] text-white">Diet Plan & Macro Viewer</h2>
            <p className="text-xs text-slate-400">Upload and carry your nutritionist diet schedules anywhere offline.</p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg neon-glow-cyan hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{showUploadForm ? 'Close Upload Form' : 'Upload Diet Plan'}</span>
        </button>
      </div>

      {/* Upload Form Section */}
      {showUploadForm && (
        <form onSubmit={handleUploadSubmit} className="glass-card bg-slate-900/95 rounded-3xl p-5 border border-cyan-500/50 space-y-4 animate-fade-in">
          <h3 className="font-bold text-sm text-cyan-400 font-['Outfit'] flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload New Diet Chart / Macro Table
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Plan Title</label>
              <input
                type="text"
                placeholder="e.g. Summer Shred Macro Schedule v3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Effective Date</label>
              <input
                type="date"
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1.5">Select Image from Android Camera / Photo Gallery *</label>
            <div className="border-2 border-dashed border-cyan-500/40 rounded-2xl p-6 text-center bg-slate-900/60 hover:bg-slate-900/90 transition-all relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {imageBase64 ? (
                <div className="space-y-3">
                  <img src={imageBase64} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain border border-white/10 shadow-lg" />
                  <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/40">
                    ✓ Image Selected & Ready
                  </span>
                </div>
              ) : (
                <div className="py-6 space-y-2">
                  <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                    <Camera className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Tap to Take Photo or Choose from Gallery</h4>
                  <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP, SVG diet sheets</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center space-x-2 text-xs text-slate-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-white/20 text-cyan-500 focus:ring-0"
              />
              <span>Set immediately as Active Diet Plan</span>
            </label>

            <button
              type="submit"
              disabled={loading || !imageBase64}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save & Store Diet Plan'}
            </button>
          </div>
        </form>
      )}

      {/* ACTIVE DIET PLAN HERO DISPLAY */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" /> Currently Active Diet Plan
        </h3>

        {activePlan ? (
          <div className="glass-card rounded-3xl p-5 border border-cyan-500/40 relative overflow-hidden group shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase font-mono mb-1">
                  Active Macro Schedule
                </span>
                <h3 className="text-xl font-extrabold font-['Outfit'] text-white">{activePlan.title}</h3>
                <p className="text-xs text-slate-400">Uploaded on: {activePlan.upload_date}</p>
              </div>

              <button
                onClick={() => setSelectedImage(activePlan.image_data)}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs rounded-xl hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full-Screen Zoom</span>
              </button>
            </div>

            {/* Diet Image Box */}
            <div
              onClick={() => setSelectedImage(activePlan.image_data)}
              className="w-full max-h-[500px] rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center cursor-pointer relative group/view"
            >
              <img src={activePlan.image_data} alt={activePlan.title} className="w-full h-auto object-contain max-h-[500px]" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/view:opacity-100 flex flex-col items-center justify-center transition-all">
                <Maximize2 className="w-10 h-10 text-white mb-2" />
                <span className="text-xs font-bold text-white bg-black/80 px-4 py-2 rounded-full border border-white/20">
                  Click / Tap to Open Full Zoomable Viewer
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-10 text-center text-slate-400 text-xs border border-dashed border-white/10">
            No active diet plan found. Tap '+ Upload Diet Plan' above to store your nutritionist sheet!
          </div>
        )}
      </div>

      {/* VERSION HISTORY LIST */}
      {dietPlans.length > 1 && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-cyan-400" /> Past Diet Plan Versions ({dietPlans.length - 1})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dietPlans.map((plan) => {
              if (plan.is_active) return null;
              return (
                <div
                  key={plan.id}
                  className="glass-card rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-3 hover:border-white/15 transition-all"
                >
                  <div
                    onClick={() => setSelectedImage(plan.image_data)}
                    className="flex items-center space-x-3 overflow-hidden flex-1 cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden border border-white/10 shrink-0 relative flex items-center justify-center">
                      <img src={plan.image_data} alt="thumb" className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-white text-sm truncate">{plan.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Uploaded: {plan.upload_date}</p>
                      <span className="text-[10px] text-cyan-400 flex items-center gap-1 mt-1">
                        <Eye className="w-3 h-3" /> Tap to view
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 shrink-0">
                    <button
                      onClick={() => handleSetActive(plan.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] hover:bg-emerald-500/25 transition-all"
                    >
                      Set Active
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/95 backdrop-blur-lg animate-fade-in cursor-zoom-out"
        >
          <div className="relative max-w-4xl w-full max-h-[95vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-2 px-4 py-2 bg-slate-800 border border-white/20 rounded-full text-white font-bold text-xs flex items-center gap-1.5 shadow-xl hover:bg-slate-700"
            >
              <X className="w-4 h-4" /> Close Viewer
            </button>
            <div className="overflow-auto max-h-[85vh] w-full rounded-2xl border border-cyan-500/40 bg-[#0b0f19] p-2 flex items-center justify-center shadow-2xl">
              <img src={selectedImage} alt="Diet Full Viewer" className="max-w-full max-h-[82vh] object-contain rounded-xl" />
            </div>
            <p className="text-xs text-slate-400 mt-3 font-mono">Pinch to zoom / Drag to pan on mobile screen</p>
          </div>
        </div>
      )}
    </div>
  );
}
