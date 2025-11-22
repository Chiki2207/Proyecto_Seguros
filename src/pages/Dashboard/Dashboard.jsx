import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Paper, keyframes } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { reportsAPI } from '../../services/api';

const shimmer = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    terminados: 0,
  });
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const filters = isAdmin ? {} : { technicianId: user.userId };
      const reports = await reportsAPI.getAll(filters);

      const statsData = {
        total: reports.length,
        pendientes: reports.filter((r) => r.estado === 'PENDIENTE').length,
        terminados: reports.filter((r) => r.estado === 'TERMINADO').length,
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 253, 231, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(255, 179, 0, 0.15), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          mb: 4,
          border: '1px solid rgba(255, 214, 0, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #FFD600 0%, #FFB300 50%, #F9A825 100%)',
            borderRadius: '4px 4px 0 0',
          },
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 700, 
            background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.75rem', sm: '2.25rem' },
            mb: 1,
          }}
        >
          Dashboard – {isAdmin ? 'Administrador' : 'Técnico'}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#666666',
            fontWeight: 500,
            fontSize: '1.1rem',
            mb: 0,
          }}
        >
          Bienvenido, <Box component="span" sx={{ color: '#FFB300', fontWeight: 600 }}>{user?.fullName}</Box>
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 249, 196, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 214, 0, 0.3)',
              borderRadius: 4,
              boxShadow: '0 6px 24px rgba(255, 214, 0, 0.2), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, #FFB300 0%, #FFD600 50%, #FFB300 100%)',
                backgroundSize: '200% 100%',
                animation: `${shimmer} 3s ease-in-out infinite`,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255, 214, 0, 0.1) 0%, transparent 70%)',
                opacity: 0,
                transition: 'opacity 0.4s ease',
              },
              '&:hover': {
                transform: 'translateY(-8px) scale(1.03)',
                boxShadow: '0 12px 32px rgba(255, 214, 0, 0.3), 0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(255, 214, 0, 0.5)',
                '&::after': {
                  opacity: 1,
                },
              },
            }}
          >
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography 
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#666666',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Total Reportes
                </Typography>
                <AssessmentIcon sx={{ color: '#FFB300', fontSize: 28 }} />
              </Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  fontSize: { xs: '2.5rem', sm: '3rem' },
                }}
              >
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 243, 224, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(251, 140, 0, 0.3)',
              borderRadius: 4,
              boxShadow: '0 6px 24px rgba(251, 140, 0, 0.2), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, #FB8C00 0%, #FFA726 50%, #FB8C00 100%)',
                backgroundSize: '200% 100%',
                animation: `${shimmer} 3s ease-in-out infinite`,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(251, 140, 0, 0.1) 0%, transparent 70%)',
                opacity: 0,
                transition: 'opacity 0.4s ease',
              },
              '&:hover': {
                transform: 'translateY(-8px) scale(1.03)',
                boxShadow: '0 12px 32px rgba(251, 140, 0, 0.3), 0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(251, 140, 0, 0.5)',
                '&::after': {
                  opacity: 1,
                },
              },
            }}
          >
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography 
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#666666',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Pendientes
                </Typography>
                <PendingIcon sx={{ color: '#FB8C00', fontSize: 28 }} />
              </Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  background: 'linear-gradient(135deg, #FB8C00 0%, #FFA726 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  fontSize: { xs: '2.5rem', sm: '3rem' },
                }}
              >
                {stats.pendientes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 245, 233, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(67, 160, 71, 0.3)',
              borderRadius: 4,
              boxShadow: '0 6px 24px rgba(67, 160, 71, 0.2), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, #43A047 0%, #66BB6A 50%, #43A047 100%)',
                backgroundSize: '200% 100%',
                animation: `${shimmer} 3s ease-in-out infinite`,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(67, 160, 71, 0.1) 0%, transparent 70%)',
                opacity: 0,
                transition: 'opacity 0.4s ease',
              },
              '&:hover': {
                transform: 'translateY(-8px) scale(1.03)',
                boxShadow: '0 12px 32px rgba(67, 160, 71, 0.3), 0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(67, 160, 71, 0.5)',
                '&::after': {
                  opacity: 1,
                },
              },
            }}
          >
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography 
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#666666',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Terminados
                </Typography>
                <CheckCircleIcon sx={{ color: '#43A047', fontSize: 28 }} />
              </Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  background: 'linear-gradient(135deg, #43A047 0%, #66BB6A 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  fontSize: { xs: '2.5rem', sm: '3rem' },
                }}
              >
                {stats.terminados}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
