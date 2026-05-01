/**
 * API Service Layer
 * All HTTP calls are here; components only call these functions.
 */

import API from './axios';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data)  => API.post('/auth/signup', data),
  login:  (data)  => API.post('/auth/login',  data),
  getMe:  ()      => API.get('/auth/me'),
};

// ── Projects ──────────────────────────────────────────────────────────────────
export const projectsAPI = {
  getAll:    ()           => API.get('/projects'),
  getOne:    (id)         => API.get(`/projects/${id}`),
  create:    (data)       => API.post('/projects', data),
  update:    (id, data)   => API.put(`/projects/${id}`, data),
  delete:    (id)         => API.delete(`/projects/${id}`),
  addMember: (id, data)   => API.post(`/projects/${id}/members`, data),
  removeMember: (id, uid) => API.delete(`/projects/${id}/members/${uid}`),
  updateMemberRole: (id, uid, data) => API.put(`/projects/${id}/members/${uid}/role`, data),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getByProject: (projectId)      => API.get(`/tasks/project/${projectId}`),
  getOne:       (taskId)         => API.get(`/tasks/${taskId}`),
  create:       (projectId, data) => API.post(`/tasks/project/${projectId}`, data),
  update:       (taskId, data)   => API.put(`/tasks/${taskId}`, data),
  delete:       (taskId)         => API.delete(`/tasks/${taskId}`),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  get: () => API.get('/dashboard'),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  search:        (email)  => API.get(`/users/search?email=${email}`),
  getProfile:    ()       => API.get('/users/profile'),
  updateProfile: (data)   => API.put('/users/profile', data),
};
