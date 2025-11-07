import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Avatar,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

const AthletesScreen = () => {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    district: '',
    school: '',
    category: '',
    verificationStatus: ''
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockAthletes = [
      {
        id: 1,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91-9876543210',
        district: 'Dehradun',
        school: 'St. Joseph Academy',
        age: 16,
        gender: 'Male',
        category: 'Athletics',
        verificationStatus: 'verified',
        totalAssessments: 12,
        averageScore: 85.5,
        registrationDate: '2024-01-15',
        lastAssessment: '2024-03-20',
        avatar: null
      },
      {
        id: 2,
        name: 'Priya Singh',
        email: 'priya.singh@example.com',
        phone: '+91-9876543211',
        district: 'Nainital',
        school: 'St. Mary School',
        age: 15,
        gender: 'Female',
        category: 'Swimming',
        verificationStatus: 'pending',
        totalAssessments: 8,
        averageScore: 78.2,
        registrationDate: '2024-02-01',
        lastAssessment: '2024-03-15',
        avatar: null
      },
      {
        id: 3,
        name: 'Arjun Kumar',
        email: 'arjun.kumar@example.com',
        phone: '+91-9876543212',
        district: 'Haridwar',
        school: 'DAV Public School',
        age: 17,
        gender: 'Male',
        category: 'Wrestling',
        verificationStatus: 'verified',
        totalAssessments: 15,
        averageScore: 92.1,
        registrationDate: '2023-12-10',
        lastAssessment: '2024-03-22',
        avatar: null
      },
      {
        id: 4,
        name: 'Anjali Rawat',
        email: 'anjali.rawat@example.com',
        phone: '+91-9876543213',
        district: 'Almora',
        school: 'Government Inter College',
        age: 14,
        gender: 'Female',
        category: 'Athletics',
        verificationStatus: 'verified',
        totalAssessments: 6,
        averageScore: 88.7,
        registrationDate: '2024-01-20',
        lastAssessment: '2024-03-18',
        avatar: null
      },
      {
        id: 5,
        name: 'Vikash Joshi',
        email: 'vikash.joshi@example.com',
        phone: '+91-9876543214',
        district: 'Pithoragarh',
        school: 'Army Public School',
        age: 16,
        gender: 'Male',
        category: 'Boxing',
        verificationStatus: 'rejected',
        totalAssessments: 3,
        averageScore: 65.4,
        registrationDate: '2024-02-15',
        lastAssessment: '2024-03-10',
        avatar: null
      }
    ];

    setTimeout(() => {
      setAthletes(mockAthletes);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         athlete.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         athlete.phone.includes(searchTerm);
    
    const matchesFilters = (!filters.district || athlete.district === filters.district) &&
                          (!filters.school || athlete.school === filters.school) &&
                          (!filters.category || athlete.category === filters.category) &&
                          (!filters.verificationStatus || athlete.verificationStatus === filters.verificationStatus);
    
    return matchesSearch && matchesFilters;
  });

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {params.row.name.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.row.name}</Typography>
        </Box>
      )
    },
    {
      field: 'contact',
      headerName: 'Contact',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.row.email}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.phone}</Typography>
        </Box>
      )
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="body2">{params.row.district}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <SchoolIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">{params.row.school}</Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.row.category} 
          size="small" 
          variant="outlined"
          color="primary"
        />
      )
    },
    {
      field: 'stats',
      headerName: 'Statistics',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">Assessments: {params.row.totalAssessments}</Typography>
          <Typography variant="caption" color="text.secondary">
            Avg Score: {params.row.averageScore}%
          </Typography>
        </Box>
      )
    },
    {
      field: 'verificationStatus',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={getStatusLabel(params.row.verificationStatus)}
          color={getStatusColor(params.row.verificationStatus)}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton 
            size="small" 
            onClick={() => handleViewAthlete(params.row)}
            color="primary"
          >
            <ViewIcon />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleEditAthlete(params.row)}
            color="secondary"
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleDeleteAthlete(params.row)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  const handleViewAthlete = (athlete) => {
    setSelectedAthlete(athlete);
    setViewDialogOpen(true);
  };

  const handleEditAthlete = (athlete) => {
    setSelectedAthlete(athlete);
    setEditDialogOpen(true);
  };

  const handleDeleteAthlete = (athlete) => {
    if (window.confirm(`Are you sure you want to delete ${athlete.name}?`)) {
      setAthletes(athletes.filter(a => a.id !== athlete.id));
    }
  };

  const handleExportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'District', 'School', 'Age', 'Category', 'Status', 'Assessments', 'Average Score'],
      ...filteredAthletes.map(athlete => [
        athlete.name,
        athlete.email,
        athlete.phone,
        athlete.district,
        athlete.school,
        athlete.age,
        athlete.category,
        athlete.verificationStatus,
        athlete.totalAssessments,
        athlete.averageScore
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'athletes_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const districts = [...new Set(athletes.map(a => a.district))];
  const schools = [...new Set(athletes.map(a => a.school))];
  const categories = [...new Set(athletes.map(a => a.category))];

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Athletes Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            Add Athlete
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportData}
            sx={{ borderRadius: 2 }}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search athletes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>District</InputLabel>
                <Select
                  value={filters.district}
                  onChange={(e) => setFilters({...filters, district: e.target.value})}
                  label="District"
                >
                  <MenuItem value="">All Districts</MenuItem>
                  {districts.map(district => (
                    <MenuItem key={district} value={district}>{district}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.verificationStatus}
                  onChange={(e) => setFilters({...filters, verificationStatus: e.target.value})}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setFilters({ district: '', school: '', category: '', verificationStatus: '' })}
                fullWidth
                size="small"
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 2, backgroundColor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">{athletes.length}</Typography>
              <Typography variant="body2">Total Athletes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 2, backgroundColor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {athletes.filter(a => a.verificationStatus === 'verified').length}
              </Typography>
              <Typography variant="body2">Verified Athletes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 2, backgroundColor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {athletes.filter(a => a.verificationStatus === 'pending').length}
              </Typography>
              <Typography variant="body2">Pending Verification</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 2, backgroundColor: 'info.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {(athletes.reduce((sum, a) => sum + a.averageScore, 0) / athletes.length).toFixed(1)}%
              </Typography>
              <Typography variant="body2">Average Score</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Grid */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredAthletes}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              autoHeight
              sx={{
                '& .MuiDataGrid-root': {
                  border: 'none'
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0'
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'grey.50',
                  borderBottom: '2px solid #e0e0e0'
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {selectedAthlete?.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedAthlete?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAthlete?.email}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAthlete && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Personal Information</Typography>
                <Typography variant="body2">Age: {selectedAthlete.age}</Typography>
                <Typography variant="body2">Gender: {selectedAthlete.gender}</Typography>
                <Typography variant="body2">Phone: {selectedAthlete.phone}</Typography>
                <Typography variant="body2">Registration Date: {selectedAthlete.registrationDate}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Location & Category</Typography>
                <Typography variant="body2">District: {selectedAthlete.district}</Typography>
                <Typography variant="body2">School: {selectedAthlete.school}</Typography>
                <Typography variant="body2">Category: {selectedAthlete.category}</Typography>
                <Typography variant="body2">Status: {getStatusLabel(selectedAthlete.verificationStatus)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Performance</Typography>
                <Typography variant="body2">Total Assessments: {selectedAthlete.totalAssessments}</Typography>
                <Typography variant="body2">Average Score: {selectedAthlete.averageScore}%</Typography>
                <Typography variant="body2">Last Assessment: {selectedAthlete.lastAssessment}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Athlete</DialogTitle>
        <DialogContent>
          {selectedAthlete && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  defaultValue={selectedAthlete.name}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  defaultValue={selectedAthlete.email}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  defaultValue={selectedAthlete.phone}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  defaultValue={selectedAthlete.age}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Gender</InputLabel>
                  <Select defaultValue={selectedAthlete.gender}>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Verification Status</InputLabel>
                  <Select defaultValue={selectedAthlete.verificationStatus}>
                    <MenuItem value="verified">Verified</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setEditDialogOpen(false)} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AthletesScreen;