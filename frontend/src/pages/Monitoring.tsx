import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Box,
} from '@mui/material';
import VideoMonitor from '../components/VideoMonitor';
import AlertPanel from '../components/AlertPanel';
import MetricsPanel from '../components/MetricsPanel';
import { WebSocketService } from '../services/websocket';
import { DetectionResult } from '../types';

const Monitoring: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const wsService = useRef<WebSocketService | null>(null);

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    
    // Initialize WebSocket service with token
    // Use relative URL to go through Vite proxy, but construct proper WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    wsService.current = new WebSocketService(wsUrl, token || undefined);
    
    wsService.current.onAuthSuccess = () => {
      console.log('WebSocket authenticated successfully');
    };
    
    wsService.current.onAuthError = (message) => {
      console.error('WebSocket auth error:', message);
      setIsConnected(false);
    };
    
    wsService.current.onMessage = (data: any) => {
      if (data.type === 'monitoring_status') {
        setIsMonitoring(data.is_monitoring);
      } else if (data.type === 'calibration_complete') {
        setIsCalibrated(true);
      } else {
        // Detection result
        setDetectionResult(data);
        if (!data.calibration_mode && !isCalibrated) {
          setIsCalibrated(true);
        }
        // Update monitoring state if present in response
        if (data.is_monitoring !== undefined) {
          setIsMonitoring(data.is_monitoring);
        }
      }
    };

    wsService.current.onConnect = () => {
      setIsConnected(true);
    };

    wsService.current.onDisconnect = () => {
      setIsConnected(false);
    };

    return () => {
      if (wsService.current) {
        wsService.current.disconnect();
      }
    };
  }, []);

  const handleFrameCapture = (imageData: string) => {
    if (wsService.current && isConnected) {
      wsService.current.sendFrame(imageData);
    }
  };

  const handleStartMonitoring = () => {
    if (wsService.current && isConnected) {
      wsService.current.startMonitoring();
    }
  };

  const handleStopMonitoring = () => {
    if (wsService.current && isConnected) {
      wsService.current.stopMonitoring();
    }
  };

  const handleCalibrate = (calibrationData: any) => {
    if (wsService.current && isConnected) {
      wsService.current.calibrate(calibrationData);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 1, sm: 2, md: 3 }, mb: { xs: 1, sm: 2, md: 3 }, px: { xs: 1, sm: 2 } }}>
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        {/* Main Video Feed */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ 
            p: { xs: 1, sm: 2 }, 
            backgroundColor: '#1a1a1a', 
            height: { xs: 'auto', lg: '100%' },
            minHeight: { xs: '300px', sm: '400px', md: '500px' }
          }}>
            <VideoMonitor
              onFrameCapture={handleFrameCapture}
              detectionResult={detectionResult}
              onCalibrate={handleCalibrate}
              isCalibrated={isCalibrated}
              isMonitoring={isMonitoring}
              isConnected={isConnected}
              onStartMonitoring={handleStartMonitoring}
              onStopMonitoring={handleStopMonitoring}
            />
          </Paper>
        </Grid>

        {/* Side Panels */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={{ xs: 1, sm: 2 }} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
            {/* Alerts */}
            <Grid item xs={12} sm={6} lg={12}>
              <Paper sx={{ p: { xs: 1.5, sm: 2 }, backgroundColor: '#1a1a1a', maxHeight: { xs: 200, sm: 250, lg: 300 }, overflow: 'auto' }}>
                <AlertPanel alerts={detectionResult?.alerts || []} />
              </Paper>
            </Grid>

            {/* Metrics */}
            <Grid item xs={12}>
              <Paper sx={{ p: { xs: 1.5, sm: 2 }, backgroundColor: '#1a1a1a' }}>
                <MetricsPanel 
                  metrics={detectionResult?.metrics || {}}
                  states={detectionResult?.states || {}}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Monitoring;