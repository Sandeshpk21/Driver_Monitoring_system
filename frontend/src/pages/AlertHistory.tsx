import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Button,
} from '@mui/material';
import {
  Refresh,
  Download,
  Warning,
  Error,
  Info,
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';

interface Alert {
  id: string;
  timestamp: string;
  alert_type: string;
  severity: string;
  message: string;
  eye_aspect_ratio?: number;
  mouth_aspect_ratio?: number;
  blink_count?: number;
  session_id?: string;
}

const AlertHistory: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalAlerts, setTotalAlerts] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    alert_type: '',
    severity: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchAlerts();
  }, [page, rowsPerPage, filters]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: rowsPerPage.toString(),
        offset: (page * rowsPerPage).toString(),
      });

      if (filters.alert_type) params.append('alert_type', filters.alert_type);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);

      const response = await api.get(`/alerts/history?${params}`);
      setAlerts(response.data);
      
      // Get total count (you might need to add this to your API)
      setTotalAlerts(response.data.length);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
    setPage(0);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        limit: '10000',
        offset: '0',
      });

      const response = await api.get(`/alerts/history?${params}`);
      const data = response.data;

      // Convert to CSV
      const csv = [
        ['Timestamp', 'Type', 'Severity', 'Message', 'EAR', 'MAR', 'Blinks'],
        ...data.map((a: Alert) => [
          a.timestamp,
          a.alert_type,
          a.severity,
          a.message,
          a.eye_aspect_ratio || '',
          a.mouth_aspect_ratio || '',
          a.blink_count || '',
        ]),
      ]
        .map(row => row.join(','))
        .join('\n');

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alerts_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export alerts:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'severe':
        return <Error fontSize="small" />;
      case 'moderate':
        return <Warning fontSize="small" />;
      default:
        return <Info fontSize="small" />;
    }
  };

  const getSeverityColor = (severity: string): any => {
    switch (severity) {
      case 'severe':
        return 'error';
      case 'moderate':
        return 'warning';
      case 'mild':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 1, sm: 2, md: 3 }, mb: { xs: 1, sm: 2, md: 3 }, px: { xs: 1, sm: 2 } }}>
      {/* Header */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, backgroundColor: '#1a1a1a' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 0 } }}>
          <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Alert History</Typography>
          <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, flex: { xs: 1, sm: 'none' } }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Export CSV</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Export</Box>
            </Button>
            <IconButton onClick={fetchAlerts} color="primary">
              <Refresh />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 }, backgroundColor: '#1a1a1a' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Alert Type"
              value={filters.alert_type}
              onChange={(e) => handleFilterChange('alert_type', e.target.value)}
              size="small"
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="drowsiness">Drowsiness</MenuItem>
              <MenuItem value="distraction">Distraction</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Severity"
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              size="small"
            >
              <MenuItem value="">All Severities</MenuItem>
              <MenuItem value="mild">Mild</MenuItem>
              <MenuItem value="moderate">Moderate</MenuItem>
              <MenuItem value="severe">Severe</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Alerts Table */}
      <Paper sx={{ backgroundColor: '#1a1a1a', overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Timestamp</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Type</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Severity</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Message</TableCell>
                <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>EAR</TableCell>
                <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>MAR</TableCell>
                <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' } }}>Blinks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No alerts found
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                        {format(new Date(alert.timestamp), 'MMM dd, HH:mm')}
                      </Box>
                      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={alert.alert_type}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getSeverityIcon(alert.severity)}
                        label={alert.severity}
                        size="small"
                        color={getSeverityColor(alert.severity)}
                        sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {alert.message}
                    </TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {alert.eye_aspect_ratio?.toFixed(3) || '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {alert.mouth_aspect_ratio?.toFixed(3) || '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', lg: 'table-cell' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {alert.blink_count || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalAlerts}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>
    </Container>
  );
};

export default AlertHistory;