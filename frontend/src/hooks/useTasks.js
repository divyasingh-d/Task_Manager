/**
 * useTasks hook
 * Fetches and manages tasks for a specific project.
 */

import { useState, useEffect, useCallback } from 'react';
import { tasksAPI } from '../api/services';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

export const useTasks = (projectId) => {
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const { data } = await tasksAPI.getByProject(projectId);
      setTasks(data.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async (formData) => {
    const { data } = await tasksAPI.create(projectId, formData);
    setTasks((prev) => [data.data, ...prev]);
    toast.success('Task created');
    return data.data;
  };

  const updateTask = async (taskId, formData) => {
    const { data } = await tasksAPI.update(taskId, formData);
    setTasks((prev) => prev.map((t) => (t._id === taskId ? data.data : t)));
    toast.success('Task updated');
    return data.data;
  };

  const deleteTask = async (taskId) => {
    await tasksAPI.delete(taskId);
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    toast.success('Task deleted');
  };

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask };
};
