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
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as ExcelIcon,
  Assessment as ReportIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Star as StarIcon
} from '@mui/icons-material';

const ReportsScreen = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('performance');
  const [filters, setFilters] = useState({
    district: 'all',
    category: 'all',
    dateRange: 'month',
    format: 'pdf'
  });
  const [generatedReports, setGeneratedReports] = useState([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [progress, setProgress] = useState(0);

  // Mock data for reports
  const mockReports = [
    {
      id: 1,
      title: 'Monthly Performance Report - June 2024',
      type: 'performance',
      district: 'Dehradun',
      category: 'All',
      dateGenerated: '2024-06-30',
      size: '2.5 MB',
      format: 'pdf',
      status: 'completed'
    },
    {
      id: 2,
      title: 'District-wise Athlete Statistics',
      type: 'statistics',
      district: 'All',
      category: 'All',
      dateGenerated: '2024-06-29',
      size: '1.8 MB',
      format: 'excel',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Top Performers Analysis - Q2 2024',
      type: 'analytics',
      district: 'Nainital',
      category: 'Athletics',
      dateGenerated: '2024-06-28',
      size: '3.2 MB',
      format: 'pdf',
      status: 'completed'
    }
  ];

  useEffect(() => {
    setGeneratedReports(mockReports);
  }, []);

  const reportTypes = [
    { value: 'performance', label: 'Performance Report', description: 'Athlete performance metrics and trends' },
    { value: 'statistics', label: 'Statistical Report', description: 'Comprehensive statistics and data analysis' },
    { value: 'analytics', label: 'Analytics Report', description: 'Advanced analytics and insights' },
    { value: 'verification', label: 'Verification Report', description: 'Athlete verification status and compliance' },
    { value: 'district', label: 'District Report', description: 'District-wise performance and statistics' }
  ];

  const districts = ['Dehradun', 'Nainital', 'Haridwar', 'Almora', 'Pithoragarh', 'Chamoli', 'All'];
  const categories = ['Athletics', 'Swimming', 'Wrestling', 'Boxing', 'All'];
  const dateRanges = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleGenerateReport = async () => {
    setLoading(true);
    setProgress(0);

    // Simulate report generation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          
          const newReport = {
            id: generatedReports.length + 1,
            title: `${reportTypes.find(t => t.value === reportType).label} - ${new Date().toLocaleDateString()}`,
            type: reportType,
            district: filters.district === 'all' ? 'All' : filters.district,
            category: filters.category === 'all' ? 'All' : filters.category,
            dateGenerated: new Date().toISOString().split('T')[0],
            size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
            format: filters.format,
            status: 'completed'
          };
          
          setGeneratedReports([newReport, ...generatedReports]);
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDownloadReport = (report) => {
    // Simulate file download
    const link = document.createElement('a');
    link.href = '#'; // In real implementation, this would be the actual file URL
    link.download = `${report.title}.${report.format}`;
    link.click();
  };

  const handlePreviewReport = (report) => {
    setSelectedReport(report);
    setPreviewDialogOpen(true);
  };

  const handleDeleteReport = (reportId) => {
    setGeneratedReports(generatedReports.filter(r => r.id !== reportId));
  };

  const getReportIcon = (format) => {
    switch (format) {
      case 'pdf': return <PdfIcon color="error" />;
      case 'excel': return <ExcelIcon color="success" />;
      default: return <ReportIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Reports & Analytics
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Generate comprehensive reports and export data for analysis
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Report Generation Form */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Generate New Report
              </Typography>

              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    label="Report Type"
                  >
                    {reportTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>District</InputLabel>
                  <Select
                    value={filters.district}
                    onChange={(e) => setFilters({...filters, district: e.target.value})}
                    label="District"
                  >
                    {districts.map(district => (
                      <MenuItem key={district} value={district.toLowerCase()}>
                        {district}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    label="Category"
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category.toLowerCase()}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                    label="Date Range"
                  >
                    {dateRanges.map(range => (
                      <MenuItem key={range.value} value={range.value}>
                        {range.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Export Format</InputLabel>
                  <Select
                    value={filters.format}
                    onChange={(e) => setFilters({...filters, format: e.target.value})}
                    label="Export Format"
                  >
                    <MenuItem value="pdf">PDF Document</MenuItem>
                    <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                    <MenuItem value="csv">CSV File</MenuItem>
                  </Select>
                </FormControl>

                {loading && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      Generating report... {progress}%
                    </Typography>
                    <LinearProgress variant="determinate" value={progress} />
                  </Box>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleGenerateReport}
                  disabled={loading}
                  startIcon={<AssessmentIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Generate Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Generated Reports List */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Generated Reports
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderRadius: 1 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Filters</TableCell>
                      <TableCell>Date Generated</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {generatedReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getReportIcon(report.format)}
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {report.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {report.format.toUpperCase()}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={reportTypes.find(t => t.value === report.type)?.label} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            District: {report.district}
                          </Typography>
                          <br />
                          <Typography variant="caption">
                            Category: {report.category}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(report.dateGenerated).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {report.size}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={report.status}
                            color={getStatusColor(report.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handlePreviewReport(report)}
                              disabled={report.status !== 'completed'}
                            >
                              Preview
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleDownloadReport(report)}
                              disabled={report.status !== 'completed'}
                              startIcon={<DownloadIcon />}
                            >
                              Download
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleDeleteReport(report.id)}
                            >
                              Delete
                            </Button>
                          </Box>
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

      {/* Report Preview Dialog */}
      <Dialog 
        open={previewDialogOpen} 
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Report Preview
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedReport.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Generated on: {new Date(selectedReport.dateGenerated).toLocaleDateString()}
              </Typography>
              
              <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                This is a preview of the report. The actual report will contain detailed data, charts, and analysis.
              </Alert>

              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Report Summary
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <AssessmentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Report Type" 
                        secondary={reportTypes.find(t => t.value === selectedReport.type)?.label}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="District" 
                        secondary={selectedReport.district}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SchoolIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Category" 
                        secondary={selectedReport.category}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUpIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="File Size" 
                        secondary={selectedReport.size}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={() => handleDownloadReport(selectedReport)}
            startIcon={<DownloadIcon />}
          >
            Download Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportsScreen;