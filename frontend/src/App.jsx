import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import { PageLoader } from './components/common/Spinner';
import { initSocket, disconnectSocket } from './services/socket';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// Dashboard Layout
import DashboardLayout from './layouts/DashboardLayout';

// Dashboard Pages (will be created)
import DashboardHome from './pages/Dashboard/DashboardHome';
import GroupPage from './pages/Group/GroupPage';
import MessagesPage from './pages/Messages/MessagesPage';
import MyTasksPage from './pages/Personal/MyTasksPage';
import MyNotesPage from './pages/Personal/MyNotesPage';
import SettingsPage from './pages/Settings/SettingsPage';

/**
 * Protected Route wrapper
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

/**
 * Public Route wrapper (redirects to dashboard if authenticated)
 */
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

/**
 * Main App Component
 */
function App() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Initialize socket when authenticated
  useEffect(() => {
    let mounted = true;

    if (isAuthenticated && mounted) {
      const token = localStorage.getItem('token');
      if (token && !window.socketInstance?.connected) {
        const socket = initSocket(token);
        window.socketInstance = socket;
      }
    } else if (!isAuthenticated) {
      if (window.socketInstance) {
        disconnectSocket();
        delete window.socketInstance;
      }
    }

    return () => {
      mounted = false;
      // Don't disconnect on cleanup, only when user logs out
    };
  }, [isAuthenticated]);
  
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="groups/:groupId/*" element={<GroupPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="messages/:userId" element={<MessagesPage />} />
          <Route path="my-tasks" element={<MyTasksPage />} />
          <Route path="my-notes" element={<MyNotesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
