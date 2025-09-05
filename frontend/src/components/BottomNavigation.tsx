import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
} from '@mui/material';
import {
  Dashboard,
  History,
  Analytics,
  Visibility,
  Group,
  Assessment,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const BottomNavigation: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  // Get navigation items based on role
  const getNavigationItems = () => {
    switch (user.role) {
      case 'driver':
        return [
          { label: 'Monitoring', icon: <Dashboard />, path: '/' },
          { label: 'Alerts', icon: <History />, path: '/alerts' },
          { label: 'Analytics', icon: <Analytics />, path: '/analytics' },
        ];
      
      case 'manager':
        return [
          { label: 'Fleet', icon: <Visibility />, path: '/fleet' },
          { label: 'Users', icon: <Group />, path: '/users' },
          { label: 'Analytics', icon: <Assessment />, path: '/fleet-analytics' },
        ];
      
      case 'admin':
        return [
          { label: 'Fleet', icon: <Visibility />, path: '/fleet' },
          { label: 'Users', icon: <Group />, path: '/users' },
          { label: 'Analytics', icon: <Assessment />, path: '/system-analytics' },
          { label: 'Admin', icon: <AdminPanelSettings />, path: '/admin' },
        ];
      
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  // Find current value based on pathname
  const getCurrentValue = () => {
    const currentPath = location.pathname;
    const index = navigationItems.findIndex(item => item.path === currentPath);
    return index >= 0 ? index : 0;
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    const selectedItem = navigationItems[newValue];
    if (selectedItem) {
      navigate(selectedItem.path);
    }
  };

  return (
    <Box sx={{ 
      display: { xs: 'block', md: 'none' }, // Only show on mobile
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1100,
    }}>
      <Paper 
        elevation={8} 
        sx={{ 
          borderRadius: 0,
          backgroundColor: '#1a1a1a',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <MuiBottomNavigation
          value={getCurrentValue()}
          onChange={handleChange}
          showLabels
          sx={{
            backgroundColor: 'transparent',
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              color: 'rgba(255, 255, 255, 0.6)',
              '&.Mui-selected': {
                color: '#90caf9',
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                '&.Mui-selected': {
                  fontSize: '0.75rem',
                },
              },
            },
          }}
        >
          {navigationItems.map((item, index) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
              sx={{
                minWidth: 'auto',
                maxWidth: 'none',
              }}
            />
          ))}
        </MuiBottomNavigation>
      </Paper>
    </Box>
  );
};

export default BottomNavigation;