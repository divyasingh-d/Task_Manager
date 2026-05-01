/**
 * App.jsx
 * Top-level routing. Protected routes redirect to /login if unauthenticated.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage    from './pages/LoginPage';
import SignupPage   from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage  from './pages/ProjectPage';
import TaskPage     from './pages/TaskPage';

// Layout
import Layout from './components/Layout';

// Guard: redirect to /login if not authenticated
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

// Guard: redirect to /dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />

    <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

    <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
      <Route path="/dashboard"           element={<DashboardPage />} />
      <Route path="/projects/:projectId" element={<ProjectPage />} />
      <Route path="/tasks/:taskId"       element={<TaskPage />} />
    </Route>

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1d27',
              color: '#fff',
              border: '1px solid #2a2d3e',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
