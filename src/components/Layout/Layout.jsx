import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../../img/logo.png';
import logoCelular from '../../img/logo_celular.png';

const drawerWidth = 280;

function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'ADMIN';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/login');
  };

  // Menú según rol
  const menuItems = isAdmin
    ? [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Reportes', icon: <DescriptionIcon />, path: '/reports' },
        { text: 'Clientes', icon: <PeopleIcon />, path: '/clients' },
        { text: 'Servicios', icon: <BuildIcon />, path: '/services' },
        { text: 'Listas de precios', icon: <PriceCheckIcon />, path: '/price-lists' },
        { text: 'Usuarios', icon: <PersonIcon />, path: '/users' },
      ]
    : [
        { text: 'Mis Reportes', icon: <DescriptionIcon />, path: '/my-reports' },
        { text: 'Perfil', icon: <PersonIcon />, path: '/profile' },
      ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF9E5' }}>
      <Box
        sx={{
          pt: { xs: 6, sm: 4, md: 3 },
          pb: 3,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: 120, sm: 100 },
        }}
      >
        <img
          src={logo}
          alt="TodoAk"
          style={{
            maxHeight: '70px',
            maxWidth: '100%',
            height: 'auto',
            width: 'auto',
            objectFit: 'contain',
            imageRendering: 'auto',
          }}
          loading="eager"
        />
      </Box>
      <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />
      <List sx={{ pt: 2, flexGrow: 1, px: 1.5 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'rgba(255, 214, 0, 0.25)' : 'transparent',
                  borderLeft: isActive ? '4px solid #FFB300' : '4px solid transparent',
                  color: isActive ? '#F9A825' : '#555555',
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(255, 214, 0, 0.3)' : 'rgba(255, 214, 0, 0.1)',
                    transform: 'translateX(2px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#F9A825' : '#555555',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FFF8E1' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
          color: '#000',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: theme.zIndex.drawer + 1,
          height: '64px',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, height: '64px', minHeight: '64px !important' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                mr: 1,
                overflow: 'hidden',
              }}
            >
                <img
                  src={logoCelular}
                  alt="AK"
                  style={{
                    maxHeight: '28px',
                    maxWidth: '28px',
                    height: 'auto',
                    width: 'auto',
                    objectFit: 'contain',
                    imageRendering: 'auto',
                  }}
                  loading="eager"
                />
            </Box>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                letterSpacing: '0.3px',
                '& .todo': {
                  color: '#00BFA5',
                },
                '& .ak': {
                  color: '#FFB300',
                },
              }}
            >
              <span className="todo">Todo</span>
              <span className="ak">Ak</span>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                fontWeight: 500,
                color: '#333',
                fontSize: '0.875rem',
              }}
            >
              {user?.fullName || user?.username}
            </Typography>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: '#FFFFFF',
                color: '#333333',
                fontWeight: 600,
                border: '2px solid #FFD600',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </Avatar>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                borderColor: '#333',
                color: '#333',
                fontWeight: 600,
                fontSize: '0.875rem',
                px: 2,
                '&:hover': {
                  borderColor: '#000',
                  bgcolor: 'rgba(0,0,0,0.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Cerrar sesión
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#FFF9E5',
              boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
              pt: { xs: 2, sm: 1, md: 0 },
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#FFF9E5',
              boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
              borderRight: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          bgcolor: '#FFFDE7',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;

