import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, LogIn, UserPlus, Sparkles, ShieldCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { user, login, signup, logout } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        if (!name || !email) return;
        await signup(name, email, password);
      } else {
        if (!email) return;
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSwitch = async () => {
    setLoading(true);
    try {
      await login('guest.tracker@unitrack.app', '');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-card bg-[#0b0f19]/95 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-lg neon-glow-cyan">
            <span className="font-extrabold text-2xl text-[#0b0f19] font-['Outfit']">U</span>
          </div>
          <h3 className="text-xl font-bold font-['Outfit'] text-white">
            {user ? 'Account Status' : isSignUp ? 'Create Account' : 'Welcome to UNItrack'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {user
              ? 'Your data is secured and synced across your devices.'
              : 'Sign in to sync your personal tasks, workouts, and finances.'}
          </p>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-lg font-bold text-white shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'G'}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-white text-sm truncate">{user.name || 'Demo User'}</h4>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Active Session</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full py-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold rounded-xl text-xs hover:bg-rose-500/30 transition-all"
            >
              Log Out & Switch to Guest
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium">{error}</div>}

            {isSignUp && (
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Password (Optional for Demo)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition-all text-sm mt-2 flex items-center justify-center gap-2"
            >
              {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>{loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}</span>
            </button>

            <div className="pt-2 border-t border-white/10 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleDemoSwitch}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Continue instantly as Demo User
              </button>

              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
