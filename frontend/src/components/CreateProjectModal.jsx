/**
 * CreateProjectModal.jsx
 * Form for creating a new project.
 */

import React, { useState } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

const COLORS = [
  '#6366f1', '#ec4899', '#14b8a6', '#f59e0b',
  '#ef4444', '#22c55e', '#3b82f6', '#a855f7',
];

const defaultForm = { name: '', description: '', color: '#6366f1' };

export default function CreateProjectModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm]       = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Project name is required'); return; }
    try {
      setLoading(true);
      await onSubmit(form);
      setForm(defaultForm);
      onClose();
      toast.success('Project created!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Project Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Website Redesign"
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
            placeholder="What is this project about?"
            rows={2}
            className="input resize-none"
          />
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-xs text-gray-400 mb-2 font-medium">Accent Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: form.color === c ? '#fff' : 'transparent',
                }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating…' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
