import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Assessment as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface SystemStats {
  totalUsers: number;
  totalSessions: number;
  totalAlerts: number;
  averageSessionDuration: number;
  userRoleDistribution: { role: string; count: number }[];
  alertsByType: { type: string; count: number }[];
  dailyActivity: { date: string; sessions: number; alerts: number }[];
  topRiskDrivers: { username: string; riskScore: number; alertCount: number }[];
}

const SystemAnalytics: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchSystemStats();
  }, [period]);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all users
      const usersResponse = await api.get('/users/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const users = usersResponse.data;
      
      // Calculate role distribution
      const roleDistribution = users.reduce((acc: any, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      // Fetch system-wide statistics (mock data for now - in real app, create dedicated endpoints)
      const mockStats: SystemStats = {
        totalUsers: users.length,
        totalSessions: 145, // Would come from dedicated endpoint
        totalAlerts: 89,   // Would come from dedicated endpoint
        averageSessionDuration: 2.5 * 3600, // 2.5 hours in seconds
        userRoleDistribution: Object.entries(roleDistribution).map(([role, count]) => ({
          role: role.charAt(0).toUpperCase() + role.slice(1),
          count: count as number
        })),
        alertsByType: [
          { type: 'Drowsiness', count: 45 },
          { type: 'Distraction', count: 32 },
          { type: 'Phone Usage', count: 12 }
        ],
        dailyActivity: [
          { date: '2024-01-15', sessions: 23, alerts: 12 },
          { date: '2024-01-16', sessions: 28, alerts: 8 },
          { date: '2024-01-17', sessions: 31, alerts: 15 },
          { date: '2024-01-18', sessions: 25, alerts: 9 },
          { date: '2024-01-19', sessions: 29, alerts: 11 },
          { date: '2024-01-20', sessions: 33, alerts: 14 },
          { date: '2024-01-21', sessions: 27, alerts: 10 }
        ],
        topRiskDrivers: users
          .filter((user: any) => user.role === 'driver')
          .slice(0, 5)
          .map((user: any, index: number) => ({
            username: user.username,
            riskScore: Math.floor(Math.random() * 100), // Mock risk score
            alertCount: Math.floor(Math.random() * 20) + 5 // Mock alert count
          }))
          .sort((a, b) => b.riskScore - a.riskScore)
      };

      setStats(mockStats);
      
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // In a real implementation, this would generate and download a report
    console.log('Exporting system analytics data...');
    alert('Export functionality would be implemented here');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading || !stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading system analytics...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          System Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={period}
              label="Period"
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="day">Last Day</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            startIcon={<DownloadIcon />}
            onClick={exportData}
            variant="outlined"
          >
            Export Report
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Comprehensive system analytics for the entire Driver Monitoring System.
      </Alert>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalUsers}
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
                <AnalyticsIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Sessions
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.totalSessions}
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
                <WarningIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Alerts
                  </Typography>
                  <Typography variant="h4" color="warning.main">
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
                <TrendingUpIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Session
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {Math.round(stats.averageSessionDuration / 3600 * 10) / 10}h
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* User Role Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              User Role Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={stats.userRoleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, count }) => `${role}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.userRoleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Alert Types Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Alert Types Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={stats.alertsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Daily Activity Trend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Daily Activity Trend
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={stats.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#8884d8" 
                  name="Sessions"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="alerts" 
                  stroke="#82ca9d" 
                  name="Alerts"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Risk Drivers */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Risk Drivers
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topRiskDrivers} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="username" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="riskScore" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemAnalytics;