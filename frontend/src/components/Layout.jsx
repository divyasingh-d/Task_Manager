/**
 * Layout.jsx
 * App shell with sidebar navigation and top bar.
 * Outlet renders the active page.
 */

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import {
  LayoutDashboard, FolderKanban, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { projects } = useProjects();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-600/20 text-indigo-400'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#2a2d3e]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FolderKanban size={16} className="text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">TeamTask</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <NavLink to="/dashboard" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
          <LayoutDashboard size={16} />
          Dashboard
        </NavLink>

        {/* Projects list */}
        {projects.length > 0 && (
          <div className="pt-4">
            <p className="px-3 pb-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Projects
            </p>
            <div className="space-y-0.5">
              {projects.map((p) => (
                <NavLink
                  key={p._id}
                  to={`/projects/${p._id}`}
                  className={navLinkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: p.color || '#6366f1' }}
                  />
                  <span className="truncate">{p.name}</span>
                  <ChevronRight size={12} className="ml-auto text-gray-600" />
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-[#2a2d3e]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-400 transition-colors p-1"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-[#1a1d27] border-r border-[#2a2d3e] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#1a1d27] border-r border-[#2a2d3e] z-10">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[#2a2d3e] bg-[#1a1d27]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <FolderKanban size={12} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">TeamTask</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
