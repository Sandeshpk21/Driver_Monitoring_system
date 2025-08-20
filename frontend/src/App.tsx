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
import ProtectedRoute from './components/ProtectedRoute';
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
      {children}
    </>
  );
};

// Main app content with routes
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
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
                <AuthenticatedLayout>
                  <Monitoring />
                </AuthenticatedLayout>
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
                <AuthenticatedLayout>
                  <Analytics />
                </AuthenticatedLayout>
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

          {/* Default redirect */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
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