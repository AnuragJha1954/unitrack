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
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 animate-bounce-once">
      <div className="glass-card bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl neon-glow-cyan flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              Install UNItrack to Android
            </h4>
            <p className="text-xs text-slate-300">Get full-screen mobile app experience offline & fast access.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white transition-all"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
