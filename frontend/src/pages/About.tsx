import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  RemoveRedEye,
  Face,
  PanTool,
  Warning,
  Speed,
  Security,
  Code,
} from '@mui/icons-material';

const About: React.FC = () => {
  const features = [
    {
      icon: <RemoveRedEye />,
      title: 'Eye Tracking',
      description: 'Monitors eye closure, blink rate, and detects drowsiness using Eye Aspect Ratio (EAR)',
    },
    {
      icon: <Face />,
      title: 'Facial Analysis',
      description: 'Detects yawning, head pose, and gaze direction using 468 facial landmarks',
    },
    {
      icon: <PanTool />,
      title: 'Hand Detection',
      description: 'Identifies phone usage, texting, and hands near face behaviors',
    },
    {
      icon: <Warning />,
      title: 'Alert System',
      description: 'Multi-level alerts with color-coded severity indicators',
    },
  ];

  const technologies = [
    { name: 'FastAPI', category: 'Backend' },
    { name: 'React', category: 'Frontend' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'MediaPipe', category: 'AI/ML' },
    { name: 'OpenCV', category: 'Computer Vision' },
    { name: 'WebSocket', category: 'Real-time' },
    { name: 'Material-UI', category: 'UI Framework' },
  ];

  const metrics = [
    { label: 'Processing Speed', value: '15 FPS' },
    { label: 'Facial Landmarks', value: '468 Points' },
    { label: 'Detection Accuracy', value: 'High' },
    { label: 'Latency', value: '< 100ms' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 3, backgroundColor: '#1a1a1a', textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Driver Monitoring System
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Advanced Real-time Driver State Detection
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Chip label="Version 1.0.0" color="primary" sx={{ mr: 1 }} />
          <Chip label="AI-Powered" color="secondary" sx={{ mr: 1 }} />
          <Chip label="Real-time" color="success" />
        </Box>
      </Paper>

      {/* Features */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#1a1a1a' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Key Features
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    backgroundColor: 'primary.main',
                    borderRadius: 2,
                    p: 1,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {feature.icon}
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Detection Capabilities */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#1a1a1a' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Detection Capabilities
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Drowsiness Detection
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Eye closure duration monitoring" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Blink rate analysis" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Yawn detection" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Head drooping detection" />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Distraction Detection
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Gaze deviation tracking" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Head turn monitoring" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Phone usage detection" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Texting behavior identification" />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Technologies */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#1a1a1a' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Technologies Used
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {technologies.map((tech, index) => (
            <Chip
              key={index}
              label={tech.name}
              variant="outlined"
              color={
                tech.category === 'Backend' ? 'primary' :
                tech.category === 'Frontend' ? 'secondary' :
                tech.category === 'AI/ML' ? 'success' : 'default'
              }
              sx={{ borderWidth: 2 }}
            />
          ))}
        </Box>
      </Paper>

      {/* Performance Metrics */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#1a1a1a' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Performance Metrics
        </Typography>
        <Grid container spacing={3}>
          {metrics.map((metric, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main" gutterBottom>
                  {metric.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metric.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Safety Note */}
      <Paper sx={{ p: 3, backgroundColor: '#1a1a1a', border: '2px solid #ff9800' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Security sx={{ mr: 2, color: '#ff9800' }} />
          <Typography variant="h6">
            Safety Notice
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          This system is designed to assist in monitoring driver alertness and should be used as a supplementary safety tool. 
          It does not replace safe driving practices, adequate rest, or professional medical advice. 
          Always prioritize road safety and follow traffic regulations.
        </Typography>
      </Paper>
    </Container>
  );
};

export default About;