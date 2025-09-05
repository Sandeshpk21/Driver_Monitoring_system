import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Warning,
  Speed,
  AccessTime,
  DirectionsCar,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

interface AnalyticsData {
  period: string;
  total_alerts: number;
  drowsiness_alerts: number;
  distraction_alerts: number;
  severity_breakdown: {
    mild: number;
    moderate: number;
    severe: number;
  };
  hourly_distribution: Record<number, number>;
  most_common_alerts: Array<{ alert: string; count: number }>;
  risk_score: number;
  total_monitoring_time: number;
  sessions_count: number;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('week');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/alerts/analytics?period=${period}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getRiskColor = (score: number): string => {
    if (score < 30) return '#4caf50';
    if (score < 60) return '#ff9800';
    return '#f44336';
  };

  if (loading || !analytics) {
    return (
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <LinearProgress />
      </Container>
    );
  }

  // Prepare chart data
  const hourlyData = Object.entries(analytics.hourly_distribution).map(([hour, count]) => ({
    hour: `${hour}:00`,
    alerts: count,
  }));

  const severityData = [
    { name: 'Mild', value: analytics.severity_breakdown.mild, color: '#4caf50' },
    { name: 'Moderate', value: analytics.severity_breakdown.moderate, color: '#ff9800' },
    { name: 'Severe', value: analytics.severity_breakdown.severe, color: '#f44336' },
  ];

  const alertTypeData = [
    { name: 'Drowsiness', value: analytics.drowsiness_alerts, color: '#3f51b5' },
    { name: 'Distraction', value: analytics.distraction_alerts, color: '#9c27b0' },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 1, sm: 2, md: 3 }, mb: { xs: 1, sm: 2, md: 3 }, px: { xs: 1, sm: 2 } }}>
      {/* Header */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, backgroundColor: '#1a1a1a' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 0 } }}>
          <Box>
            <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Personal Analytics</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Your driving performance metrics and insights
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={period}
              label="Period"
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="day">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Driver Information */}
        <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'rgba(144, 202, 249, 0.1)', borderRadius: 1 }}>
          <Typography variant="body2" color="primary">
            📊 Viewing personal analytics for: {user?.username}
          </Typography>
        </Box>
      </Paper>

      {/* Key Metrics */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                <Warning sx={{ color: '#ff9800', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography color="text.secondary" variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Total Alerts
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>{analytics.total_alerts}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                <Speed sx={{ color: getRiskColor(analytics.risk_score), mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography color="text.secondary" variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Risk Score
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: getRiskColor(analytics.risk_score), fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                {analytics.risk_score.toFixed(0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                <AccessTime sx={{ color: '#4caf50', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography color="text.secondary" variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Monitoring Time
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontSize: { xs: '1rem', sm: '1.5rem', md: '2.125rem' } }}>
                {formatTime(analytics.total_monitoring_time)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                <DirectionsCar sx={{ color: '#2196f3', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                <Typography color="text.secondary" variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Sessions
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>{analytics.sessions_count}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        {/* Hourly Distribution */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#1a1a1a' }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Hourly Alert Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="hour" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                />
                <Bar dataKey="alerts" fill="#90caf9" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Alert Types */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#1a1a1a' }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Alert Types
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={alertTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {alertTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Severity Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#1a1a1a' }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Severity Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Most Common Alerts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#1a1a1a' }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Most Common Alerts
            </Typography>
            <Box sx={{ mt: 2 }}>
              {analytics.most_common_alerts.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Typography variant="body2">{item.alert}</Typography>
                  <Chip
                    label={item.count}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;