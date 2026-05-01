/**
 * ProjectPage.jsx
 * Shows a project's tasks (kanban-style columns) and member management.
 * Admins see full controls; members only see their tasks.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../api/services';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import AddMemberModal from '../components/AddMemberModal';
import { getErrorMessage, getInitials, statusLabel } from '../utils/helpers';
import {
  Plus, Users, Settings, Trash2, UserMinus, ArrowLeft,
  FolderKanban, Crown, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLUMNS = ['todo', 'inprogress', 'done'];

export default function ProjectPage() {
  const { projectId } = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();

  const [project, setProject]         = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember]   = useState(false);
  const [showMembers, setShowMembers]       = useState(false);

  const { tasks, loading: loadingTasks, createTask, updateTask, deleteTask } = useTasks(projectId);

  // Determine the current user's role
  const myRole = project?.members.find(
    (m) => m.user._id === user?._id
  )?.role;
  const isAdmin = myRole === 'admin';

  useEffect(() => {
    (async () => {
      try {
        const { data } = await projectsAPI.getOne(projectId);
        setProject(data.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate('/dashboard');
      } finally {
        setLoadingProject(false);
      }
    })();
  }, [projectId, navigate]);

  const handleAddMember = async (formData) => {
    const { data } = await projectsAPI.addMember(projectId, formData);
    setProject(data.data);
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await projectsAPI.removeMember(projectId, userId);
      setProject((p) => ({
        ...p,
        members: p.members.filter((m) => m.user._id !== userId),
      }));
      toast.success('Member removed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Delete "${project.name}"? All tasks will also be deleted.`)) return;
    try {
      await projectsAPI.delete(projectId);
      toast.success('Project deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleStatusChange = (taskId, data) => updateTask(taskId, data);

  if (loadingProject) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!project) return null;

  // Visible tasks: admins see all; members see only assigned tasks
  const visibleTasks = isAdmin
    ? tasks
    : tasks.filter((t) => t.assignedTo?._id === user?._id);

  const tasksByStatus = (status) => visibleTasks.filter((t) => t.status === status);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-[#2a2d3e] bg-[#1a1d27]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            {/* Project color dot */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${project.color}20`, border: `1px solid ${project.color}40` }}
            >
              <FolderKanban size={16} style={{ color: project.color }} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{project.name}</h1>
              {project.description && (
                <p className="text-xs text-gray-500 mt-0.5">{project.description}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Member avatars */}
            <button
              onClick={() => setShowMembers((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-gray-400"
            >
              <div className="flex -space-x-1.5">
                {project.members.slice(0, 4).map((m) => (
                  <div
                    key={m.user._id}
                    className="w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-200 flex items-center justify-center text-xs border border-[#1a1d27]"
                    title={m.user.name}
                  >
                    {getInitials(m.user.name)[0]}
                  </div>
                ))}
              </div>
              <Users size={13} />
              {project.members.length}
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="btn-primary flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Task
                </button>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="btn-secondary flex items-center gap-1.5"
                >
                  <Users size={14} />
                  Member
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete project"
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Members panel (collapsible) */}
        {showMembers && (
          <div className="mt-4 p-4 bg-[#0f1117] rounded-xl border border-[#2a2d3e]">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Project Members
            </p>
            <div className="flex flex-wrap gap-2">
              {project.members.map((m) => (
                <div
                  key={m.user._id}
                  className="flex items-center gap-2 px-3 py-2 bg-[#1a1d27] border border-[#2a2d3e] rounded-xl"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold">
                    {getInitials(m.user.name)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{m.user.name}</p>
                    <p className="text-xs text-gray-500">{m.user.email}</p>
                  </div>
                  <span className={`badge ml-1 ${m.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'}`}>
                    {m.role === 'admin' ? <Crown size={9} className="mr-1 inline" /> : <UserCheck size={9} className="mr-1 inline" />}
                    {m.role}
                  </span>
                  {/* Remove member button (admin only, can't remove yourself if only admin) */}
                  {isAdmin && m.user._id !== user._id && (
                    <button
                      onClick={() => handleRemoveMember(m.user._id)}
                      className="ml-1 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <UserMinus size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto p-6">
        {loadingTasks ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex gap-4 min-w-max pb-4">
            {COLUMNS.map((status) => {
              const columnTasks = tasksByStatus(status);
              return (
                <div key={status} className="w-72 flex-shrink-0">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        {statusLabel[status]}
                      </h3>
                      <span className="badge bg-white/5 text-gray-400">
                        {columnTasks.length}
                      </span>
                    </div>
                    {isAdmin && status === 'todo' && (
                      <button
                        onClick={() => setShowCreateTask(true)}
                        className="text-gray-500 hover:text-indigo-400 transition-colors"
                      >
                        <Plus size={15} />
                      </button>
                    )}
                  </div>

                  {/* Task cards */}
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        userRole={myRole}
                      />
                    ))}

                    {columnTasks.length === 0 && (
                      <div className="h-24 border border-dashed border-[#2a2d3e] rounded-xl flex items-center justify-center">
                        <p className="text-xs text-gray-600">No tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onSubmit={createTask}
        members={project.members}
      />

      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onSubmit={handleAddMember}
      />
    </div>
  );
}
