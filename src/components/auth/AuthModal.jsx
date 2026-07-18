import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, LogIn, UserPlus, ShieldCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { user, login, signup, logout } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
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
        if (!name || !emailOrUsername) return;
        await signup(name, emailOrUsername, password);
      } else {
        if (!emailOrUsername) return;
        await login(emailOrUsername, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in">
      <div className="w-full max-w-md bg-[#111827] border border-[#1f2937] rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-3 text-slate-950 font-extrabold text-2xl font-['Outfit'] shadow-sm">
            U
          </div>
          <h3 className="text-xl font-bold font-['Outfit'] text-white">
            {user ? 'Account Status' : isSignUp ? 'Create Account' : 'Sign in to UNItrack'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {user
              ? 'Your data is synced and backed up.'
              : 'Enter admin / admin to access your account.'}
          </p>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-[#1f2937] rounded-2xl p-4 flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-lg font-bold text-slate-950 shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-white text-sm truncate">{user.name || 'Admin User'}</h4>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Active Session</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full py-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold rounded-xl text-xs hover:bg-rose-500/20 transition-all"
            >
              Log Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">{error}</div>}

            {isSignUp && (
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-[#1f2937] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Username or Email</label>
              <input
                type="text"
                required
                placeholder="admin"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full bg-slate-900 border border-[#1f2937] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Password</label>
              <input
                type="password"
                placeholder="admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-[#1f2937] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-md active:scale-95 transition-all text-sm mt-2 flex items-center justify-center gap-2"
            >
              {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>{loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}</span>
            </button>

            <div className="pt-2 border-t border-[#1f2937] flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-slate-400 hover:text-white"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
