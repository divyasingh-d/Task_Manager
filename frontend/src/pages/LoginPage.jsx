/**
 * LoginPage.jsx
 * User authentication form with JWT login.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import { FolderKanban, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex w-1/2 bg-[#1a1d27] border-r border-[#2a2d3e] flex-col items-center justify-center p-16 relative overflow-hidden">
        {/* Decorative background grid */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
            <FolderKanban size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">TeamTask</h1>
          <p className="text-gray-400 text-lg max-w-sm leading-relaxed">
            Collaborate, track, and ship projects — together.
          </p>
          {/* Feature bullets */}
          <div className="mt-10 space-y-3 text-left">
            {[
              'Role-based access control',
              'Real-time task tracking',
              'Team dashboards & analytics',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
                <span className="text-gray-400 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FolderKanban size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">TeamTask</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Sign in</h2>
          <p className="text-gray-500 text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign up
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
            <p className="text-xs text-indigo-400 font-medium mb-1">Demo credentials</p>
            <p className="text-xs text-gray-500 font-mono">demo@teamtask.dev / demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
