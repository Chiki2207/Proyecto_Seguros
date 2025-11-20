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
  keyframes,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import logo from '../../img/logo.png';
import logoCelular from '../../img/logo_celular.png';

// Animación de gradiente que se mueve para cada letra
const colorWave = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

// Animación de brillo que se mueve de izquierda a derecha
const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

// Animación de pulso para el glow
const pulseGlow = keyframes`
  0%, 100% {
    text-shadow: 0 0 10px rgba(0, 191, 165, 0.5), 0 0 20px rgba(0, 191, 165, 0.3), 0 0 30px rgba(255, 179, 0, 0.2);
  }
  50% {
    text-shadow: 0 0 20px rgba(0, 191, 165, 0.8), 0 0 30px rgba(0, 191, 165, 0.5), 0 0 40px rgba(255, 179, 0, 0.4);
  }
`;

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
        { text: 'Agendas', icon: <CalendarTodayIcon />, path: '/agendas' },
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
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'linear-gradient(180deg, #FFFEF5 0%, #FFF9E5 50%, #FFF8E1 100%)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(255, 214, 0, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 179, 0, 0.06) 0%, transparent 50%)',
        pointerEvents: 'none',
      },
    }}>
      <Box
        sx={{
          pt: { xs: 6, sm: 4, md: 3 },
          pb: 3,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: 120, sm: 100 },
          position: 'relative',
          zIndex: 1,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 249, 229, 0.7) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 214, 0, 0.15)',
          boxShadow: '0 2px 8px rgba(255, 214, 0, 0.1)',
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
            filter: 'drop-shadow(0 2px 4px rgba(255, 214, 0, 0.3))',
          }}
          loading="eager"
        />
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 214, 0, 0.2)', borderWidth: '1px' }} />
      <List sx={{ pt: 2, flexGrow: 1, px: 1.5, position: 'relative', zIndex: 1 }}>
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
                  borderRadius: 3,
                  bgcolor: isActive 
                    ? 'linear-gradient(135deg, rgba(255, 214, 0, 0.3) 0%, rgba(255, 179, 0, 0.2) 100%)' 
                    : 'transparent',
                  borderLeft: isActive ? '4px solid #FFB300' : '4px solid transparent',
                  border: isActive ? '1px solid rgba(255, 214, 0, 0.3)' : '1px solid transparent',
                  color: isActive ? '#F9A825' : '#555555',
                  py: 1.5,
                  px: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(255, 214, 0, 0.15) 0%, rgba(255, 179, 0, 0.1) 100%)'
                      : 'transparent',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover': {
                    bgcolor: isActive 
                      ? 'linear-gradient(135deg, rgba(255, 214, 0, 0.35) 0%, rgba(255, 179, 0, 0.25) 100%)' 
                      : 'linear-gradient(135deg, rgba(255, 214, 0, 0.12) 0%, rgba(255, 179, 0, 0.08) 100%)',
                    transform: 'translateX(4px)',
                    boxShadow: isActive 
                      ? '0 4px 12px rgba(255, 214, 0, 0.2)' 
                      : '0 2px 8px rgba(255, 214, 0, 0.15)',
                    borderColor: isActive ? 'rgba(255, 214, 0, 0.4)' : 'rgba(255, 214, 0, 0.2)',
                    '&::before': {
                      opacity: 1,
                    },
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#F9A825' : '#666666',
                    minWidth: 40,
                    transition: 'all 0.3s ease',
                    '& svg': {
                      filter: isActive ? 'drop-shadow(0 2px 4px rgba(255, 179, 0, 0.3))' : 'none',
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.95rem',
                    letterSpacing: isActive ? '0.3px' : '0px',
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
          background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 50%, #F9A825 100%)',
          color: '#000',
          boxShadow: '0 4px 20px rgba(255, 179, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: theme.zIndex.drawer + 1,
          height: '64px',
          borderBottom: '1px solid rgba(255, 214, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
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
                boxShadow: '0 4px 12px rgba(0,0,0,0.2), 0 2px 4px rgba(255, 214, 0, 0.3)',
                mr: 1,
                overflow: 'hidden',
                border: '2px solid rgba(255, 214, 0, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.25), 0 4px 8px rgba(255, 214, 0, 0.4)',
                },
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
                fontWeight: 800,
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.4rem' },
                letterSpacing: '0.5px',
                position: 'relative',
                display: 'inline-block',
                '& .todo': {
                  display: 'inline-block',
                  background: 'linear-gradient(90deg, #00BFA5 0%, #26A69A 25%, #00BFA5 50%, #26A69A 75%, #00BFA5 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: `${colorWave} 3s ease-in-out infinite`,
                  position: 'relative',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 191, 165, 0.3))',
                  '&::before': {
                    content: '"Todo"',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(0, 191, 165, 0.4) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: `${shimmer} 2s linear infinite`,
                    zIndex: 1,
                  },
                },
                '& .ak': {
                  display: 'inline-block',
                  background: 'linear-gradient(90deg, #1A237E 0%, #283593 25%, #3949AB 50%, #283593 75%, #1A237E 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: `${colorWave} 2.5s ease-in-out infinite`,
                  animationDelay: '0.3s',
                  position: 'relative',
                  marginLeft: '4px',
                  filter: 'drop-shadow(0 2px 4px rgba(25, 118, 210, 0.4))',
                  textShadow: '0 0 8px rgba(25, 118, 210, 0.3)',
                  '&::before': {
                    content: '"Ak"',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(25, 118, 210, 0.6) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: `${shimmer} 2.5s linear infinite`,
                    animationDelay: '0.3s',
                    zIndex: 1,
                  },
                  '&::after': {
                    content: '"Ak"',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    color: '#000',
                    WebkitTextStroke: '1px rgba(255, 255, 255, 0.8)',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                    zIndex: -1,
                    opacity: 0.3,
                  },
                },
                // Efecto de glow general
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, rgba(0, 191, 165, 0.1) 0%, rgba(25, 118, 210, 0.1) 50%, rgba(0, 191, 165, 0.1) 100%)',
                  backgroundSize: '200% 100%',
                  borderRadius: '4px',
                  filter: 'blur(8px)',
                  opacity: 0.6,
                  animation: `${colorWave} 4s ease-in-out infinite`,
                  zIndex: -1,
                  pointerEvents: 'none',
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
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDE7 100%)',
                color: '#333333',
                fontWeight: 700,
                border: '2px solid #FFD600',
                boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3), 0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(255, 214, 0, 0.4), 0 4px 8px rgba(0,0,0,0.15)',
                  transform: 'scale(1.1)',
                  borderColor: '#FFB300',
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
                px: 2.5,
                py: 1,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderWidth: '2px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  borderColor: '#000',
                  bgcolor: 'rgba(0,0,0,0.08)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
              background: 'linear-gradient(180deg, #FFFEF5 0%, #FFF9E5 50%, #FFF8E1 100%)',
              boxShadow: '4px 0 24px rgba(255, 179, 0, 0.2), 2px 0 12px rgba(0,0,0,0.1)',
              pt: { xs: 2, sm: 1, md: 0 },
              borderRight: '1px solid rgba(255, 214, 0, 0.2)',
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
              background: 'linear-gradient(180deg, #FFFEF5 0%, #FFF9E5 50%, #FFF8E1 100%)',
              boxShadow: '4px 0 24px rgba(255, 179, 0, 0.15), 2px 0 12px rgba(0,0,0,0.08)',
              borderRight: '1px solid rgba(255, 214, 0, 0.2)',
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
          background: 'linear-gradient(180deg, #FFFEF5 0%, #FFFDE7 50%, #FFF8E1 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 10% 20%, rgba(255, 214, 0, 0.06) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(255, 179, 0, 0.04) 0%, transparent 50%)',
            pointerEvents: 'none',
            zIndex: 0,
          },
          '& > *': {
            position: 'relative',
            zIndex: 1,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;

