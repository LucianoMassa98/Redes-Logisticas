import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LandingPage } from '../pages/LandingPage.jsx';
import { LoginPage } from '../pages/admin/LoginPage.jsx';
import { DashboardPage } from '../pages/admin/DashboardPage.jsx';
import { LeadsListPage } from '../pages/admin/LeadsListPage.jsx';
import { LeadDetailPage } from '../pages/admin/LeadDetailPage.jsx';
import { UsersPage } from '../pages/admin/UsersPage.jsx';
import { AdminLayout } from '../components/admin/AdminLayout.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

// Wrapper para rutas protegidas que exigen autenticación
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <LoadingSpinner size="lg" className="text-cyan-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

// Wrapper para rutas exclusivas de rol ADMIN
const AdminOnlyRoute = ({ children }) => {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing page pública */}
      <Route path="/" element={<LandingPage />} />

      {/* Login administrativo */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Rutas administrativas protegidas */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="leads" element={<LeadsListPage />} />
        <Route path="leads/:id" element={<LeadDetailPage />} />
        <Route
          path="users"
          element={
            <AdminOnlyRoute>
              <UsersPage />
            </AdminOnlyRoute>
          }
        />
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
