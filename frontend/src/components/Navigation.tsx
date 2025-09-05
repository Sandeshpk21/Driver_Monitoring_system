import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  CameraAlt,
  Dashboard,
  History,
  Analytics,
  Visibility,
  Group,
  Assessment,
  AdminPanelSettings,
  Logout,
  Person,
  Settings,
  Info,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Get desktop navigation items based on role
  const getDesktopMenuItems = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'driver':
        return [
          { text: 'Monitoring', icon: <Dashboard />, path: '/' },
          { text: 'Alert History', icon: <History />, path: '/alerts' },
          { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
        ];
      
      case 'manager':
        return [
          { text: 'Fleet Dashboard', icon: <Visibility />, path: '/fleet' },
          { text: 'User Management', icon: <Group />, path: '/users' },
          { text: 'Fleet Analytics', icon: <Assessment />, path: '/fleet-analytics' },
        ];
      
      case 'admin':
        return [
          { text: 'Fleet Dashboard', icon: <Visibility />, path: '/fleet' },
          { text: 'User Management', icon: <Group />, path: '/users' },
          { text: 'System Analytics', icon: <Assessment />, path: '/system-analytics' },
          { text: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin' },
        ];
      
      default:
        return [];
    }
  };
  
  const desktopMenuItems = getDesktopMenuItems();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a1a1a' }}>
      <Toolbar>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <CameraAlt sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Driver Monitoring System
          </Typography>
        </Box>

        {/* Desktop Navigation - Show on desktop, hide on mobile */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
          {desktopMenuItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => handleNavigation(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>
        
        {/* User Profile Menu */}
        {user && (
          <>
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ ml: 2 }}
            >
              <Avatar sx={{ width: 32, height: 32, backgroundColor: 'primary.main' }}>
                {user.username[0].toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: { backgroundColor: '#1a1a1a' }
              }}
            >
              <MenuItem disabled>
                <Person sx={{ mr: 1 }} />
                {user.username} ({user.role})
              </MenuItem>
              <MenuItem onClick={() => { handleNavigation('/settings'); setAnchorEl(null); }}>
                <Settings sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={() => { handleNavigation('/about'); setAnchorEl(null); }}>
                <Info sx={{ mr: 1 }} />
                About
              </MenuItem>
              <MenuItem onClick={() => { logout(); setAnchorEl(null); }}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;