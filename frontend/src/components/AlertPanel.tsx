import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { Warning, Error, Info } from '@mui/icons-material';
import { Alert } from '../types';

interface AlertPanelProps {
  alerts: Alert[];
}

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'severe':
        return <Error fontSize="small" />;
      case 'moderate':
        return <Warning fontSize="small" />;
      default:
        return <Info fontSize="small" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'error';
      case 'moderate':
        return 'warning';
      case 'mild':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        Active Alerts
      </Typography>
      
      {alerts.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          No active alerts
        </Typography>
      ) : (
        <Stack spacing={{ xs: 0.5, sm: 1 }}>
          {alerts.map((alert, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 0.5, sm: 1 },
                padding: { xs: 0.75, sm: 1 },
                borderRadius: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${
                  alert.color === 'white' ? 'rgba(255, 255, 255, 0.3)' :
                  alert.color === 'yellow' ? 'rgba(255, 255, 0, 0.3)' :
                  'rgba(255, 0, 0, 0.3)'
                }`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
                {getSeverityIcon(alert.severity)}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {alert.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
                    {alert.timestamp}
                  </Typography>
                </Box>
                <Chip
                  label={alert.severity}
                  size="small"
                  color={getSeverityColor(alert.severity) as any}
                  variant="outlined"
                  sx={{ 
                    height: { xs: '20px', sm: '24px' },
                    '& .MuiChip-label': {
                      fontSize: { xs: '0.625rem', sm: '0.75rem' },
                      px: { xs: 0.5, sm: 1 }
                    }
                  }}
                />
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default AlertPanel;