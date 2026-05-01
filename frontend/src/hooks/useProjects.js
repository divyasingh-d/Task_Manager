/**
 * useProjects hook
 * Fetches and manages the list of projects for the logged-in user.
 */

import { useState, useEffect, useCallback } from 'react';
import { projectsAPI } from '../api/services';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await projectsAPI.getAll();
      setProjects(data.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createProject = async (formData) => {
    const { data } = await projectsAPI.create(formData);
    setProjects((prev) => [data.data, ...prev]);
    return data.data;
  };

  const deleteProject = async (id) => {
    await projectsAPI.delete(id);
    setProjects((prev) => prev.filter((p) => p._id !== id));
    toast.success('Project deleted');
  };

  return { projects, loading, error, fetchProjects, createProject, deleteProject };
};
