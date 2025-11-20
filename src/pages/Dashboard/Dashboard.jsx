import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Paper } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PendingIcon from '@mui/icons-material/Pending';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { reportsAPI } from '../../services/api';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
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
        enProceso: reports.filter((r) => r.estado === 'EN_PROCESO').length,
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
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDE7 100%)',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          mb: 4,
          border: '1px solid rgba(255, 214, 0, 0.1)',
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
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF9C4 100%)',
              border: '1px solid rgba(255, 214, 0, 0.2)',
              borderRadius: 4,
              boxShadow: '0 4px 16px rgba(255, 214, 0, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, #FFB300 0%, #FFD600 100%)',
              },
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: '0 8px 24px rgba(255, 214, 0, 0.25)',
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
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF3E0 100%)',
              border: '1px solid rgba(251, 140, 0, 0.2)',
              borderRadius: 4,
              boxShadow: '0 4px 16px rgba(251, 140, 0, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, #FB8C00 0%, #FFA726 100%)',
              },
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: '0 8px 24px rgba(251, 140, 0, 0.25)',
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
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E0F7FA 100%)',
              border: '1px solid rgba(0, 191, 165, 0.2)',
              borderRadius: 4,
              boxShadow: '0 4px 16px rgba(0, 191, 165, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, #00BFA5 0%, #26A69A 100%)',
              },
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: '0 8px 24px rgba(0, 191, 165, 0.25)',
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
                  En Proceso
                </Typography>
                <PlayArrowIcon sx={{ color: '#00BFA5', fontSize: 28 }} />
              </Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  background: 'linear-gradient(135deg, #00BFA5 0%, #26A69A 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  fontSize: { xs: '2.5rem', sm: '3rem' },
                }}
              >
                {stats.enProceso}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E8F5E9 100%)',
              border: '1px solid rgba(67, 160, 71, 0.2)',
              borderRadius: 4,
              boxShadow: '0 4px 16px rgba(67, 160, 71, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, #43A047 0%, #66BB6A 100%)',
              },
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: '0 8px 24px rgba(67, 160, 71, 0.25)',
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
