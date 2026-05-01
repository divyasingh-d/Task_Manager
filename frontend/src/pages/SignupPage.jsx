/**
 * SignupPage.jsx
 * New user registration form.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import { FolderKanban, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      await signup(form.name, form.email, form.password);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FolderKanban size={16} className="text-white" />
          </div>
          <span className="font-bold text-white">TeamTask</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
        <p className="text-gray-500 text-sm mb-8">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Smith"
              className="input"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              className="input"
              required
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
                placeholder="Min. 6 characters"
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

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3 text-base">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account…
              </span>
            ) : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-600 text-center">
          By signing up, you agree to our{' '}
          <span className="text-gray-500">Terms of Service</span> and{' '}
          <span className="text-gray-500">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
