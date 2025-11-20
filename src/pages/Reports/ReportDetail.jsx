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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { reportsAPI } from '../../services/api';
import ReportTimeline from '../../components/ReportTimeline/ReportTimeline';
import UnifiedReportForm from '../../components/UnifiedReportForm/UnifiedReportForm';
import TechnicianDetailModal from '../../components/TechnicianDetailModal/TechnicianDetailModal';
import { generateReportPDF } from '../../utils/pdfGenerator';

function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [technicianModalOpen, setTechnicianModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    diagnostico: false,
    causa: false,
    acciones: false,
  });
  const [generatingPDF, setGeneratingPDF] = useState(false);

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

  const handleViewTechnician = (tech) => {
    setSelectedTechnician(tech);
    setTechnicianModalOpen(true);
  };

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    try {
      console.log('📄 Generando PDF con datos:');
      console.log('Reporte:', report);
      console.log('Historial:', report.history);
      console.log('Media:', report.media);
      
      await generateReportPDF(
        report, 
        report.history || [], 
        report.media || []
      );
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      alert(`Error al generar el PDF: ${error.message || 'Error desconocido'}. Revisa la consola para más detalles.`);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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
  const isTechnician = user?.role === 'TECNICO';
  const currentUserId = user?._id?.toString() || user?.userId?.toString();
  
  // Verificar si el técnico está asignado al reporte
  const isAssignedTechnician = isTechnician && report?.technicianIds?.some(
    (techId) => techId.toString() === currentUserId
  );

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(isAdmin ? '/reports' : '/my-reports')} 
          sx={{ color: '#FFB300', fontWeight: 600 }}
        >
          Volver
        </Button>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleDownloadPDF}
          disabled={generatingPDF}
          sx={{
            background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
            color: '#000',
            fontWeight: 700,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)',
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': {
              background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
              boxShadow: '0 6px 16px rgba(255, 214, 0, 0.4)',
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              background: '#E0E0E0',
              color: '#9E9E9E',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {generatingPDF ? 'Generando PDF...' : 'Descargar PDF'}
        </Button>
      </Box>

      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 3,
        }}
      >
        Detalle del Reporte
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1, width: '100%', maxWidth: '100%' }}>
        {/* Información General y Técnicos Unificados */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              bgcolor: '#FFFFFF',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255, 214, 0, 0.1)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 253, 231, 0.9) 100%)',
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
              }}
            >
              Información del Reporte
            </Typography>
            <Divider sx={{ mb: 3, borderColor: 'rgba(255, 214, 0, 0.3)' }} />
            
            <Grid container spacing={3}>
              {/* Columna Izquierda - Información General */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#FFF8E1',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 214, 0, 0.2)',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                      Estado
                    </Typography>
                    <Chip 
                      label={report.estado} 
                      color={getEstadoColor(report.estado)} 
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#FFF8E1',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 214, 0, 0.2)',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                      Cliente
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                      {report.client?.name || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#FFF8E1',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 214, 0, 0.2)',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                      Creado por
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: '#FFD600',
                          color: '#000',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                        }}
                      >
                        {report.createdByUser?.fullName?.charAt(0) || 'U'}
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#333' }}>
                        {report.createdByUser?.fullName || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#FFF8E1',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 214, 0, 0.2)',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                      Fecha de Creación
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#333' }}>
                      {new Date(report.createdAt).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Columna Derecha - Técnicos Asignados */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#FFF8E1',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 214, 0, 0.2)',
                    minHeight: '100%',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                    Técnicos Asignados
                  </Typography>
                  {report.technicians && report.technicians.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {report.technicians.map((tech) => (
                        <Box
                          key={tech._id}
                          sx={{
                            p: 1.5,
                            bgcolor: '#FFFFFF',
                            borderRadius: 2,
                            border: '1px solid rgba(255, 214, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            '&:hover': {
                              bgcolor: '#FFE082',
                              transform: 'translateX(4px)',
                              boxShadow: '0 4px 12px rgba(255, 214, 0, 0.2)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: '#FFD600',
                              color: '#000',
                              fontSize: '0.875rem',
                              fontWeight: 700,
                            }}
                          >
                            {tech.fullName?.charAt(0) || 'T'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                              {tech.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {tech.documentType} {tech.documentNumber}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={tech.role}
                              size="small"
                              sx={{
                                bgcolor: tech.role === 'ADMIN' ? '#1A237E' : '#00BFA5',
                                color: '#FFF',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                              }}
                            />
                            <Tooltip title="Ver información completa">
                              <IconButton
                                size="small"
                                onClick={() => handleViewTechnician(tech)}
                                sx={{
                                  color: '#FFB300',
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 179, 0, 0.1)',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No hay técnicos asignados
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Diagnóstico, Causa y Acciones - Mejorados con "Ver más" */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{
                        p: 2.5,
                        bgcolor: '#FFF8E1',
                        borderRadius: 3,
                        border: '1px solid rgba(255, 214, 0, 0.3)',
                        height: '100%',
                        boxShadow: '0 2px 8px rgba(255, 214, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 16px rgba(255, 214, 0, 0.2)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333', fontSize: '0.95rem' }}>
                          Diagnóstico Inicial
                        </Typography>
                        {(report.diagnosticoInicial?.length > 100) && (
                          <IconButton
                            size="small"
                            onClick={() => toggleSection('diagnostico')}
                            sx={{ color: '#FFB300' }}
                          >
                            {expandedSections.diagnostico ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        )}
                      </Box>
                      <Collapse in={expandedSections.diagnostico || !(report.diagnosticoInicial?.length > 100)} collapsedSize={60}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#555', 
                            lineHeight: 1.7,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {report.diagnosticoInicial || 'N/A'}
                        </Typography>
                      </Collapse>
                      {report.diagnosticoInicial?.length > 100 && !expandedSections.diagnostico && (
                        <Button
                          size="small"
                          onClick={() => toggleSection('diagnostico')}
                          sx={{
                            mt: 1,
                            color: '#FFB300',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                          }}
                        >
                          Ver más
                        </Button>
                      )}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{
                        p: 2.5,
                        bgcolor: '#FFF8E1',
                        borderRadius: 3,
                        border: '1px solid rgba(255, 214, 0, 0.3)',
                        height: '100%',
                        boxShadow: '0 2px 8px rgba(255, 214, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 16px rgba(255, 214, 0, 0.2)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333', fontSize: '0.95rem' }}>
                          Causa
                        </Typography>
                        {(report.causa?.length > 100) && (
                          <IconButton
                            size="small"
                            onClick={() => toggleSection('causa')}
                            sx={{ color: '#FFB300' }}
                          >
                            {expandedSections.causa ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        )}
                      </Box>
                      <Collapse in={expandedSections.causa || !(report.causa?.length > 100)} collapsedSize={60}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#555', 
                            lineHeight: 1.7,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {report.causa || 'N/A'}
                        </Typography>
                      </Collapse>
                      {report.causa?.length > 100 && !expandedSections.causa && (
                        <Button
                          size="small"
                          onClick={() => toggleSection('causa')}
                          sx={{
                            mt: 1,
                            color: '#FFB300',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                          }}
                        >
                          Ver más
                        </Button>
                      )}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{
                        p: 2.5,
                        bgcolor: '#FFF8E1',
                        borderRadius: 3,
                        border: '1px solid rgba(255, 214, 0, 0.3)',
                        height: '100%',
                        boxShadow: '0 2px 8px rgba(255, 214, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 16px rgba(255, 214, 0, 0.2)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333', fontSize: '0.95rem' }}>
                          Acciones
                        </Typography>
                        {(report.acciones?.length > 100) && (
                          <IconButton
                            size="small"
                            onClick={() => toggleSection('acciones')}
                            sx={{ color: '#FFB300' }}
                          >
                            {expandedSections.acciones ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        )}
                      </Box>
                      <Collapse in={expandedSections.acciones || !(report.acciones?.length > 100)} collapsedSize={60}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#555', 
                            lineHeight: 1.7,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {report.acciones || 'N/A'}
                        </Typography>
                      </Collapse>
                      {report.acciones?.length > 100 && !expandedSections.acciones && (
                        <Button
                          size="small"
                          onClick={() => toggleSection('acciones')}
                          sx={{
                            mt: 1,
                            color: '#FFB300',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                          }}
                        >
                          Ver más
                        </Button>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Formulario Unificado para Técnicos Asignados - Desplegable */}
        {isAssignedTechnician && (
          <Grid item xs={12}>
            <Accordion
              defaultExpanded={false}
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(255, 214, 0, 0.1)',
                '&:before': { display: 'none' },
                overflow: 'hidden',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#FFB300' }} />}
                sx={{
                  bgcolor: 'linear-gradient(135deg, rgba(255, 214, 0, 0.1) 0%, rgba(255, 253, 231, 0.9) 100%)',
                  py: 2,
                  px: 3,
                  '&:hover': {
                    bgcolor: 'rgba(255, 214, 0, 0.15)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: '#FFD600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)',
                    }}
                  >
                    <AddIcon sx={{ color: '#000', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Registrar Avance
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sube evidencias, agrega comentarios, materiales y servicios
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  <UnifiedReportForm
                    reportId={id}
                    clientId={report.clientId?.toString()}
                    onUpdate={loadReport}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}

        {/* Materiales y Servicios - Solo lectura para administradores y técnicos no asignados */}
        {!isAssignedTechnician && (
          <>
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
          </>
        )}

        {/* Historial Completo - Desplegable */}
        <Grid item xs={12}>
          <Accordion
            defaultExpanded={false}
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255, 214, 0, 0.1)',
              '&:before': { display: 'none' },
              overflow: 'hidden',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#FFB300' }} />}
              sx={{
                bgcolor: 'linear-gradient(135deg, rgba(255, 214, 0, 0.1) 0%, rgba(255, 253, 231, 0.9) 100%)',
                py: 2,
                px: 3,
                '&:hover': {
                  bgcolor: 'rgba(255, 214, 0, 0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: '#FFD600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)',
                  }}
                >
                  <HistoryIcon sx={{ color: '#000', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Historial Completo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ver todas las actividades, evidencias y comentarios del reporte
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <ReportTimeline
                  reportId={id}
                  history={report.history || []}
                  media={report.media || []}
                  onUpdate={loadReport}
                  isAssignedTechnician={isAssignedTechnician}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {/* Modal de Información del Técnico */}
      <TechnicianDetailModal
        open={technicianModalOpen}
        onClose={() => {
          setTechnicianModalOpen(false);
          setSelectedTechnician(null);
        }}
        technician={selectedTechnician}
      />
    </Box>
  );
}

export default ReportDetail;

