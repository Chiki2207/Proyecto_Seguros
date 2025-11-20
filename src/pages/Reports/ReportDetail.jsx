import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { reportsAPI } from '../../services/api';
import MediaGallery from '../../components/MediaGallery/MediaGallery';

function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      const data = await reportsAPI.getById(id);
      setReport(data);
    } catch (error) {
      console.error('Error cargando reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'warning';
      case 'EN_PROCESO':
        return 'info';
      case 'TERMINADO':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!report) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Reporte no encontrado</Typography>
      </Box>
    );
  }

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
    >
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(isAdmin ? '/reports' : '/my-reports')} 
        sx={{ mb: 2, color: '#FFB300' }}
      >
        Volver
      </Button>

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#333' }}>
        Detalle del Reporte
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1, width: '100%', maxWidth: '100%' }}>
        {/* Información General */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              bgcolor: '#FFFFFF',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333333', mb: 2 }}>
              Información General
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Estado
                </Typography>
                <Chip label={report.estado} color={getEstadoColor(report.estado)} size="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Cliente
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {report.client?.name || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Creado por
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {report.createdByUser?.fullName || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Fecha creación
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {new Date(report.createdAt).toLocaleString('es-ES')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Diagnóstico inicial
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 400 }}>
                  {report.diagnosticoInicial || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Causa
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 400 }}>
                  {report.causa || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Acciones
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 400 }}>
                  {report.acciones || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Técnicos Asignados */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              bgcolor: '#FFFFFF',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333333', mb: 2 }}>
              Técnicos Asignados
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {report.technicians && report.technicians.length > 0 ? (
              <List>
                {report.technicians.map((tech) => (
                  <ListItem
                    key={tech._id}
                    sx={{
                      bgcolor: '#FFF8E1',
                      mb: 1,
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#FFE082' },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ListItemText
                      primary={tech.fullName}
                      secondary={`${tech.documentType} ${tech.documentNumber} - ${tech.role}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No hay técnicos asignados</Typography>
            )}
          </Paper>
        </Grid>

        {/* Multimedia */}
        <Grid item xs={12}>
          <MediaGallery
            reportId={id}
            media={report.media || []}
            onRefresh={loadReport}
          />
        </Grid>

        {/* Materiales y Servicios */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              bgcolor: '#FFFFFF',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333333', mb: 2 }}>
              Materiales Usados
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {report.materialsUsed && report.materialsUsed.length > 0 ? (
              <List>
                {report.materialsUsed.map((material, idx) => (
                  <ListItem
                    key={idx}
                    sx={{
                      bgcolor: '#FFF8E1',
                      mb: 1,
                      borderRadius: 2,
                    }}
                  >
                    <ListItemText
                      primary={material.name}
                      secondary={`Cantidad: ${material.quantity} - Costo: $${material.totalCost?.toLocaleString('es-ES') || '0'}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No hay materiales registrados</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              bgcolor: '#FFFFFF',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333333', mb: 2 }}>
              Servicios Facturados
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Estado
              </Typography>
              <Chip label={report.billedStatus} size="small" />
            </Box>
            {report.servicesBilled && report.servicesBilled.length > 0 ? (
              <List>
                {report.servicesBilled.map((service, idx) => (
                  <ListItem
                    key={idx}
                    sx={{
                      bgcolor: '#FFF8E1',
                      mb: 1,
                      borderRadius: 2,
                    }}
                  >
                    <ListItemText
                      primary={`Cantidad: ${service.quantity}`}
                      secondary={`Subtotal: $${service.subtotal?.toLocaleString('es-ES') || '0'}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No hay servicios facturados</Typography>
            )}
          </Paper>
        </Grid>

        {/* Historial */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              bgcolor: '#FFFFFF',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333333', mb: 2 }}>
              Historial
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {report.history && report.history.length > 0 ? (
              <Box sx={{ position: 'relative', pl: 3 }}>
                {report.history.map((entry, idx) => (
                  <Box
                    key={entry._id}
                    sx={{
                      position: 'relative',
                      pb: 3,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: '-11px',
                        top: 8,
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        bgcolor: '#FFD600',
                        border: '2px solid #FFFFFF',
                        boxShadow: '0 0 0 2px #FFD600',
                      },
                      '&::after': idx !== report.history.length - 1 ? {
                        content: '""',
                        position: 'absolute',
                        left: '-6px',
                        top: 20,
                        width: '2px',
                        height: 'calc(100% - 8px)',
                        bgcolor: '#FFE082',
                      } : {},
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: '#FFF8E1',
                        borderRadius: 2,
                        ml: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                          {entry.type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(entry.createdAt).toLocaleString('es-ES')}
                        </Typography>
                      </Box>
                      {entry.oldStatus && entry.newStatus && (
                        <Box sx={{ mb: 1 }}>
                          <Chip
                            label={entry.oldStatus}
                            size="small"
                            sx={{ mr: 1, bgcolor: '#FFE082' }}
                          />
                          <span>→</span>
                          <Chip
                            label={entry.newStatus}
                            size="small"
                            sx={{ ml: 1, bgcolor: '#FFD600' }}
                          />
                        </Box>
                      )}
                      <Typography variant="body2" sx={{ color: '#555' }}>
                        {entry.comment}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">No hay historial</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ReportDetail;

