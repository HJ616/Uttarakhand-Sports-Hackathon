import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const AnalyticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    district: 'all',
    category: 'all',
    timeRange: 'month',
    gender: 'all'
  });

  // Mock data - replace with actual API calls
  const performanceData = [
    { name: 'Jan', athletics: 78, swimming: 82, wrestling: 75, boxing: 71 },
    { name: 'Feb', athletics: 81, swimming: 85, wrestling: 78, boxing: 74 },
    { name: 'Mar', athletics: 84, swimming: 88, wrestling: 81, boxing: 77 },
    { name: 'Apr', athletics: 87, swimming: 91, wrestling: 84, boxing: 80 },
    { name: 'May', athletics: 89, swimming: 93, wrestling: 87, boxing: 83 },
    { name: 'Jun', athletics: 91, swimming: 95, wrestling: 89, boxing: 86 }
  ];

  const districtPerformance = [
    { district: 'Dehradun', athletes: 245, avgScore: 85.2, topPerformer: 'Rahul Sharma' },
    { district: 'Nainital', athletes: 189, avgScore: 82.7, topPerformer: 'Priya Singh' },
    { district: 'Haridwar', athletes: 156, avgScore: 88.1, topPerformer: 'Arjun Kumar' },
    { district: 'Almora', athletes: 134, avgScore: 79.3, topPerformer: 'Anjali Rawat' },
    { district: 'Pithoragarh', athletes: 98, avgScore: 81.6, topPerformer: 'Vikash Joshi' },
    { district: 'Chamoli', athletes: 87, avgScore: 83.4, topPerformer: 'Neha Thakur' }
  ];

  const categoryDistribution = [
    { name: 'Athletics', value: 35, color: '#8884d8' },
    { name: 'Swimming', value: 25, color: '#82ca9d' },
    { name: 'Wrestling', value: 20, color: '#ffc658' },
    { name: 'Boxing', value: 15, color: '#ff7300' },
    { name: 'Others', value: 5, color: '#00ff88' }
  ];

  const ageGroupPerformance = [
    { ageGroup: '12-14', male: 76, female: 78, total: 154 },
    { ageGroup: '15-17', male: 82, female: 84, total: 166 },
    { ageGroup: '18-20', male: 85, female: 87, total: 172 },
    { ageGroup: '21-23', male: 88, female: 86, total: 174 }
  ];

  const skillRadarData = [
    { skill: 'Speed', athletics: 85, swimming: 78, wrestling: 72, boxing: 88 },
    { skill: 'Strength', athletics: 78, swimming: 82, wrestling: 95, boxing: 85 },
    { skill: 'Endurance', athletics: 88, swimming: 95, wrestling: 85, boxing: 82 },
    { skill: 'Flexibility', athletics: 82, swimming: 88, wrestling: 75, boxing: 70 },
    { skill: 'Coordination', athletics: 90, swimming: 85, wrestling: 78, boxing: 88 },
    { skill: 'Balance', athletics: 87, swimming: 92, wrestling: 88, boxing: 82 }
  ];

  const monthlyTrends = [
    { month: 'Jan', registrations: 45, assessments: 120, completions: 115 },
    { month: 'Feb', registrations: 52, assessments: 135, completions: 128 },
    { month: 'Mar', registrations: 48, assessments: 142, completions: 138 },
    { month: 'Apr', registrations: 61, assessments: 158, completions: 152 },
    { month: 'May', registrations: 58, assessments: 165, completions: 160 },
    { month: 'Jun', registrations: 67, assessments: 178, completions: 172 }
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const StatCard = ({ title, value, icon, trend, color = 'primary' }) => (
    <Card sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
          {trend && (
            <Chip 
              icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              color={trend > 0 ? 'success' : 'error'}
              size="small"
            />
          )}
        </Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography>Loading analytics...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Analytics Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>District</InputLabel>
            <Select
              value={filters.district}
              onChange={(e) => setFilters({...filters, district: e.target.value})}
              label="District"
            >
              <MenuItem value="all">All Districts</MenuItem>
              <MenuItem value="dehradun">Dehradun</MenuItem>
              <MenuItem value="nainital">Nainital</MenuItem>
              <MenuItem value="haridwar">Haridwar</MenuItem>
              <MenuItem value="almora">Almora</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              label="Category"
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="athletics">Athletics</MenuItem>
              <MenuItem value="swimming">Swimming</MenuItem>
              <MenuItem value="wrestling">Wrestling</MenuItem>
              <MenuItem value="boxing">Boxing</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={filters.timeRange}
              onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
              label="Time Range"
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Athletes"
            value="1,234"
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            trend={12.5}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Completed Assessments"
            value="3,456"
            icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
            trend={8.3}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Average Score"
            value="84.2%"
            icon={<StarIcon sx={{ fontSize: 40 }} />}
            trend={-2.1}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Active Districts"
            value="13"
            icon={<LocationIcon sx={{ fontSize: 40 }} />}
            trend={18.2}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Performance Trends */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Performance Trends by Category
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="athletics" stroke="#8884d8" strokeWidth={3} />
                  <Line type="monotone" dataKey="swimming" stroke="#82ca9d" strokeWidth={3} />
                  <Line type="monotone" dataKey="wrestling" stroke="#ffc658" strokeWidth={3} />
                  <Line type="monotone" dataKey="boxing" stroke="#ff7300" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Category Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* District Performance */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                District Performance Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={districtPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="district" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Age Group Performance
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={ageGroupPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="male" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="female" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Skill Analysis */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Skill Analysis by Category
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={skillRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Athletics" dataKey="athletics" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Radar name="Swimming" dataKey="swimming" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                  <Radar name="Wrestling" dataKey="wrestling" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
                  <Radar name="Boxing" dataKey="boxing" stroke="#ff7300" fill="#ff7300" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Monthly Trends
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="registrations" stroke="#8884d8" strokeWidth={3} />
                  <Line type="monotone" dataKey="assessments" stroke="#82ca9d" strokeWidth={3} />
                  <Line type="monotone" dataKey="completions" stroke="#ffc658" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* District Leaderboard */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Top Performing Districts
          </Typography>
          <Grid container spacing={2}>
            {districtPerformance.map((district, index) => (
              <Grid item xs={12} md={4} key={district.district}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="h6" color="primary">
                        #{index + 1}
                      </Typography>
                      <Chip 
                        label={`${district.avgScore}%`} 
                        color={index < 3 ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {district.district}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {district.athletes} athletes
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Top Performer: {district.topPerformer}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalyticsScreen;