import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  Button,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Warning as WarningIcon,
  CheckCircle as SafeIcon,
  Person as PersonIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { User } from '../types';

interface DriverStatus {
  user: User;
  isActive: boolean;
  currentSession: {
    id: string;
    duration: number;
    alertCount: number;
    lastAlert?: string;
  } | null;
  todayStats: {
    totalTime: number;
    alertCount: number;
    riskScore: number;
  };
}

const FleetDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [drivers, setDrivers] = useState<DriverStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDrivers: 0,
    activeDrivers: 0,
    totalAlerts: 0,
    averageRiskScore: 0,
  });

  useEffect(() => {
    fetchFleetData();
    // Refresh every 30 seconds for real-time data
    const interval = setInterval(fetchFleetData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchFleetData = async () => {
    try {
      setLoading(true);
      
      // Fetch all drivers
      const usersResponse = await api.get('/users/?role=driver', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const driverUsers = usersResponse.data;
      
      // Fetch current sessions and stats for each driver
      const driverStatuses: DriverStatus[] = [];
      let totalAlerts = 0;
      let totalRiskScore = 0;
      let activeCount = 0;

      for (const driver of driverUsers) {
        try {
          // Get user statistics
          const statsResponse = await api.get(`/users/${driver.id}/statistics`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Get recent sessions to check if currently active
          const sessionsResponse = await api.get(`/alerts/sessions?user_id=${driver.id}&limit=1`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const currentSession = sessionsResponse.data[0] || null;
          const isActive = currentSession && !currentSession.end_time;
          
          if (isActive) activeCount++;

          const todayStats = {
            totalTime: statsResponse.data.total_monitoring_time_seconds || 0,
            alertCount: statsResponse.data.total_alerts || 0,
            riskScore: Math.min(100, Math.max(0, statsResponse.data.total_alerts * 5)) // Simple risk calculation
          };

          totalAlerts += todayStats.alertCount;
          totalRiskScore += todayStats.riskScore;

          driverStatuses.push({
            user: driver,
            isActive,
            currentSession: isActive ? {
              id: currentSession.id,
              duration: currentSession.duration_seconds || 0,
              alertCount: currentSession.total_alerts || 0,
              lastAlert: currentSession.updated_at
            } : null,
            todayStats
          });
        } catch (error) {
          // If stats fail for individual driver, add them with empty stats
          driverStatuses.push({
            user: driver,
            isActive: false,
            currentSession: null,
            todayStats: { totalTime: 0, alertCount: 0, riskScore: 0 }
          });
        }
      }

      setDrivers(driverStatuses);
      setStats({
        totalDrivers: driverUsers.length,
        activeDrivers: activeCount,
        totalAlerts,
        averageRiskScore: driverUsers.length > 0 ? totalRiskScore / driverUsers.length : 0
      });

    } catch (error) {
      console.error('Error fetching fleet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 20) return 'success';
    if (score <= 50) return 'warning';
    return 'error';
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Fleet Dashboard
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchFleetData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {user?.role === 'manager' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Real-time monitoring dashboard for your fleet. Data refreshes every 30 seconds.
        </Alert>
      )}

      {/* Fleet Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Drivers
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalDrivers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SpeedIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Drivers
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {stats.activeDrivers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Alerts Today
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {stats.totalAlerts}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimelineIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Risk Score
                  </Typography>
                  <Typography variant="h5" color={`${getRiskColor(stats.averageRiskScore)}.main`}>
                    {Math.round(stats.averageRiskScore)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Drivers Table */}
      <Paper sx={{ mt: 3 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Driver Status Overview
          </Typography>
        </Box>
        
        {loading ? (
          <LinearProgress />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Driver</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Session Duration</TableCell>
                  <TableCell>Today's Alerts</TableCell>
                  <TableCell>Risk Score</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {driver.user.username[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {driver.user.username}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {driver.user.full_name || driver.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={driver.isActive ? <SafeIcon /> : undefined}
                        label={driver.isActive ? 'Active' : 'Offline'}
                        color={driver.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      {driver.currentSession ? (
                        formatDuration(driver.currentSession.duration)
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Not active
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {driver.todayStats.alertCount > 0 && (
                          <WarningIcon color="warning" sx={{ mr: 1, fontSize: 16 }} />
                        )}
                        {driver.todayStats.alertCount}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, driver.todayStats.riskScore)}
                          color={getRiskColor(driver.todayStats.riskScore)}
                          sx={{ flexGrow: 1, mr: 1 }}
                        />
                        <Typography variant="body2">
                          {Math.round(driver.todayStats.riskScore)}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            // Navigate to driver's detailed view
                            // This could open a modal or navigate to a detailed page
                            console.log('View driver details:', driver.user.id);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                
                {drivers.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                        No drivers found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default FleetDashboard;