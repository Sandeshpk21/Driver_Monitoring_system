import React from 'react';
import { Box, Typography, Grid, Chip } from '@mui/material';

interface MetricsPanelProps {
  metrics: Record<string, number>;
  states: Record<string, any>;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, states }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        Driver Status
      </Typography>
      
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        {/* Overall Status - Moved to top for priority */}
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Overall Status
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 } }}>
            {states.drowsiness && (
              <Chip
                label={`${states.drowsiness.toUpperCase()} DROWSINESS`}
                color={states.drowsiness === 'severe' ? 'error' : 'warning'}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              />
            )}
            {states.distraction && (
              <Chip
                label={`${states.distraction.toUpperCase()} DISTRACTION`}
                color={states.distraction === 'severe' ? 'error' : 'warning'}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              />
            )}
            {!states.drowsiness && !states.distraction && (
              <Chip 
                label="NORMAL DRIVING" 
                color="success"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              />
            )}
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
            {Object.keys(states).filter(key => !['drowsiness', 'distraction'].includes(key)).length === 0 && (
              <Chip label="Normal" size="small" color="success" />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MetricsPanel;