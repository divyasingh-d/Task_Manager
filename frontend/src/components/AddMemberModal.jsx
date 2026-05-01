/**
 * AddMemberModal.jsx
 * Lets project admins add members by email.
 */

import React, { useState } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

export default function AddMemberModal({ isOpen, onClose, onSubmit }) {
  const [email, setEmail]   = useState('');
  const [role, setRole]     = useState('member');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Email is required'); return; }
    try {
      setLoading(true);
      await onSubmit({ email: email.trim(), role });
      setEmail('');
      setRole('member');
      onClose();
      toast.success('Member added!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <p className="text-xs text-gray-500">
          The user must already have a TeamTask account.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Adding…' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
