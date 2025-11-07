import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { useData } from '../../contexts/DataContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement
);

const Dashboard = () => {
  const { 
    dashboardStats, 
    recentAssessments, 
    performanceTrends, 
    verificationStatus,
    loading 
  } = useData();

  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Mock data for charts
  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Average Score',
        data: [65, 72, 68, 75, 78, 82],
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30, 58, 138, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Verification Rate',
        data: [85, 88, 92, 89, 94, 96],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const categoryDistribution = {
    labels: ['Speed', 'Power', 'Strength', 'Flexibility'],
    datasets: [
      {
        data: [28, 22, 35, 15],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6'],
        borderWidth: 0,
      },
    ],
  };

  const verificationData = {
    labels: ['Verified', 'Pending', 'Flagged'],
    datasets: [
      {
        data: [verificationStatus.verified, verificationStatus.pending, verificationStatus.flagged],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const StatCard = ({ title, value, icon, trend, color, subtitle }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          <Box textAlign="right">
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        {trend && (
          <Box display="flex" alignItems="center" mt={1}>
            <TrendingUpIcon sx={{ color: trend > 0 ? 'success.main' : 'error.main', fontSize: 16 }} />
            <Typography
              variant="body2"
              sx={{ color: trend > 0 ? 'success.main' : 'error.main', ml: 0.5 }}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </Typography>
            <Typography variant="body2" color="text.secondary" ml={0.5}>
              vs last month
            </Typography>
          </Box>
        )}
        {subtitle && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'flagged':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />;
      case 'pending':
        return <ScheduleIcon sx={{ color: 'warning.main', fontSize: 16 }} />;
      case 'flagged':
        return <WarningIcon sx={{ color: 'error.main', fontSize: 16 }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          SAI Assessment Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage athlete assessments across Uttarakhand
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Athletes"
            value={dashboardStats.totalAthletes}
            icon={<PeopleIcon />}
            trend={12}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Assessments"
            value={dashboardStats.totalAssessments}
            icon={<AssessmentIcon />}
            trend={8}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Verified Assessments"
            value={dashboardStats.verifiedAssessments}
            icon={<CheckCircleIcon />}
            subtitle={`${Math.round((dashboardStats.verifiedAssessments / dashboardStats.totalAssessments) * 100)}% verification rate`}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Flagged Assessments"
            value={dashboardStats.flaggedAssessments}
            icon={<WarningIcon />}
            subtitle="Requires review"
            color="error.main"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">
                  Performance Trends
                </Typography>
                <Box>
                  <Button
                    size="small"
                    variant={selectedTimeRange === '7d' ? 'contained' : 'outlined'}
                    onClick={() => setSelectedTimeRange('7d')}
                    sx={{ mr: 1 }}
                  >
                    7D
                  </Button>
                  <Button
                    size="small"
                    variant={selectedTimeRange === '30d' ? 'contained' : 'outlined'}
                    onClick={() => setSelectedTimeRange('30d')}
                    sx={{ mr: 1 }}
                  >
                    30D
                  </Button>
                  <Button
                    size="small"
                    variant={selectedTimeRange === '90d' ? 'contained' : 'outlined'}
                    onClick={() => setSelectedTimeRange('90d')}
                  >
                    90D
                  </Button>
                </Box>
              </Box>
              <Box height={300}>
                <Line data={performanceData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Test Categories
              </Typography>
              <Box height={300}>
                <Doughnut data={categoryDistribution} options={doughnutOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Verification Status */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Verification Status
              </Typography>
              <Box height={250}>
                <Doughnut data={verificationData} options={doughnutOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">
                  Recent Assessments
                </Typography>
                <Button size="small" variant="outlined">
                  View All
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Athlete</TableCell>
                      <TableCell>Test</TableCell>
                      <TableCell align="center">Score</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentAssessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                              {assessment.athleteName.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {assessment.athleteName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {assessment.testType}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="bold">
                            {assessment.score}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={assessment.status}
                            size="small"
                            color={getStatusColor(assessment.status)}
                            icon={getStatusIcon(assessment.status)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Report">
                            <IconButton size="small">
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Quick Actions
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button variant="contained" startIcon={<AssessmentIcon />}>
                  Generate Report
                </Button>
                <Button variant="outlined" startIcon={<PeopleIcon />}>
                  Export Athlete Data
                </Button>
                <Button variant="outlined" startIcon={<WarningIcon />}>
                  Review Flagged Assessments
                </Button>
                <Button variant="outlined" startIcon={<ScheduleIcon />}>
                  Schedule Verification
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;