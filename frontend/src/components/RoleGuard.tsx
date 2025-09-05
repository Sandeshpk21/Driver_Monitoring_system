import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Alert, Box } from '@mui/material';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback,
  redirectTo 
}) => {
  const { user, isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(allowedRoles)) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to access this page. Required roles: {allowedRoles.join(', ')}
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

interface ConditionalRenderProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  children,
  allowedRoles,
  fallback = null
}) => {
  const { hasRole, isAuthenticated } = useAuth();

  if (!isAuthenticated || !hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};