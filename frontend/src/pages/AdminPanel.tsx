import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Schedule as ScheduleIcon,
  PersonAdd as PersonAddIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  activeUsers: number;
  activeSessions: number;
  totalAlerts: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  databaseConnections: number;
}

interface AdminStats {
  systemHealth: SystemHealth;
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    usersByRole: { role: string; count: number }[];
  };
  alertStats: {
    totalAlerts: number;
    alertsToday: number;
    criticalAlerts: number;
    alertsByType: { type: string; count: number }[];
  };
  sessionStats: {
    activeSessions: number;
    totalSessions: number;
    avgSessionDuration: number;
    sessionsToday: number;
  };
  recentActivity: {
    id: string;
    type: string;
    user: string;
    action: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'error';
  }[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminPanel: React.FC = () => {
  const { token, user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAdminData();
    
    // Set up auto-refresh every 30 seconds for real-time data
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch all required data in parallel
      const [usersResponse, alertsResponse] = await Promise.all([
        api.get('/users/', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/alerts/history?limit=100', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const users = usersResponse.data;
      const alerts = alertsResponse.data;

      // Calculate system health metrics (simulated for now)
      const mockSystemHealth: SystemHealth = {
        status: 'healthy',
        uptime: '7d 14h 23m',
        activeUsers: users.filter((u: any) => u.is_active).length,
        activeSessions: Math.floor(Math.random() * 15) + 5,
        totalAlerts: alerts.length,
        cpuUsage: Math.floor(Math.random() * 30) + 20,
        memoryUsage: Math.floor(Math.random() * 40) + 30,
        diskUsage: Math.floor(Math.random() * 20) + 40,
        databaseConnections: 8,
      };

      // Process user statistics
      const roleDistribution = users.reduce((acc: any, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      const userStats = {
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.is_active).length,
        newUsersToday: Math.floor(Math.random() * 5), // Simulate new users
        usersByRole: Object.entries(roleDistribution).map(([role, count]) => ({
          role: role.charAt(0).toUpperCase() + role.slice(1),
          count: count as number
        }))
      };

      // Process alert statistics
      const today = new Date();
      const todayAlerts = alerts.filter((alert: any) => {
        const alertDate = new Date(alert.timestamp);
        return alertDate.toDateString() === today.toDateString();
      });

      const alertTypeDistribution = alerts.reduce((acc: any, alert: any) => {
        acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
        return acc;
      }, {});

      const alertStats = {
        totalAlerts: alerts.length,
        alertsToday: todayAlerts.length,
        criticalAlerts: alerts.filter((a: any) => a.severity === 'severe').length,
        alertsByType: Object.entries(alertTypeDistribution).map(([type, count]) => ({
          type: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count: count as number
        }))
      };

      // Mock session statistics
      const sessionStats = {
        activeSessions: mockSystemHealth.activeSessions,
        totalSessions: Math.floor(Math.random() * 500) + 1000,
        avgSessionDuration: 2.3, // hours
        sessionsToday: Math.floor(Math.random() * 50) + 20
      };

      // Generate recent activity (mock data)
      const recentActivity = [
        {
          id: '1',
          type: 'user_login',
          user: 'john.doe',
          action: 'Logged into system',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          severity: 'info' as const
        },
        {
          id: '2',
          type: 'alert_triggered',
          user: 'jane.smith',
          action: 'Drowsiness alert triggered',
          timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
          severity: 'warning' as const
        },
        {
          id: '3',
          type: 'user_created',
          user: 'admin',
          action: 'Created new user: mike.wilson',
          timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
          severity: 'info' as const
        },
        {
          id: '4',
          type: 'system_error',
          user: 'system',
          action: 'Database connection timeout',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          severity: 'error' as const
        },
        {
          id: '5',
          type: 'config_change',
          user: user?.username || 'admin',
          action: 'Updated alert thresholds',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          severity: 'info' as const
        }
      ];

      setAdminStats({
        systemHealth: mockSystemHealth,
        userStats,
        alertStats,
        sessionStats,
        recentActivity
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'info';
    }
  };

  if (loading || !adminStats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading admin panel...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        p: 3 
      }}>
        <Typography variant="h4" component="h1">
          Admin Panel
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip 
            icon={<CheckCircleIcon />}
            label={`System ${adminStats.systemHealth.status.toUpperCase()}`}
            color={getStatusColor(adminStats.systemHealth.status)}
            variant="outlined"
          />
          <IconButton 
            onClick={fetchAdminData} 
            disabled={refreshing}
            title="Refresh data"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin panel tabs">
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<PeopleIcon />} label="Users" />
          <Tab icon={<AnalyticsIcon />} label="Analytics" />
          <Tab icon={<NotificationsIcon />} label="Alerts" />
          <Tab icon={<SettingsIcon />} label="Settings" />
          <Tab icon={<SecurityIcon />} label="Security" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        {/* Overview Dashboard */}
        <SystemOverviewDashboard adminStats={adminStats} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* User Management */}
        <UserManagementPanel adminStats={adminStats} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Analytics Hub */}
        <AnalyticsHub adminStats={adminStats} />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Alert Management */}
        <AlertManagementPanel adminStats={adminStats} />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {/* System Configuration */}
        <SystemConfigurationPanel />
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        {/* Security & Audit */}
        <SecurityAuditPanel adminStats={adminStats} />
      </TabPanel>
    </Box>
  );
};

