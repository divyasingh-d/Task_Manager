/**
 * Utility helpers shared across the app.
 */

import { format, isPast, parseISO } from 'date-fns';

// Format a date string for display
export const formatDate = (date) => {
  if (!date) return '—';
  try { return format(parseISO(date), 'MMM d, yyyy'); }
  catch { return '—'; }
};

// Check if a task is overdue
export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false;
  return isPast(new Date(dueDate));
};

// Get Tailwind classes for priority badge
export const priorityClasses = {
  low:    'bg-green-500/10 text-green-400 border border-green-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  high:   'bg-red-500/10 text-red-400 border border-red-500/20',
};

// Get Tailwind classes for status badge
export const statusClasses = {
  todo:       'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  inprogress: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  done:       'bg-green-500/10 text-green-400 border border-green-500/20',
};

export const statusLabel = {
  todo:       'To Do',
  inprogress: 'In Progress',
  done:       'Done',
};

export const priorityLabel = {
  low: 'Low', medium: 'Medium', high: 'High',
};

// Generate a colour-coded avatar from initials
export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// Extract error message from axios error
export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';
