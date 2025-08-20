import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Button,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Settings,
  Info,
  Close,
  CameraAlt,
  History,
  Analytics,
  Logout,
  Person,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuItems = [
    {
      text: 'Monitoring',
      icon: <Dashboard />,
      path: '/',
    },
    {
      text: 'Alert History',
      icon: <History />,
      path: '/alerts',
    },
    {
      text: 'Analytics',
      icon: <Analytics />,
      path: '/analytics',
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/settings',
    },
    {
      text: 'About',
      icon: <Info />,
      path: '/about',
    },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1a1a1a' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <CameraAlt sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Driver Monitoring System
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            {menuItems.slice(0, 3).map((item) => (
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
            
            {/* User Menu */}
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
                    {user.username}
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => { handleNavigation('/settings'); setAnchorEl(null); }}>
                    <Settings sx={{ mr: 1 }} />
                    Settings
                  </MenuItem>
                  <MenuItem onClick={() => { logout(); setAnchorEl(null); }}>
                    <Logout sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            backgroundColor: '#1a1a1a',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6">Menu</Typography>
          <IconButton onClick={handleDrawerToggle} size="small">
            <Close />
          </IconButton>
        </Box>
        
        <Divider />
        
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(144, 202, 249, 0.16)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Version 1.0.0
          </Typography>
        </Box>
      </Drawer>
    </>
  );
};

export default Navigation;