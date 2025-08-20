import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore,
  RestartAlt,
  Save,
} from '@mui/icons-material';
import { Config } from '../types';

interface ConfigPanelProps {
  config: Config | null;
  onUpdate: (config: Partial<Config>) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onUpdate }) => {
  const [localConfig, setLocalConfig] = useState<Config | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleChange = (field: keyof Config, value: number) => {
    if (localConfig) {
      setLocalConfig({
        ...localConfig,
        [field]: value,
      });
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    if (localConfig && hasChanges) {
      onUpdate(localConfig);
      setHasChanges(false);
    }
  };

  const handleReset = () => {
    if (config) {
      setLocalConfig(config);
      setHasChanges(false);
    }
  };

  if (!localConfig) {
    return (
      <Box>
        <Typography>Loading configuration...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Configuration</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Reset Changes">
            <IconButton
              size="small"
              onClick={handleReset}
              disabled={!hasChanges}
              color="default"
            >
              <RestartAlt />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            size="small"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={!hasChanges}
            color="primary"
          >
            Save
          </Button>
        </Box>
      </Box>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Eye Detection</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                EAR Threshold: {localConfig.ear_threshold.toFixed(3)}
              </Typography>
              <Slider
                value={localConfig.ear_threshold}
                onChange={(_, value) => handleChange('ear_threshold', value as number)}
                min={0.1}
                max={0.3}
                step={0.01}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Eye Closed Frames: {localConfig.eye_closed_frames_threshold}
              </Typography>
              <Slider
                value={localConfig.eye_closed_frames_threshold}
                onChange={(_, value) => handleChange('eye_closed_frames_threshold', value as number)}
                min={5}
                max={30}
                step={1}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Blink Rate Threshold: {localConfig.blink_rate_threshold}/min
              </Typography>
              <Slider
                value={localConfig.blink_rate_threshold}
                onChange={(_, value) => handleChange('blink_rate_threshold', value as number)}
                min={1}
                max={15}
                step={1}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Yawn Detection</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                MAR Threshold: {localConfig.mar_threshold.toFixed(2)}
              </Typography>
              <Slider
                value={localConfig.mar_threshold}
                onChange={(_, value) => handleChange('mar_threshold', value as number)}
                min={0.3}
                max={1.0}
                step={0.05}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Yawn Frames: {localConfig.yawn_threshold}
              </Typography>
              <Slider
                value={localConfig.yawn_threshold}
                onChange={(_, value) => handleChange('yawn_threshold', value as number)}
                min={1}
                max={10}
                step={1}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Head & Gaze</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Gaze Deviation: {localConfig.gaze_deviation_threshold.toFixed(3)}
              </Typography>
              <Slider
                value={localConfig.gaze_deviation_threshold}
                onChange={(_, value) => handleChange('gaze_deviation_threshold', value as number)}
                min={0.01}
                max={0.2}
                step={0.01}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Head Turn Threshold: {localConfig.head_turn_threshold.toFixed(3)}
              </Typography>
              <Slider
                value={localConfig.head_turn_threshold}
                onChange={(_, value) => handleChange('head_turn_threshold', value as number)}
                min={0.02}
                max={0.2}
                step={0.01}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Hand Near Face (px): {localConfig.hand_near_face_px}
              </Typography>
              <Slider
                value={localConfig.hand_near_face_px}
                onChange={(_, value) => handleChange('hand_near_face_px', value as number)}
                min={50}
                max={400}
                step={10}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Video Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Width"
                type="number"
                value={localConfig.frame_width}
                onChange={(e) => handleChange('frame_width', parseInt(e.target.value))}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Height"
                type="number"
                value={localConfig.frame_height}
                onChange={(e) => handleChange('frame_height', parseInt(e.target.value))}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Scale Factor: {localConfig.scale_factor.toFixed(1)}x
              </Typography>
              <Slider
                value={localConfig.scale_factor}
                onChange={(_, value) => handleChange('scale_factor', value as number)}
                min={0.5}
                max={2.0}
                step={0.1}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Alert Duration: {localConfig.alert_duration}s
              </Typography>
              <Slider
                value={localConfig.alert_duration}
                onChange={(_, value) => handleChange('alert_duration', value as number)}
                min={1}
                max={10}
                step={1}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ConfigPanel;