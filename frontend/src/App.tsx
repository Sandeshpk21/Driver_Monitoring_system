import React, { Suspense } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  CircularProgress,
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import BottomNavigation from './components/BottomNavigation';
import ProtectedRoute from './components/ProtectedRoute';
import { RoleGuard } from './components/RoleGuard';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

// Lazy load pages for better performance
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Monitoring = React.lazy(() => import('./pages/Monitoring'));
const AlertHistory = React.lazy(() => import('./pages/AlertHistory'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Settings = React.lazy(() => import('./pages/Settings'));
const About = React.lazy(() => import('./pages/About'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const FleetDashboard = React.lazy(() => import('./pages/FleetDashboard'));
const SystemAnalytics = React.lazy(() => import('./pages/SystemAnalytics'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
});

// Loading component
const LoadingScreen = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
    }}
  >
    <CircularProgress />
  </Box>
);

// Layout component for authenticated pages
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navigation />
      <Box sx={{ 
        pb: { xs: '64px', md: '0' }, // Add bottom padding on mobile for bottom navigation
        minHeight: 'calc(100vh - 64px)', // Account for top navigation height
      }}>
        {children}
      </Box>
      <BottomNavigation />
    </>
  );
};

// Main app content with routes
const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  const getDefaultRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'driver':
        return '/';
      case 'manager':
      case 'admin':
        return '/fleet';
      default:
        return '/';
    }
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a',
      position: 'relative', // For proper bottom navigation positioning
    }}>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute requireAuth={false}>
                <Register />
              </ProtectedRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['driver']} redirectTo="/fleet">
                  <AuthenticatedLayout>
                    <Monitoring />
                  </AuthenticatedLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <AlertHistory />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['driver']}>
                  <AuthenticatedLayout>
                    <Analytics />
                  </AuthenticatedLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Settings />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <About />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['manager', 'admin']}>
                  <AuthenticatedLayout>
                    <UserManagement />
                  </AuthenticatedLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fleet"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['manager', 'admin']}>
                  <AuthenticatedLayout>
                    <FleetDashboard />
                  </AuthenticatedLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fleet-analytics"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['manager']}>
                  <AuthenticatedLayout>
                    <SystemAnalytics />
                  </AuthenticatedLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-analytics"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin']}>
                  <AuthenticatedLayout>
                    <SystemAnalytics />
                  </AuthenticatedLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin']}>
                  <AuthenticatedLayout>
                    <AdminPanel />
                  </AuthenticatedLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Default redirect based on role */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? getDefaultRoute() : "/login"} replace />}
          />
        </Routes>
      </Suspense>
    </Box>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <AppContent />
            <ToastContainer 
              theme="dark" 
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;