/**
 * CreateTaskModal.jsx
 * Form to create a new task within a project.
 * Only shown to project admins.
 */

import React, { useState } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

const defaultForm = {
  title: '', description: '', assignedTo: '', priority: 'medium', dueDate: ''
};

export default function CreateTaskModal({ isOpen, onClose, onSubmit, members }) {
  const [form, setForm]       = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    try {
      setLoading(true);
      await onSubmit({
        ...form,
        assignedTo: form.assignedTo || undefined,
        dueDate:    form.dueDate    || undefined,
      });
      setForm(defaultForm);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="What needs to be done?"
            className="input"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Add details..."
            rows={3}
            className="input resize-none"
          />
        </div>

        {/* Priority + Due Date row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className="input">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="input"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Assign to member */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Assign To</label>
          <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="input">
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.user._id} value={m.user._id}>
                {m.user.name} ({m.role})
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating…' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
