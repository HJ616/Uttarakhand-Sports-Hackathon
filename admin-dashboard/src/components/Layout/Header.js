import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge, Menu, MenuItem, Avatar, Box, Button } from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Language as LanguageIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Download as DownloadIcon,
  Report as ReportIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const Header = ({ onMenuToggle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [langAnchorEl, setLangAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user, logout } = useAuth();
  const { generateReport, exportData } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const isMenuOpen = Boolean(anchorEl);
  const isLangMenuOpen = Boolean(langAnchorEl);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
  ];

  const [currentLanguage, setCurrentLanguage] = useState(languages[0]);

  useEffect(() => {
    // Mock notifications
    setNotifications([
      {
        id: 1,
        title: 'New Assessment Submitted',
        message: 'Athlete from Dehradun completed Speed Test',
        time: '2 minutes ago',
        type: 'info',
        read: false,
      },
      {
        id: 2,
        title: 'Verification Required',
        message: '3 assessments need manual review',
        time: '15 minutes ago',
        type: 'warning',
        read: false,
      },
      {
        id: 3,
        title: 'System Update',
        message: 'New AI model deployed successfully',
        time: '1 hour ago',
        type: 'success',
        read: true,
      },
    ]);
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuOpen = (event) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setLangAnchorEl(null);
  };

  const handleLanguageChange = (language) => {
    setCurrentLanguage(language);
    handleMenuClose();
    // Here you would implement language switching logic
    console.log('Language changed to:', language.name);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleGenerateReport = async () => {
    try {
      const report = await generateReport('summary', { timeRange: '30d' });
      if (report) {
        // Create download link
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sai-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportData('json', { timeRange: '30d' });
      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sai-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type) => {
    switch (type) {
      case 'info': return 'primary';
      case 'warning': return 'warning';
      case 'success': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { label: 'Assessments', icon: <AssessmentIcon />, path: '/assessments' },
    { label: 'Athletes', icon: <PeopleIcon />, path: '/athletes' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: '#1e3a8a' }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          SAI Assessment Portal
        </Typography>

        {/* Quick Actions */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
          <Button
            color="inherit"
            startIcon={<ReportIcon />}
            onClick={handleGenerateReport}
            sx={{ mr: 1 }}
          >
            Report
          </Button>
          <Button
            color="inherit"
            startIcon={<DownloadIcon />}
            onClick={handleExportData}
          >
            Export
          </Button>
        </Box>

        {/* Language Selector */}
        <IconButton
          color="inherit"
          onClick={handleLanguageMenuOpen}
          sx={{ mr: 1 }}
        >
          <Badge badgeContent={currentLanguage.flag} color="secondary">
            <LanguageIcon />
          </Badge>
        </IconButton>

        {/* Notifications */}
        <IconButton
          color="inherit"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <Badge badgeContent={unreadNotifications} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* User Profile */}
        <IconButton
          edge="end"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          onClick={handleProfileMenuOpen}
          color="inherit"
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
        </IconButton>

        {/* Notifications Menu */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem disabled>
            <Typography variant="subtitle2" fontWeight="bold">
              Notifications ({unreadNotifications} unread)
            </Typography>
          </MenuItem>
          {notifications.map((notification) => (
            <MenuItem key={notification.id} onClick={handleMenuClose}>
              <Box sx={{ minWidth: 300 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Badge
                    color={getNotificationColor(notification.type)}
                    variant="dot"
                    invisible={notification.read}
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="subtitle2" fontWeight={notification.read ? 'normal' : 'bold'}>
                    {notification.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          <MenuItem onClick={handleMenuClose}>
            <Typography variant="body2" color="primary">
              View All Notifications
            </Typography>
          </MenuItem>
        </Menu>

        {/* Language Menu */}
        <Menu
          anchorEl={langAnchorEl}
          open={isLangMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {languages.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language)}
              selected={currentLanguage.code === language.code}
            >
              <Box display="flex" alignItems="center" width={120}>
                <span style={{ marginRight: 8 }}>{language.flag}</span>
                <Typography variant="body2">{language.name}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>

        {/* User Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen && !isLangMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem disabled>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {user?.name || 'SAI Official'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || 'admin@sai.gov.in'}
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
            <AccountCircleIcon sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
            <SettingsIcon sx={{ mr: 1 }} />
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;