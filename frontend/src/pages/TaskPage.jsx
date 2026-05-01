/**
 * TaskPage.jsx
 * Full detail view for a single task.
 * Admins can edit all fields; members can only update status.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tasksAPI, projectsAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import {
  formatDate, getInitials, priorityClasses, priorityLabel,
  statusClasses, statusLabel, getErrorMessage
} from '../utils/helpers';
import {
  ArrowLeft, Calendar, Flag, User, Clock, Trash2, Edit2, Check, X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaskPage() {
  const { taskId }    = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();

  const [task, setTask]       = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({});

  // Load task and its project
  useEffect(() => {
    (async () => {
      try {
        const { data } = await tasksAPI.getOne(taskId);
        const t = data.data;
        setTask(t);
        setForm({
          title:       t.title,
          description: t.description || '',
          status:      t.status,
          priority:    t.priority,
          dueDate:     t.dueDate ? t.dueDate.split('T')[0] : '',
          assignedTo:  t.assignedTo?._id || '',
        });

        // Fetch project for member list
        const { data: pd } = await projectsAPI.getOne(t.project._id);
        setProject(pd.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate(-1);
      } finally {
        setLoading(false);
      }
    })();
  }, [taskId, navigate]);

  const myRole = project?.members.find(
    (m) => m.user._id === user?._id
  )?.role;
  const isAdmin    = myRole === 'admin';
  const isAssignee = task?.assignedTo?._id === user?._id;
  const canEdit    = isAdmin || isAssignee;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = isAdmin
        ? { ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null }
        : { status: form.status }; // Members can only change status

      const { data } = await tasksAPI.update(taskId, payload);
      setTask(data.data);
      setEditing(false);
      toast.success('Task updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await tasksAPI.delete(taskId);
      toast.success('Task deleted');
      navigate(`/projects/${task.project._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!task) return null;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(`/projects/${task.project._id}`)}
        className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to {task.project.name}
      </button>

      <div className="card p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            {editing && isAdmin ? (
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input text-lg font-bold"
              />
            ) : (
              <h1 className="text-xl font-bold text-white">{task.title}</h1>
            )}
            <Link
              to={`/projects/${task.project._id}`}
              className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-block"
            >
              {task.project.name}
            </Link>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {canEdit && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary flex items-center gap-1.5 text-xs"
              >
                <Edit2 size={12} />
                Edit
              </button>
            )}
            {editing && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center gap-1.5 text-xs"
                >
                  <Check size={12} />
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="btn-secondary flex items-center gap-1.5 text-xs"
                >
                  <X size={12} />
                  Cancel
                </button>
              </>
            )}
            {isAdmin && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete task"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-[#0f1117] rounded-xl">
          {/* Status */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
              <Clock size={11} /> Status
            </p>
            {editing ? (
              <select name="status" value={form.status} onChange={handleChange} className="input text-xs py-1.5">
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            ) : (
              <span className={`badge ${statusClasses[task.status]}`}>
                {statusLabel[task.status]}
              </span>
            )}
          </div>

          {/* Priority */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
              <Flag size={11} /> Priority
            </p>
            {editing && isAdmin ? (
              <select name="priority" value={form.priority} onChange={handleChange} className="input text-xs py-1.5">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <span className={`badge ${priorityClasses[task.priority]}`}>
                {priorityLabel[task.priority]}
              </span>
            )}
          </div>

          {/* Due date */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
              <Calendar size={11} /> Due Date
            </p>
            {editing && isAdmin ? (
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="input text-xs py-1.5"
                style={{ colorScheme: 'dark' }}
              />
            ) : (
              <span className="text-sm text-white">{formatDate(task.dueDate)}</span>
            )}
          </div>

          {/* Assignee */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
              <User size={11} /> Assigned To
            </p>
            {editing && isAdmin ? (
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="input text-xs py-1.5">
                <option value="">Unassigned</option>
                {project?.members.map((m) => (
                  <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                ))}
              </select>
            ) : task.assignedTo ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold">
                  {getInitials(task.assignedTo.name)}
                </div>
                <span className="text-sm text-white">{task.assignedTo.name}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500 italic">Unassigned</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Description</p>
          {editing && isAdmin ? (
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              placeholder="Add a description…"
              className="input resize-none"
            />
          ) : (
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {task.description || <span className="text-gray-600 italic">No description provided.</span>}
            </div>
          )}
        </div>

        {/* Footer metadata */}
        <div className="mt-6 pt-4 border-t border-[#2a2d3e] flex items-center justify-between text-xs text-gray-600">
          <span>Created by {task.createdBy?.name}</span>
          <span>Updated {formatDate(task.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
