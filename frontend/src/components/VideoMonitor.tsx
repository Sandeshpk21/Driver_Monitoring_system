import React, { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { Videocam, VideocamOff, CameraAlt, PlayArrow, Stop, Refresh, VolumeUp } from '@mui/icons-material';
import { DetectionResult } from '../types';

interface VideoMonitorProps {
  onFrameCapture: (imageData: string) => void;
  detectionResult: DetectionResult | null;
  onCalibrate: (calibrationData: any) => void;
  onStartRecalibration: () => void;
  isCalibrated: boolean;
  isMonitoring: boolean;
  isConnected: boolean;
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
  soundAlertTriggered?: boolean;
  severeAlertCount?: number;
  onTestSound?: () => void;
}

const VideoMonitor: React.FC<VideoMonitorProps> = ({
  onFrameCapture,
  detectionResult,
  onCalibrate,
  onStartRecalibration,
  isCalibrated,
  isMonitoring,
  isConnected,
  onStartMonitoring,
  onStopMonitoring,
  soundAlertTriggered = false,
  severeAlertCount = 0,
  onTestSound,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user"
  };

  const captureFrame = useCallback(() => {
    if (webcamRef.current && isStreaming) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onFrameCapture(imageSrc);
      }
    }
  }, [onFrameCapture, isStreaming]);

  useEffect(() => {
    // Start capturing frames at 15 FPS
    if (isStreaming) {
      intervalRef.current = setInterval(captureFrame, 67); // ~15 FPS
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [captureFrame, isStreaming]);

  useEffect(() => {
    // Draw landmarks on canvas if enabled and monitoring
    if (showLandmarks && isMonitoring && detectionResult && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw face landmarks
      if (detectionResult.face_landmarks && detectionResult.face_landmarks.length > 0) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        
        // Draw face mesh connections
        detectionResult.face_landmarks.forEach((landmark) => {
          ctx.beginPath();
          ctx.arc(
            landmark.x * canvas.width,
            landmark.y * canvas.height,
            2,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = '#00ff00';
          ctx.fill();
        });
      }

      // Draw hand landmarks
      if (detectionResult.hand_landmarks) {
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        
        detectionResult.hand_landmarks.forEach((hand) => {
          hand.forEach((landmark) => {
            ctx.beginPath();
            ctx.arc(
              landmark.x * canvas.width,
              landmark.y * canvas.height,
              3,
              0,
              2 * Math.PI
            );
            ctx.fillStyle = '#ff00ff';
            ctx.fill();
          });
        });
      }
    } else if (canvasRef.current && !isMonitoring) {
      // Clear canvas when monitoring stops
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [detectionResult, showLandmarks, isMonitoring]);

  const handleCalibrate = () => {
    if (detectionResult?.calibration_data) {
      onCalibrate({
        gaze_center: detectionResult.calibration_data.gaze_x,
        head_center_x: detectionResult.calibration_data.head_x,
        head_center_y: detectionResult.calibration_data.head_y,
      });
    }
  };

  const renderAlertOverlay = () => {
    if (!isMonitoring || !detectionResult?.alerts || detectionResult.alerts.length === 0) {
      return null;
    }

    return (
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 10, sm: 20 },
          left: { xs: 10, sm: 20 },
          right: { xs: 10, sm: 'auto' },
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 0.5, sm: 1 },
          maxWidth: { xs: '90%', sm: '400px' },
        }}
      >
        {detectionResult.alerts.map((alert, index) => (
          <Box
            key={index}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: { xs: '6px 12px', sm: '8px 16px' },
              borderRadius: 1,
              border: `2px solid ${
                alert.color === 'white' ? '#ffffff' :
                alert.color === 'yellow' ? '#ffff00' :
                '#ff0000'
              }`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: alert.color === 'white' ? '#ffffff' :
                       alert.color === 'yellow' ? '#ffff00' :
                       '#ff0000',
                fontWeight: 'bold',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              {alert.timestamp} {alert.message}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const renderCalibrationOverlay = () => {
    if (!detectionResult?.calibration_mode) {
      return null;
    }

    return (
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 60, sm: 40 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 0, 0.1)',
          border: '2px solid #ffff00',
          padding: { xs: 1.5, sm: 2 },
          borderRadius: 1,
          width: { xs: '90%', sm: 'auto' },
          maxWidth: '300px',
        }}
      >
        <Typography variant="body1" sx={{ color: '#ffff00', mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' }, textAlign: 'center' }}>
          Align face naturally and click calibrate
        </Typography>
        <Button
          variant="contained"
          color="warning"
          onClick={handleCalibrate}
          disabled={!detectionResult?.calibration_data}
          fullWidth
        >
          Calibrate
        </Button>
      </Box>
    );
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
        
        {/* Canvas for landmarks overlay */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            display: showLandmarks ? 'block' : 'none',
          }}
        />

        {/* Alert overlay */}
        {renderAlertOverlay()}

        {/* Calibration overlay */}
        {renderCalibrationOverlay()}

        {/* Control buttons */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 5, sm: 10 },
            right: { xs: 5, sm: 10 },
            left: { xs: 5, sm: 'auto' },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 0.5, sm: 1 },
            zIndex: 10,
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          {/* Start/Stop Monitoring Button */}
          <Button
            variant="contained"
            onClick={isMonitoring ? onStopMonitoring : onStartMonitoring}
            startIcon={isMonitoring ? <Stop /> : <PlayArrow />}
            sx={{
              backgroundColor: isMonitoring ? '#f44336' : '#4caf50',
              '&:hover': {
                backgroundColor: isMonitoring ? '#d32f2f' : '#388e3c',
              },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              padding: { xs: '6px 12px', sm: '8px 16px' },
            }}
          >
            {isMonitoring ? 'Stop' : 'Start'}
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 0.5 }}>
              Monitoring
            </Box>
          </Button>
          
          <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
            <IconButton
              onClick={() => setIsStreaming(!isStreaming)}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: isStreaming ? '#4caf50' : '#f44336',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
                padding: { xs: '6px', sm: '8px' },
              }}
              title={isStreaming ? 'Pause Video' : 'Resume Video'}
            >
              {isStreaming ? <Videocam /> : <VideocamOff />}
            </IconButton>
            
            <IconButton
              onClick={() => setShowLandmarks(!showLandmarks)}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: showLandmarks ? '#4caf50' : '#ffffff',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
                padding: { xs: '6px', sm: '8px' },
              }}
              title="Toggle Landmarks"
            >
              <CameraAlt />
            </IconButton>
            
            {/* Recalibration button - only show when already calibrated */}
            {isCalibrated && (
              <IconButton
                onClick={onStartRecalibration}
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: '#ffeb3b',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                  padding: { xs: '6px', sm: '8px' },
                }}
                title="Recalibrate"
              >
                <Refresh />
              </IconButton>
            )}
            
            {/* Test Sound button */}
            {onTestSound && (
              <IconButton
                onClick={onTestSound}
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: '#4caf50',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                  padding: { xs: '6px', sm: '8px' },
                }}
                title="Test Sound Alert"
              >
                <VolumeUp />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Status indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 5, sm: 10 },
            right: { xs: 5, sm: 10 },
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { xs: '6px 10px', sm: '8px 12px' },
            borderRadius: 1,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Typography variant="caption" sx={{ color: isConnected ? '#4caf50' : '#f44336', fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
            {isConnected ? '● Connected' : '● Disconnected'}
          </Typography>
          <Typography variant="caption" sx={{ color: isMonitoring ? '#4caf50' : '#ff9800', fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
            {isMonitoring ? '● Monitoring Active' : '● Monitoring Stopped'}
          </Typography>
          <Typography variant="caption" sx={{ color: isCalibrated ? '#4caf50' : '#ff9800', fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
            {isCalibrated ? '✓ Calibrated' : '⚠ Calibration Required'}
          </Typography>
          
          {/* Sound Alert Status */}
          {isMonitoring && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: soundAlertTriggered ? '#ff1744' : (severeAlertCount > 0 ? '#ff9800' : '#4caf50'),
                fontSize: { xs: '0.625rem', sm: '0.75rem' },
                fontWeight: soundAlertTriggered ? 'bold' : 'normal'
              }}
            >
              {soundAlertTriggered ? '🔊 Sound Alert!' : 
               severeAlertCount === 1 ? '⏳ Grace Period' :
               severeAlertCount === 2 ? '⚠ Initial Alert' :
               severeAlertCount === 3 ? '🚨 Maximum Alert' :
               '🔇 Audio Ready'}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default VideoMonitor;