import React from 'react';
import { Box, Typography, LinearProgress, Grid, Chip } from '@mui/material';

interface MetricsPanelProps {
  metrics: Record<string, number>;
  states: Record<string, any>;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, states }) => {
  const formatMetricValue = (value: number): string => {
    return value.toFixed(3);
  };

  const getEARStatus = (ear: number): { label: string; color: string } => {
    if (ear < 0.14) return { label: 'Closed', color: '#f44336' };
    if (ear < 0.20) return { label: 'Drowsy', color: '#ff9800' };
    return { label: 'Normal', color: '#4caf50' };
  };

  const getMARStatus = (mar: number): { label: string; color: string } => {
    if (mar > 0.6) return { label: 'Yawning', color: '#ff9800' };
    return { label: 'Normal', color: '#4caf50' };
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        Real-time Metrics
      </Typography>
      
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        {/* Eye Aspect Ratio */}
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Eye Aspect Ratio (EAR)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min((metrics.avg_ear || 0) * 500, 100)}
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getEARStatus(metrics.avg_ear || 0).color,
                },
              }}
            />
            <Typography variant="caption" sx={{ minWidth: { xs: 40, sm: 50 }, fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
              {metrics.avg_ear ? formatMetricValue(metrics.avg_ear) : '0.000'}
            </Typography>
            <Chip
              label={getEARStatus(metrics.avg_ear || 0).label}
              size="small"
              sx={{
                backgroundColor: getEARStatus(metrics.avg_ear || 0).color,
                color: 'white',
              }}
            />
          </Box>
        </Grid>

        {/* Mouth Aspect Ratio */}
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Mouth Aspect Ratio (MAR)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min((metrics.mar || 0) * 100, 100)}
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getMARStatus(metrics.mar || 0).color,
                },
              }}
            />
            <Typography variant="caption" sx={{ minWidth: { xs: 40, sm: 50 }, fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
              {metrics.mar ? formatMetricValue(metrics.mar) : '0.000'}
            </Typography>
            <Chip
              label={getMARStatus(metrics.mar || 0).label}
              size="small"
              sx={{
                backgroundColor: getMARStatus(metrics.mar || 0).color,
                color: 'white',
              }}
            />
          </Box>
        </Grid>

        {/* Blink Count */}
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Blinks/min
          </Typography>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {metrics.blink_count || 0}
          </Typography>
        </Grid>

        {/* Active States */}
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Active States
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {states.eyes_closed && (
              <Chip label="Eyes Closed" size="small" color="error" />
            )}
            {states.yawning && (
              <Chip label="Yawning" size="small" color="warning" />
            )}
            {states.head_turn && (
              <Chip label="Head Turn" size="small" color="warning" />
            )}
            {states.head_droop && (
              <Chip label="Head Droop" size="small" color="error" />
            )}
            {states.phone_use && (
              <Chip label="Phone" size="small" color="error" />
            )}
            {states.texting && (
              <Chip label="Texting" size="small" color="error" />
            )}
            {states.gaze_deviation && (
              <Chip label="Gaze Dev" size="small" color="warning" />
            )}
            {Object.keys(states).length === 0 && (
              <Chip label="Normal" size="small" color="success" />
            )}
          </Box>
        </Grid>

        {/* Overall Status */}
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Overall Status
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 } }}>
            {states.drowsiness && (
              <Chip
                label={`${states.drowsiness.toUpperCase()} DROWSINESS`}
                color={states.drowsiness === 'severe' ? 'error' : 'warning'}
              />
            )}
            {states.distraction && (
              <Chip
                label={`${states.distraction.toUpperCase()} DISTRACTION`}
                color={states.distraction === 'severe' ? 'error' : 'warning'}
              />
            )}
            {!states.drowsiness && !states.distraction && (
              <Chip label="NORMAL DRIVING" color="success" />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MetricsPanel;