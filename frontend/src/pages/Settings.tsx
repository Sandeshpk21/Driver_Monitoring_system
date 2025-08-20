import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import { NavigateNext, Home, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ConfigPanel from '../components/ConfigPanel';
import { Config } from '../types';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/config', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to fetch config:', error);
      setSaveStatus({
        open: true,
        message: 'Failed to load configuration',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigUpdate = async (newConfig: Partial<Config>) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newConfig),
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
        setSaveStatus({
          open: true,
          message: 'Configuration saved successfully',
          severity: 'success',
        });
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      setSaveStatus({
        open: true,
        message: 'Failed to save configuration',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSaveStatus({ ...saveStatus, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 1, sm: 2, md: 3 }, px: { xs: 1, sm: 2 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          component="button"
          underline="hover"
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            color: 'inherit',
          }}
          onClick={() => navigate('/')}
        >
          <Home sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Typography
          sx={{ display: 'flex', alignItems: 'center' }}
          color="text.primary"
        >
          <SettingsIcon sx={{ mr: 0.5 }} fontSize="small" />
          Settings
        </Typography>
      </Breadcrumbs>

      {/* Page Title */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, backgroundColor: '#1a1a1a' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2 }}>
          <SettingsIcon sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 }, fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
              System Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Configure detection thresholds and system parameters for optimal monitoring performance
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Configuration Panels */}
      <Box sx={{ display: 'grid', gap: { xs: 2, sm: 3 } }}>
        {/* Detection Settings */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#1a1a1a' }}>
          <Typography variant="h6" gutterBottom sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Detection Configuration
          </Typography>
          {loading ? (
            <Typography>Loading configuration...</Typography>
          ) : (
            <ConfigPanel config={config} onUpdate={handleConfigUpdate} />
          )}
        </Paper>

        {/* System Information */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#1a1a1a' }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            System Information
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                API Status
              </Typography>
              <Typography variant="body1">Connected</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Version
              </Typography>
              <Typography variant="body1">1.0.0</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Processing Mode
              </Typography>
              <Typography variant="body1">Real-time WebSocket</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Frame Rate
              </Typography>
              <Typography variant="body1">15 FPS</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Actions */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#1a1a1a' }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Actions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={() => {
                if (window.confirm('Reset all settings to default values?')) {
                  // Reset to defaults
                  const defaultConfig: Config = {
                    ear_threshold: 0.140,
                    eye_closed_frames_threshold: 9,
                    blink_rate_threshold: 5,
                    mar_threshold: 0.6,
                    yawn_threshold: 3,
                    frame_width: 1920,
                    frame_height: 1080,
                    scale_factor: 1.0,
                    gaze_deviation_threshold: 0.05,
                    head_turn_threshold: 0.08,
                    hand_near_face_px: 200,
                    alert_duration: 3,
                  };
                  handleConfigUpdate(defaultConfig);
                }
              }}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                const configStr = JSON.stringify(config, null, 2);
                const blob = new Blob([configStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'dms-config.json';
                a.click();
                URL.revokeObjectURL(url);
                setSaveStatus({
                  open: true,
                  message: 'Configuration exported successfully',
                  severity: 'success',
                });
              }}
            >
              Export Configuration
            </Button>
            <Button
              variant="outlined"
              component="label"
            >
              Import Configuration
              <input
                type="file"
                accept=".json"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const text = await file.text();
                      const importedConfig = JSON.parse(text);
                      handleConfigUpdate(importedConfig);
                    } catch (error) {
                      setSaveStatus({
                        open: true,
                        message: 'Failed to import configuration',
                        severity: 'error',
                      });
                    }
                  }
                }}
              />
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={saveStatus.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={saveStatus.severity}
          sx={{ width: '100%' }}
        >
          {saveStatus.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;