// System Overview Dashboard Component
const SystemOverviewDashboard: React.FC<{ adminStats: AdminStats }> = ({ adminStats }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info': return <InfoIcon color="info" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <CheckCircleIcon color="success" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Grid container spacing={3}>
      {/* System Health Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MemoryIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">System Health</Typography>
            </Box>
            <Typography variant="h4" color="primary">
              {adminStats.systemHealth.status.toUpperCase()}
            </Typography>
            <Typography color="textSecondary">
              Uptime: {adminStats.systemHealth.uptime}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">Active Users</Typography>
            </Box>
            <Typography variant="h4" color="success.main">
              {adminStats.systemHealth.activeUsers}
            </Typography>
            <Typography color="textSecondary">
              {adminStats.userStats.totalUsers} total users
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScheduleIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">Active Sessions</Typography>
            </Box>
            <Typography variant="h4" color="info.main">
              {adminStats.systemHealth.activeSessions}
            </Typography>
            <Typography color="textSecondary">
              {adminStats.sessionStats.sessionsToday} today
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Alerts Today</Typography>
            </Box>
            <Typography variant="h4" color="warning.main">
              {adminStats.alertStats.alertsToday}
            </Typography>
            <Typography color="textSecondary">
              {adminStats.alertStats.criticalAlerts} critical
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* System Resources */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: 300 }}>
          <Typography variant="h6" gutterBottom>
            System Resources
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">CPU Usage</Typography>
                <Typography variant="body2">{adminStats.systemHealth.cpuUsage}%</Typography>
              </Box>
              <Box sx={{ 
                width: '100%', 
                height: 8, 
                backgroundColor: 'grey.300', 
                borderRadius: 1 
              }}>
                <Box sx={{ 
                  width: `${adminStats.systemHealth.cpuUsage}%`, 
                  height: '100%', 
                  backgroundColor: 'primary.main', 
                  borderRadius: 1 
                }} />
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Memory Usage</Typography>
                <Typography variant="body2">{adminStats.systemHealth.memoryUsage}%</Typography>
              </Box>
              <Box sx={{ 
                width: '100%', 
                height: 8, 
                backgroundColor: 'grey.300', 
                borderRadius: 1 
              }}>
                <Box sx={{ 
                  width: `${adminStats.systemHealth.memoryUsage}%`, 
                  height: '100%', 
                  backgroundColor: 'success.main', 
                  borderRadius: 1 
                }} />
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Disk Usage</Typography>
                <Typography variant="body2">{adminStats.systemHealth.diskUsage}%</Typography>
              </Box>
              <Box sx={{ 
                width: '100%', 
                height: 8, 
                backgroundColor: 'grey.300', 
                borderRadius: 1 
              }}>
                <Box sx={{ 
                  width: `${adminStats.systemHealth.diskUsage}%`, 
                  height: '100%', 
                  backgroundColor: 'warning.main', 
                  borderRadius: 1 
                }} />
              </Box>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: 300 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List sx={{ maxHeight: 220, overflow: 'auto' }}>
            {adminStats.recentActivity.map((activity) => (
              <ListItem key={activity.id} sx={{ px: 0 }}>
                <ListItemIcon>
                  {getSeverityIcon(activity.severity)}
                </ListItemIcon>
                <ListItemText
                  primary={activity.action}
                  secondary={`${activity.user} • ${formatTimeAgo(activity.timestamp)}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => {/* Handle create user */}}
              >
                Create User
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {/* Handle system report */}}
              >
                System Report
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<NotificationsIcon />}
                onClick={() => {/* Handle send notification */}}
              >
                Send Notification
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => {/* Handle system settings */}}
              >
                System Settings
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

// User Management Panel Component
const UserManagementPanel: React.FC<{ adminStats: AdminStats }> = ({ adminStats }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'driver',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      setLoading(true);
      
      switch (action) {
        case 'activate':
          for (const userId of selectedUsers) {
            await api.patch(`/users/${userId}/toggle-active`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
          break;
        case 'deactivate':
          for (const userId of selectedUsers) {
            await api.patch(`/users/${userId}/toggle-active`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
            for (const userId of selectedUsers) {
              await api.delete(`/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
            }
          }
          break;
        case 'role_driver':
          for (const userId of selectedUsers) {
            await api.patch(`/users/${userId}`, { role: 'driver' }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
          break;
        case 'role_manager':
          for (const userId of selectedUsers) {
            await api.patch(`/users/${userId}`, { role: 'manager' }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
          break;
      }
      
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setLoading(true);
      await api.post('/users/create', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCreateUserOpen(false);
      setNewUser({
        username: '',
        email: '',
        full_name: '',
        role: 'driver',
        password: ''
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      await api.patch(`/users/${selectedUser.id}`, {
        full_name: selectedUser.full_name,
        email: selectedUser.email,
        role: selectedUser.role
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEditUserOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      setLoading(true);
      await api.patch(`/users/${userId}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRole && matchesStatus && matchesSearch;
  });

  return (
    <Grid container spacing={3}>
      {/* User Statistics Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Users</Typography>
            </Box>
            <Typography variant="h4" color="primary">
              {adminStats.userStats.totalUsers}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">Active Users</Typography>
            </Box>
            <Typography variant="h4" color="success.main">
              {adminStats.userStats.activeUsers}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">New Today</Typography>
            </Box>
            <Typography variant="h4" color="info.main">
              {adminStats.userStats.newUsersToday}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Inactive Users</Typography>
            </Box>
            <Typography variant="h4" color="warning.main">
              {adminStats.userStats.totalUsers - adminStats.userStats.activeUsers}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* User Management Controls */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">User Management</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setCreateUserOpen(true)}
              >
                Create User
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {/* Handle export users */}}
              >
                Export Users
              </Button>
            </Box>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={filterRole}
                label="Role"
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="driver">Driver</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: 'primary.main', borderRadius: 1 }}>
              <Typography variant="body2" color="white" sx={{ mb: 1 }}>
                {selectedUsers.length} users selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => handleBulkAction('activate')}
                >
                  Activate
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Deactivate
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleBulkAction('role_driver')}
                >
                  Set as Driver
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleBulkAction('role_manager')}
                >
                  Set as Manager
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          )}

          {/* Users Table */}
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {user.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {user.full_name || user.username}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Chip
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        color={user.role === 'admin' ? 'error' : user.role === 'manager' ? 'warning' : 'default'}
                        size="small"
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Chip
                        label={user.is_active ? 'Active' : 'Inactive'}
                        color={user.is_active ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditUserOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleUserStatus(user.id)}
                          color={user.is_active ? 'warning' : 'success'}
                        >
                          {user.is_active ? <WarningIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          {filteredUsers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                No users found matching the current filters.
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>

      {/* Create User Dialog */}
      <Dialog open={createUserOpen} onClose={() => setCreateUserOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={newUser.username}
                onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={newUser.full_name}
                onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  label="Role"
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                >
                  <MenuItem value="driver">Driver</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateUserOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained" disabled={loading}>
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onClose={() => setEditUserOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  value={selectedUser.username}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser(prev => ({ ...prev, email: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={selectedUser.full_name || ''}
                  onChange={(e) => setSelectedUser(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={selectedUser.role}
                    label="Role"
                    onChange={(e) => setSelectedUser(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <MenuItem value="driver">Driver</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserOpen(false)}>Cancel</Button>
          <Button onClick={handleEditUser} variant="contained" disabled={loading}>
            Update User
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

const AnalyticsHub: React.FC<{ adminStats: AdminStats }> = ({ adminStats }) => {
  const { token } = useAuth();
  const [period, setPeriod] = useState('week');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('pdf');

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // In real implementation, fetch from dedicated analytics endpoints
      
      // Generate mock comprehensive analytics data
      const mockAnalyticsData = {
        performance: {
          systemUptime: '99.9%',
          avgResponseTime: '125ms',
          totalProcessedFrames: 2456789,
          detectionAccuracy: '94.2%',
          falsePositiveRate: '2.1%'
        },
        trends: {
          alertTrends: [
            { date: '2024-01-15', drowsiness: 23, distraction: 18, phone: 8 },
            { date: '2024-01-16', drowsiness: 19, distraction: 22, phone: 12 },
            { date: '2024-01-17', drowsiness: 28, distraction: 15, phone: 6 },
            { date: '2024-01-18', drowsiness: 16, distraction: 19, phone: 9 },
            { date: '2024-01-19', drowsiness: 31, distraction: 24, phone: 11 },
            { date: '2024-01-20', drowsiness: 25, distraction: 17, phone: 7 },
            { date: '2024-01-21', drowsiness: 22, distraction: 20, phone: 10 }
          ],
          userActivity: [
            { date: '2024-01-15', activeUsers: 45, sessions: 98 },
            { date: '2024-01-16', activeUsers: 52, sessions: 110 },
            { date: '2024-01-17', activeUsers: 48, sessions: 104 },
            { date: '2024-01-18', activeUsers: 43, sessions: 89 },
            { date: '2024-01-19', activeUsers: 56, sessions: 121 },
            { date: '2024-01-20', activeUsers: 51, sessions: 115 },
            { date: '2024-01-21', activeUsers: 49, sessions: 107 }
          ]
        },
        riskAnalysis: {
          highRiskDrivers: [
            { name: 'John Doe', riskScore: 85, alertCount: 45, avgSessionTime: '3.2h' },
            { name: 'Jane Smith', riskScore: 78, alertCount: 38, avgSessionTime: '2.8h' },
            { name: 'Mike Wilson', riskScore: 72, alertCount: 31, avgSessionTime: '4.1h' },
            { name: 'Sarah Davis', riskScore: 69, alertCount: 28, avgSessionTime: '3.5h' },
            { name: 'Bob Johnson', riskScore: 65, alertCount: 25, avgSessionTime: '2.9h' }
          ],
          riskDistribution: [
            { range: 'Low (0-30)', count: 156, color: '#4CAF50' },
            { range: 'Medium (31-60)', count: 89, color: '#FF9800' },
            { range: 'High (61-80)', count: 34, color: '#FF5722' },
            { range: 'Critical (81-100)', count: 12, color: '#F44336' }
          ]
        },
        hourlyPatterns: [
          { hour: '00', alerts: 5 }, { hour: '01', alerts: 3 }, { hour: '02', alerts: 2 },
          { hour: '03', alerts: 4 }, { hour: '04', alerts: 7 }, { hour: '05', alerts: 12 },
          { hour: '06', alerts: 25 }, { hour: '07', alerts: 35 }, { hour: '08', alerts: 28 },
          { hour: '09', alerts: 22 }, { hour: '10', alerts: 18 }, { hour: '11', alerts: 15 },
          { hour: '12', alerts: 20 }, { hour: '13', alerts: 24 }, { hour: '14', alerts: 19 },
          { hour: '15', alerts: 21 }, { hour: '16', alerts: 26 }, { hour: '17', alerts: 31 },
          { hour: '18', alerts: 29 }, { hour: '19', alerts: 23 }, { hour: '20', alerts: 16 },
          { hour: '21', alerts: 11 }, { hour: '22', alerts: 8 }, { hour: '23', alerts: 6 }
        ]
      };

      setAnalyticsData(mockAnalyticsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: string) => {
    // In real implementation, this would generate and download reports
    console.log(`Exporting ${type} report...`);
    alert(`${type.toUpperCase()} report export would be implemented here`);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading || !analyticsData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading analytics data...</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Export and Controls */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Advanced Analytics & Reporting</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                  <MenuItem value="quarter">Last Quarter</MenuItem>
                  <MenuItem value="year">Last Year</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Export</InputLabel>
                <Select
                  value={exportType}
                  label="Export"
                  onChange={(e) => setExportType(e.target.value)}
                >
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport(exportType)}
              >
                Export Report
              </Button>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Performance Metrics */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: 300 }}>
          <Typography variant="h6" gutterBottom>
            System Performance Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="success.main">
                  {analyticsData.performance.systemUptime}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  System Uptime
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="primary.main">
                  {analyticsData.performance.avgResponseTime}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg Response Time
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="info.main">
                  {analyticsData.performance.detectionAccuracy}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Detection Accuracy
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="warning.main">
                  {analyticsData.performance.falsePositiveRate}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  False Positive Rate
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Risk Distribution */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: 300 }}>
          <Typography variant="h6" gutterBottom>
            Driver Risk Distribution
          </Typography>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={analyticsData.riskAnalysis.riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, count }) => `${range}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analyticsData.riskAnalysis.riskDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Alert Trends */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Alert Trends Over Time
          </Typography>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={analyticsData.trends.alertTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="drowsiness" 
                stroke="#FF6B6B" 
                name="Drowsiness Alerts"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="distraction" 
                stroke="#4ECDC4" 
                name="Distraction Alerts"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="phone" 
                stroke="#45B7D1" 
                name="Phone Usage Alerts"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* User Activity Trends */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: 350 }}>
          <Typography variant="h6" gutterBottom>
            User Activity Trends
          </Typography>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={analyticsData.trends.userActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                name="Active Users"
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stackId="2"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Sessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Hourly Alert Patterns */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: 350 }}>
          <Typography variant="h6" gutterBottom>
            Hourly Alert Patterns
          </Typography>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={analyticsData.hourlyPatterns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="alerts" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* High Risk Drivers Table */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            High Risk Drivers Analysis
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Driver Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Risk Score</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Alert Count</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Avg Session Time</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Risk Level</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.riskAnalysis.highRiskDrivers.map((driver: any, index: number) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'error.main' }}>
                          {driver.name.split(' ').map((n: string) => n[0]).join('')}
                        </Avatar>
                        <Typography variant="body2">{driver.name}</Typography>
                      </Box>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Typography variant="h6" color="error.main">
                        {driver.riskScore}
                      </Typography>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Typography variant="body2">
                        {driver.alertCount}
                      </Typography>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Typography variant="body2">
                        {driver.avgSessionTime}
                      </Typography>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Chip
                        label={driver.riskScore >= 80 ? 'Critical' : driver.riskScore >= 60 ? 'High' : 'Medium'}
                        color={driver.riskScore >= 80 ? 'error' : driver.riskScore >= 60 ? 'warning' : 'primary'}
                        size="small"
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Button size="small" variant="outlined" color="warning">
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      </Grid>

      {/* Insights and Recommendations */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            AI-Powered Insights & Recommendations
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>Peak Risk Hours:</strong> Drowsiness alerts spike between 6-8 AM and 5-7 PM. Consider implementing mandatory breaks during these periods.
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Performance Trend:</strong> Detection accuracy has improved by 2.3% this month. The new algorithm updates are showing positive results.
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Alert severity="error" sx={{ mb: 2 }}>
                <strong>Critical Alert:</strong> 5 drivers have risk scores above 80. Immediate intervention and additional training recommended.
              </Alert>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

const AlertManagementPanel: React.FC<{ adminStats: AdminStats }> = ({ adminStats }) => {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertRules, setAlertRules] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [createRuleOpen, setCreateRuleOpen] = useState(false);
  const [createNotificationOpen, setCreateNotificationOpen] = useState(false);

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    condition: 'alert_count > 5',
    action: 'email',
    threshold: '',
    timeWindow: '1',
    isActive: true
  });

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all_users',
    scheduleAt: ''
  });

  useEffect(() => {
    fetchAlertData();
    fetchAlertRules();
    fetchNotifications();
  }, [dateRange, filterType, filterSeverity]);

  const fetchAlertData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/alerts/history?limit=200', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alert data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertRules = async () => {
    try {
      // Mock alert rules data - in real implementation, this would come from backend
      const mockRules = [
        {
          id: '1',
          name: 'High Frequency Drowsiness',
          description: 'Trigger when driver has >5 drowsiness alerts in 1 hour',
          condition: 'drowsiness_count > 5 AND time_window = 1h',
          action: 'email + sms',
          isActive: true,
          triggeredCount: 23,
          lastTriggered: '2024-01-20T14:30:00Z'
        },
        {
          id: '2',
          name: 'Critical Driver Risk',
          description: 'Trigger when driver risk score exceeds 80',
          condition: 'risk_score > 80',
          action: 'immediate_notification',
          isActive: true,
          triggeredCount: 7,
          lastTriggered: '2024-01-20T11:15:00Z'
        },
        {
          id: '3',
          name: 'System Performance Alert',
          description: 'Trigger when detection accuracy drops below 90%',
          condition: 'detection_accuracy < 90',
          action: 'admin_alert',
          isActive: false,
          triggeredCount: 2,
          lastTriggered: '2024-01-18T09:45:00Z'
        }
      ];
      setAlertRules(mockRules);
    } catch (error) {
      console.error('Error fetching alert rules:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Mock notifications data
      const mockNotifications = [
        {
          id: '1',
          title: 'System Maintenance Scheduled',
          message: 'Scheduled maintenance window from 2 AM to 4 AM tomorrow',
          type: 'info',
          target: 'all_users',
          status: 'sent',
          sentAt: '2024-01-20T10:00:00Z',
          sentTo: 291
        },
        {
          id: '2',
          title: 'New Feature: Enhanced Analytics',
          message: 'New analytics dashboard is now available with improved insights',
          type: 'success',
          target: 'managers_and_admins',
          status: 'scheduled',
          scheduleAt: '2024-01-21T09:00:00Z',
          sentTo: 0
        },
        {
          id: '3',
          title: 'Critical: High Risk Driver Alert',
          message: 'Multiple drivers showing critical risk scores - immediate attention required',
          type: 'error',
          target: 'admins',
          status: 'sent',
          sentAt: '2024-01-20T15:30:00Z',
          sentTo: 5
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const handleSelectAllAlerts = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts.map(alert => alert.id));
    }
  };

  const handleBulkAlertAction = async (action: string) => {
    if (selectedAlerts.length === 0) return;

    try {
      setLoading(true);
      
      switch (action) {
        case 'acknowledge':
          console.log('Acknowledging alerts:', selectedAlerts);
          break;
        case 'dismiss':
          console.log('Dismissing alerts:', selectedAlerts);
          break;
        case 'escalate':
          console.log('Escalating alerts:', selectedAlerts);
          break;
        case 'archive':
          console.log('Archiving alerts:', selectedAlerts);
          break;
      }
      
      setSelectedAlerts([]);
      // fetchAlertData(); // Refresh data
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      setLoading(true);
      console.log('Creating alert rule:', newRule);
      
      setCreateRuleOpen(false);
      setNewRule({
        name: '',
        description: '',
        condition: 'alert_count > 5',
        action: 'email',
        threshold: '',
        timeWindow: '1',
        isActive: true
      });
      fetchAlertRules();
    } catch (error) {
      console.error('Error creating rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    try {
      setLoading(true);
      console.log('Creating notification:', newNotification);
      
      setCreateNotificationOpen(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        target: 'all_users',
        scheduleAt: ''
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    try {
      setLoading(true);
      console.log('Toggling rule:', ruleId);
      // In real implementation, call API to toggle rule
      fetchAlertRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = filterType === 'all' || alert.alert_type.includes(filterType);
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const alertDate = new Date(alert.timestamp);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 3600 * 24));
      
      switch (dateRange) {
        case 'today':
          matchesDate = diffInDays === 0;
          break;
        case 'week':
          matchesDate = diffInDays <= 7;
          break;
        case 'month':
          matchesDate = diffInDays <= 30;
          break;
      }
    }
    
    return matchesType && matchesSeverity && matchesDate;
  });

  return (
    <Grid container spacing={3}>
      {/* Alert Statistics Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Alerts</Typography>
            </Box>
            <Typography variant="h4" color="warning.main">
              {adminStats.alertStats.totalAlerts}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">Today's Alerts</Typography>
            </Box>
            <Typography variant="h4" color="info.main">
              {adminStats.alertStats.alertsToday}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ErrorIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">Critical Alerts</Typography>
            </Box>
            <Typography variant="h4" color="error.main">
              {adminStats.alertStats.criticalAlerts}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <NotificationsIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">Active Rules</Typography>
            </Box>
            <Typography variant="h4" color="success.main">
              {alertRules.filter(rule => rule.isActive).length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Alert Management Tabs */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Tabs value={0} aria-label="alert management tabs" sx={{ mb: 3 }}>
            <Tab label="Alert History" />
            <Tab label="Alert Rules" />
            <Tab label="Notifications" />
          </Tabs>

          {/* Alert History Tab */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Alert History & Management</Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => console.log('Export alerts')}
              >
                Export Alerts
              </Button>
            </Box>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="drowsiness">Drowsiness</MenuItem>
                  <MenuItem value="distraction">Distraction</MenuItem>
                  <MenuItem value="phone">Phone Usage</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={filterSeverity}
                  label="Severity"
                  onChange={(e) => setFilterSeverity(e.target.value)}
                >
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="mild">Mild</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="severe">Severe</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  label="Date Range"
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Bulk Actions */}
            {selectedAlerts.length > 0 && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: 'warning.main', borderRadius: 1 }}>
                <Typography variant="body2" color="white" sx={{ mb: 1 }}>
                  {selectedAlerts.length} alerts selected
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => handleBulkAlertAction('acknowledge')}
                  >
                    Acknowledge
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="info"
                    onClick={() => handleBulkAlertAction('dismiss')}
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    onClick={() => handleBulkAlertAction('escalate')}
                  >
                    Escalate
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleBulkAlertAction('archive')}
                  >
                    Archive
                  </Button>
                </Box>
              </Box>
            )}

            {/* Alerts Table */}
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>
                      <input
                        type="checkbox"
                        checked={selectedAlerts.length === filteredAlerts.length && filteredAlerts.length > 0}
                        onChange={handleSelectAllAlerts}
                      />
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Timestamp</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Severity</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Message</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.slice(0, 50).map((alert) => (
                    <tr key={alert.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedAlerts.includes(alert.id)}
                          onChange={() => handleSelectAlert(alert.id)}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Typography variant="body2">
                          {new Date(alert.timestamp).toLocaleString()}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Chip
                          label={alert.alert_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Chip
                          label={alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          color={alert.severity === 'severe' ? 'error' : alert.severity === 'moderate' ? 'warning' : 'success'}
                          size="small"
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: '200px' }}>
                          {alert.message}
                        </Typography>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Typography variant="body2" color="textSecondary">
                          User {alert.user_id?.slice(0, 8)}...
                        </Typography>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <IconButton size="small" color="primary">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>

            {filteredAlerts.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">
                  No alerts found matching the current filters.
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>

      {/* Alert Rules Section */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Alert Rules & Automation</Typography>
            <Button
              variant="contained"
              startIcon={<NotificationsIcon />}
              onClick={() => setCreateRuleOpen(true)}
            >
              Create Rule
            </Button>
          </Box>

          <Grid container spacing={2}>
            {alertRules.map((rule) => (
              <Grid item xs={12} md={6} key={rule.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{rule.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {rule.description}
                        </Typography>
                      </Box>
                      <Switch
                        checked={rule.isActive}
                        onChange={() => handleToggleRule(rule.id)}
                        color="primary"
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, mb: 2 }}>
                      {rule.condition}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Triggered: {rule.triggeredCount} times
                        </Typography>
                        <br />
                        <Typography variant="caption" color="textSecondary">
                          Last: {new Date(rule.lastTriggered).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>

      {/* Create Rule Dialog */}
      <Dialog open={createRuleOpen} onClose={() => setCreateRuleOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Alert Rule</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rule Name"
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={newRule.description}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Condition (e.g., drowsiness_count > 5 AND time_window = 1h)"
                value={newRule.condition}
                onChange={(e) => setNewRule(prev => ({ ...prev, condition: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={newRule.action}
                  label="Action"
                  onChange={(e) => setNewRule(prev => ({ ...prev, action: e.target.value }))}
                >
                  <MenuItem value="email">Email Notification</MenuItem>
                  <MenuItem value="sms">SMS Alert</MenuItem>
                  <MenuItem value="email + sms">Email + SMS</MenuItem>
                  <MenuItem value="webhook">Webhook</MenuItem>
                  <MenuItem value="dashboard_alert">Dashboard Alert</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time Window (hours)"
                type="number"
                value={newRule.timeWindow}
                onChange={(e) => setNewRule(prev => ({ ...prev, timeWindow: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newRule.isActive}
                    onChange={(e) => setNewRule(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Activate rule immediately"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateRuleOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRule} variant="contained" disabled={loading}>
            Create Rule
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

const SystemConfigurationPanel: React.FC = () => (
  <Typography variant="h6">System Configuration Panel - Coming in next phase</Typography>
);

const SecurityAuditPanel: React.FC<{ adminStats: AdminStats }> = ({ adminStats }) => (
  <Typography variant="h6">Security & Audit Panel - Coming in next phase</Typography>
);

export default AdminPanel;