import React, { useState } from 'react';
import { Activity, Lock, User, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

export default function AuthPanel({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login(username, password);
        onLogin(data.access_token);
      } else {
        await api.register(username, password);
        const data = await api.login(username, password);
        onLogin(data.access_token);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
            <Activity className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            Energy Regime System
          </h1>
          <p className="text-zinc-500 mt-2 text-sm text-center">
            {isLogin ? 'Sign in to access your dashboard' : 'Create an account to get started'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 ml-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-zinc-500" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-700/50 text-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-zinc-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-700/50 text-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center text-sm text-zinc-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-medium text-zinc-300 hover:text-indigo-300 transition-colors"
            >
              {isLogin ? 'Register now' : 'Sign in instead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
