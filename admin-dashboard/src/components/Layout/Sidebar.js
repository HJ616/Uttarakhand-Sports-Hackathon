import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Typography,
  Box,
  Chip
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  TrendingUp as AnalyticsIcon,
  Report as ReportIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Security as SecurityIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from '../Common/LanguageSelector';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const menuItems = [
    { 
      text: t('dashboard'), 
      icon: <DashboardIcon />, 
      path: '/',
      badge: null
    },
    { 
      text: t('assessments'), 
      icon: <AssessmentIcon />, 
      path: '/assessments',
      badge: { color: 'warning', text: '3' }
    },
    { 
      text: t('athletes'), 
      icon: <PeopleIcon />, 
      path: '/athletes',
      badge: null
    },
    { 
      text: t('analytics'), 
      icon: <AnalyticsIcon />, 
      path: '/analytics',
      badge: null
    },
    { 
      text: t('reports'), 
      icon: <ReportIcon />, 
      path: '/reports',
      badge: null
    },
  ];

  const adminItems = [
    { 
      text: t('districts') || 'Districts', 
      icon: <LocationIcon />, 
      path: '/districts',
      badge: null
    },
    { 
      text: t('schools') || 'Schools', 
      icon: <SchoolIcon />, 
      path: '/schools',
      badge: null
    },
    { 
      text: t('performance') || 'Performance', 
      icon: <StarIcon />, 
      path: '/performance',
      badge: null
    },
  ];

  const systemItems = [
    { 
      text: t('security') || 'Security', 
      icon: <SecurityIcon />, 
      path: '/security',
      badge: null
    },
    { 
      text: t('settings') || 'Settings', 
      icon: <SettingsIcon />, 
      path: '/settings',
      badge: null
    },
    { 
      text: t('helpSupport') || 'Help & Support', 
      icon: <HelpIcon />, 
      path: '/help',
      badge: null
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const renderMenuItem = (item) => (
    <ListItem key={item.text} disablePadding>
      <ListItemButton
        onClick={() => {
          navigate(item.path);
          onClose();
        }}
        selected={isActive(item.path)}
        sx={{
          borderRadius: 1,
          mx: 1,
          '&.Mui-selected': {
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            }
          },
          '&:hover': {
            backgroundColor: 'action.hover',
          }
        }}
      >
        <ListItemIcon 
          sx={{ 
            color: isActive(item.path) ? 'white' : 'text.secondary',
            minWidth: 40 
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText 
          primary={item.text}
          primaryTypographyProps={{
            fontWeight: isActive(item.path) ? 'bold' : 'normal',
            fontSize: '0.9rem'
          }}
        />
        {item.badge && (
          <Chip 
            label={item.badge.text}
            size="small"
            color={item.badge.color}
            sx={{ ml: 1, fontSize: '0.7rem', height: 18 }}
          />
        )}
      </ListItemButton>
    </ListItem>
  );

  const drawerWidth = 280;

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: drawerWidth,
          backgroundColor: 'background.default',
          borderRight: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <Box sx={{ width: drawerWidth, height: '100%' }}>
        {/* Header */}
        <Box 
          sx={{ 
            p: 3, 
            backgroundColor: 'primary.main',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            SAI Portal
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Uttarakhand Sports Authority
          </Typography>
        </Box>

        <Divider />

        {/* Main Menu */}
        <Box sx={{ py: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              px: 2, 
              py: 1, 
              color: 'text.secondary',
              fontWeight: 'bold',
              display: 'block'
            }}
          >
            {t('mainMenu') || 'MAIN MENU'}
          </Typography>
          <List>
            {menuItems.map(renderMenuItem)}
          </List>
        </Box>

        <Divider />

        {/* Admin Menu */}
        <Box sx={{ py: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              px: 2, 
              py: 1, 
              color: 'text.secondary',
              fontWeight: 'bold',
              display: 'block'
            }}
          >
            {t('administration') || 'ADMINISTRATION'}
          </Typography>
          <List>
            {adminItems.map(renderMenuItem)}
          </List>
        </Box>

        <Divider />

        {/* System Menu */}
        <Box sx={{ py: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              px: 2, 
              py: 1, 
              color: 'text.secondary',
              fontWeight: 'bold',
              display: 'block'
            }}
          >
            {t('system') || 'SYSTEM'}
          </Typography>
          <List>
            {systemItems.map(renderMenuItem)}
          </List>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Language Selector */}
        <Box sx={{ p: 2 }}>
          <LanguageSelector />
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Version 1.0.0
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            © 2024 SAI Uttarakhand
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;