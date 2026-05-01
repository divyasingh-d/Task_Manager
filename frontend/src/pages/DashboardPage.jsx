/**
 * DashboardPage.jsx
 * Shows aggregated stats across all of the user's projects.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../api/services';
import { useProjects } from '../hooks/useProjects';
import StatCard from '../components/StatCard';
import CreateProjectModal from '../components/CreateProjectModal';
import { getErrorMessage, formatDate, statusClasses, statusLabel, priorityClasses, priorityLabel, getInitials, isOverdue } from '../utils/helpers';
import {
  LayoutDashboard, FolderKanban, CheckCircle2, Clock,
  AlertTriangle, Plus, Users, TrendingUp, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats]     = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showCreate, setShowCreate]     = useState(false);
  const { projects, loading: loadingProjects, createProject } = useProjects();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await dashboardAPI.get();
        setStats(data.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoadingStats(false);
      }
    })();
  }, []);

  const Loading = () => (
    <div className="h-24 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <LayoutDashboard size={12} />
            Overview
          </div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={15} />
          New Project
        </button>
      </div>

      {/* Stat cards */}
      {loadingStats ? <Loading /> : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Projects"  value={stats.totalProjects}               icon={FolderKanban} accent="indigo" />
          <StatCard label="Total Tasks"     value={stats.totalTasks}                  icon={TrendingUp}   accent="blue"   />
          <StatCard label="Completed"       value={stats.tasksByStatus.done}          icon={CheckCircle2} accent="green"  />
          <StatCard label="Overdue"         value={stats.overdueCount}                icon={AlertTriangle} accent="red"   />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Task status breakdown */}
        {!loadingStats && stats && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={14} className="text-indigo-400" />
              Tasks by Status
            </h2>
            <div className="space-y-3">
              {[
                { key: 'todo',       label: 'To Do',       color: 'bg-slate-500'  },
                { key: 'inprogress', label: 'In Progress', color: 'bg-blue-500'   },
                { key: 'done',       label: 'Done',        color: 'bg-green-500'  },
              ].map(({ key, label, color }) => {
                const count = stats.tasksByStatus[key] || 0;
                const pct   = stats.totalTasks ? Math.round((count / stats.totalTasks) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                    <div className="h-1.5 bg-[#2a2d3e] rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tasks per user */}
        {!loadingStats && stats && stats.tasksPerUser.length > 0 && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={14} className="text-indigo-400" />
              Tasks per Member
            </h2>
            <div className="space-y-3">
              {stats.tasksPerUser.slice(0, 6).map(({ user, count }) => (
                <div key={user._id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300 truncate">{user.name}</span>
                      <span className="text-white font-medium ml-2">{count}</span>
                    </div>
                    <div className="h-1.5 bg-[#2a2d3e] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.round((count / stats.totalTasks) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent tasks */}
        {!loadingStats && stats && stats.recentTasks.length > 0 && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={14} className="text-indigo-400" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {stats.recentTasks.map((task) => (
                <div key={task._id} className="flex items-start gap-3 group">
                  <span className={`badge mt-0.5 flex-shrink-0 ${statusClasses[task.status]}`}>
                    {statusLabel[task.status]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate font-medium">{task.title}</p>
                    <p className="text-xs text-gray-600">{task.project?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Overdue tasks */}
      {!loadingStats && stats && stats.overdueTasks.length > 0 && (
        <div className="mt-6 card p-5">
          <h2 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={14} />
            Overdue Tasks ({stats.overdueCount})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.overdueTasks.map((task) => (
              <Link
                key={task._id}
                to={`/tasks/${task._id}`}
                className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl hover:border-red-500/40 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{task.title}</p>
                  <p className="text-xs text-red-400 mt-0.5">Due {formatDate(task.dueDate)}</p>
                </div>
                <ArrowRight size={14} className="text-red-400/50 group-hover:text-red-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Projects grid */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <FolderKanban size={14} className="text-indigo-400" />
          Your Projects
        </h2>
        {loadingProjects ? <Loading /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => {
              const projectStats = stats?.tasksByProject?.find(
                (x) => x.project._id === p._id
              );
              return (
                <Link
                  key={p._id}
                  to={`/projects/${p._id}`}
                  className="card p-5 hover:border-indigo-500/40 transition-all group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: `${p.color}20`, border: `1px solid ${p.color}30` }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.members.length} members</p>
                    </div>
                  </div>
                  {p.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#2a2d3e]">
                    <span>{projectStats?.count ?? 0} tasks</span>
                    <ArrowRight size={12} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </Link>
              );
            })}

            {/* Empty state */}
            {projects.length === 0 && (
              <button
                onClick={() => setShowCreate(true)}
                className="card p-8 border-dashed hover:border-indigo-500/40 transition-colors flex flex-col items-center gap-3 col-span-full text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Plus size={20} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Create your first project</p>
                  <p className="text-xs text-gray-600 mt-1">Invite teammates and start tracking tasks</p>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={createProject}
      />
    </div>
  );
}
