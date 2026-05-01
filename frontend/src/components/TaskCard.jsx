/**
 * TaskCard.jsx
 * Displays a single task with priority, status, due date, and assignee.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  formatDate, isOverdue, priorityClasses, statusClasses,
  statusLabel, priorityLabel, getInitials
} from '../utils/helpers';
import { Calendar, AlertTriangle } from 'lucide-react';

export default function TaskCard({ task, onStatusChange, userRole }) {
  const navigate = useNavigate();
  const overdue  = isOverdue(task.dueDate, task.status);

  const handleStatusChange = (e) => {
    e.stopPropagation();
    onStatusChange(task._id, { status: e.target.value });
  };

  return (
    <div
      onClick={() => navigate(`/tasks/${task._id}`)}
      className="card p-4 cursor-pointer hover:border-indigo-500/40 transition-all group"
    >
      {/* Priority + overdue indicators */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`badge ${priorityClasses[task.priority]}`}>
          {priorityLabel[task.priority]}
        </span>
        {overdue && (
          <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
            <AlertTriangle size={11} />
            Overdue
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors mb-1 line-clamp-2">
        {task.title}
      </h3>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2a2d3e]">
        {/* Due date */}
        <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-400' : 'text-gray-500'}`}>
          <Calendar size={11} />
          {formatDate(task.dueDate)}
        </div>

        {/* Assignee avatar */}
        {task.assignedTo ? (
          <div
            className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold"
            title={task.assignedTo.name}
          >
            {getInitials(task.assignedTo.name)}
          </div>
        ) : (
          <span className="text-xs text-gray-600 italic">Unassigned</span>
        )}
      </div>

      {/* Status selector */}
      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
        <select
          value={task.status}
          onChange={handleStatusChange}
          className={`w-full text-xs px-2 py-1.5 rounded-lg border bg-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${statusClasses[task.status]}`}
        >
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
}
