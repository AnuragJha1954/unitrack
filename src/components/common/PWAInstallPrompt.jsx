import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone display mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check local storage to see if user dismissed it recently
      const dismissed = localStorage.getItem('unitrack_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('unitrack_pwa_dismissed', 'true');
  };

  if (isInstalled || !showBanner || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 animate-bounce-once font-sans">
      <div className="bg-[#0e0e11] border border-emerald-500/30 rounded-3xl p-4 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)] flex items-center justify-between gap-3 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />

        <div className="flex items-center space-x-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <img src="/logo.png" alt="UNItrack Logo" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white font-['Outfit'] tracking-tight">
              Install App
            </h4>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">Native Android Experience</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 relative z-10">
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-emerald-500 text-zinc-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-emerald-400 active:scale-95 transition-all flex items-center space-x-1.5 uppercase font-mono tracking-wider"
          >
            <Download className="w-3.5 h-3.5 stroke-[3]" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-zinc-500 hover:text-white transition-all rounded-lg hover:bg-white/[0.05]"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
