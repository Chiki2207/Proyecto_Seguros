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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { reportsAPI } from '../../services/api';
import ReportTimeline from '../../components/ReportTimeline/ReportTimeline';
import UnifiedReportForm from '../../components/UnifiedReportForm/UnifiedReportForm';
import TechnicianDetailModal from '../../components/TechnicianDetailModal/TechnicianDetailModal';
import { generateReportPDF } from '../../utils/pdfGenerator';

// Animaciones suaves tipo escritura natural
const gentleFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const writeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const revealText = keyframes`
  from {
    opacity: 0;
    clip-path: inset(0 100% 0 0);
  }
  to {
    opacity: 1;
    clip-path: inset(0 0% 0 0);
  }
`;

const glowAppear = keyframes`
  0% {
    opacity: 0;
    filter: blur(4px);
  }
  50% {
    opacity: 0.5;
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    filter: blur(0);
  }
`;

const smoothScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const typewriterLine = keyframes`
  from {
    width: 0;
    opacity: 0.5;
  }
  to {
    width: 100%;
    opacity: 1;
  }
`;

function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Función helper para formatear números con separador de miles (coma)
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
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
  const [animationStep, setAnimationStep] = useState(0);
  const [changingEstado, setChangingEstado] = useState(false);
  const [newEstado, setNewEstado] = useState('');
  const [errorEstado, setErrorEstado] = useState('');
  const [editingValor, setEditingValor] = useState(false);
  const [newValor, setNewValor] = useState('');
  const [changingValor, setChangingValor] = useState(false);
  const [errorValor, setErrorValor] = useState('');

  useEffect(() => {
    loadReport();
  }, [id]);

  useEffect(() => {
    // Reiniciar animaciones cuando se carga un nuevo reporte
    if (report && !loading) {
      setAnimationStep(0);
      // Iniciar secuencia de animaciones
      const timer = setTimeout(() => {
        setAnimationStep(1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [report, loading]);

  useEffect(() => {
    // Inicializar el estado cuando se carga el reporte
    if (report) {
      setNewEstado(report.estado || 'PENDIENTE');
      const currentValor = report.valor !== undefined && report.valor !== null && report.valor !== -1 ? report.valor : -1;
      setNewValor(currentValor === -1 ? '' : currentValor.toString());
    }
  }, [report]);

  const handleChangeEstado = async () => {
    if (!newEstado || newEstado === report.estado) {
      return;
    }

    setChangingEstado(true);
    setErrorEstado('');

    try {
      await reportsAPI.update(id, { estado: newEstado });
      await loadReport();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      setErrorEstado(error.message || 'Error al actualizar el estado');
    } finally {
      setChangingEstado(false);
    }
  };

  const handleChangeValor = async () => {
    // Si está vacío o es -1, establecer como -1 (no facturado)
    const valorNumber = newValor === '' || newValor === '-1' ? -1 : Number(newValor) || -1;
    const currentValor = report.valor !== undefined && report.valor !== null ? report.valor : -1;
    
    if (valorNumber === currentValor) {
      setEditingValor(false);
      return;
    }

    setChangingValor(true);
    setErrorValor('');

    try {
      await reportsAPI.update(id, { valor: valorNumber });
      await loadReport();
      setEditingValor(false);
    } catch (error) {
      console.error('Error actualizando valor:', error);
      setErrorValor(error.message || 'Error al actualizar el valor');
    } finally {
      setChangingValor(false);
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setAnimationStep(0);
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        py: 3,
        background: 'linear-gradient(180deg, rgba(255, 253, 231, 0.3) 0%, rgba(255, 248, 225, 0.1) 100%)',
      }}
    >
      {/* Botones de navegación */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3, 
        flexWrap: 'wrap', 
        gap: 2,
        width: '100%',
        maxWidth: '900px',
        px: 2,
      }}>
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

      {/* Contenedor principal centrado tipo Word */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '900px',
          mx: 'auto',
          px: { xs: 2, sm: 4 },
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
            mb: 4,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          animation: animationStep >= 1 ? `${glowAppear} 1s ease-out` : 'none',
          }}
        >
          Detalle del Reporte
        </Typography>

        {/* Contenedor de contenido - Una sola columna */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* 1. Información General */}
          <Paper
            sx={{
              p: { xs: 3, sm: 4 },
              bgcolor: '#FFFFFF',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255, 214, 0, 0.1)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 253, 231, 0.9) 100%)',
              animation: animationStep >= 1 ? `${writeIn} 0.6s ease-out 0.2s both` : 'none',
              position: 'relative',
              overflow: 'hidden',
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
                textAlign: 'center',
                position: 'relative',
                animation: animationStep >= 1 ? `${slideDown} 0.6s ease-out 0.4s both` : 'none',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0%',
                  height: '3px',
                  background: 'linear-gradient(90deg, #FFD600, #FFB300)',
                  animation: animationStep >= 1 ? `${typewriterLine} 0.8s ease-out 0.6s both` : 'none',
                },
              }}
            >
              Información del Reporte
            </Typography>
            <Divider sx={{ mb: 3, borderColor: 'rgba(255, 214, 0, 0.3)' }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '600px', mx: 'auto' }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#FFF8E1',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 214, 0, 0.2)',
                      animation: animationStep >= 1 ? `${writeIn} 0.5s ease-out 0.8s both` : 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)',
                      },
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                      Estado
                    </Typography>
                    <Chip 
                      label={report.estado} 
                      color={getEstadoColor(report.estado)} 
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        animation: animationStep >= 1 ? `${smoothScale} 0.4s ease-out 1s both` : 'none',
                      }}
                    />
                  </Box>
                  
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#FFF8E1',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 214, 0, 0.2)',
                      animation: animationStep >= 1 ? `${writeIn} 0.5s ease-out 1.1s both` : 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)',
                      },
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                      Cliente
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#333',
                        animation: animationStep >= 1 ? `${gentleFadeIn} 0.6s ease-out 1.3s both` : 'none',
                      }}
                    >
                      {report.client?.name || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#FFF8E1',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 214, 0, 0.2)',
                      animation: animationStep >= 1 ? `${writeIn} 0.5s ease-out 1.4s both` : 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)',
                      },
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
                          animation: animationStep >= 1 ? `${smoothScale} 0.4s ease-out 1.6s both` : 'none',
                        }}
                      >
                        {report.createdByUser?.fullName?.charAt(0) || 'U'}
                      </Avatar>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500, 
                          color: '#333',
                          animation: animationStep >= 1 ? `${gentleFadeIn} 0.5s ease-out 1.7s both` : 'none',
                        }}
                      >
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
                      animation: animationStep >= 1 ? `${writeIn} 0.5s ease-out 1.8s both` : 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)',
                      },
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                      Fecha de Creación
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500, 
                        color: '#333',
                        animation: animationStep >= 1 ? `${gentleFadeIn} 0.5s ease-out 2s both` : 'none',
                      }}
                    >
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
          </Paper>

          {/* Sección de Cambio de Estado - Solo para ADMIN */}
          {isAdmin && (
            <Paper
              sx={{
                p: { xs: 3, sm: 4 },
                bgcolor: '#FFFFFF',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '2px solid rgba(26, 35, 126, 0.2)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 234, 246, 0.3) 100%)',
                animation: animationStep >= 1 ? `${writeIn} 0.6s ease-out 2.1s both` : 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1A237E',
                  mb: 3,
                  textAlign: 'center',
                  animation: animationStep >= 1 ? `${slideDown} 0.5s ease-out 2.2s both` : 'none',
                }}
              >
                Cambiar Estado del Reporte
              </Typography>
              <Divider sx={{ mb: 3, borderColor: 'rgba(26, 35, 126, 0.3)' }} />

              {errorEstado && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorEstado('')}>
                  {errorEstado}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '600px', mx: 'auto' }}>
                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: '#E8EAF6',
                    borderRadius: 2,
                    border: '1px solid rgba(26, 35, 126, 0.2)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666', mb: 0.5 }}>
                        Estado Actual
                      </Typography>
                      <Chip
                        label={report.estado}
                        color={getEstadoColor(report.estado)}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          py: 1.5,
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                      <FormControl fullWidth>
                        <InputLabel>Nuevo Estado</InputLabel>
                        <Select
                          value={newEstado}
                          onChange={(e) => {
                            setNewEstado(e.target.value);
                            setErrorEstado('');
                          }}
                          label="Nuevo Estado"
                          disabled={changingEstado}
                          sx={{
                            bgcolor: '#FFFFFF',
                          }}
                        >
                          <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
                          <MenuItem value="EN_PROCESO">EN_PROCESO</MenuItem>
                          <MenuItem value="TERMINADO">TERMINADO</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                  
                  {newEstado !== report.estado && (
                    <Button
                      variant="contained"
                      onClick={handleChangeEstado}
                      disabled={changingEstado || !newEstado || newEstado === report.estado}
                      fullWidth
                      sx={{
                        mt: 2,
                        bgcolor: '#1A237E',
                        color: '#FFF',
                        fontWeight: 700,
                        py: 1.5,
                        '&:hover': { 
                          bgcolor: '#283593',
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          bgcolor: '#E0E0E0',
                          color: '#9E9E9E',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {changingEstado ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1, color: '#FFF' }} />
                          Guardando...
                        </>
                      ) : (
                        'Guardar Cambio de Estado'
                      )}
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          )}

          {/* 2. Técnicos Asignados */}
          <Paper
            sx={{
              p: { xs: 3, sm: 4 },
              bgcolor: '#FFFFFF',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255, 214, 0, 0.1)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 253, 231, 0.9) 100%)',
              animation: animationStep >= 1 ? `${writeIn} 0.6s ease-out 2.2s both` : 'none',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                color: '#333', 
                mb: 3,
                textAlign: 'center',
                position: 'relative',
                animation: animationStep >= 1 ? `${slideDown} 0.5s ease-out 2.3s both` : 'none',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0%',
                  height: '2px',
                  background: 'linear-gradient(90deg, #FFD600, #FFB300)',
                  animation: animationStep >= 1 ? `${typewriterLine} 0.7s ease-out 2.4s both` : 'none',
                },
              }}
            >
              Técnicos Asignados
            </Typography>
            <Divider sx={{ mb: 3, borderColor: 'rgba(255, 214, 0, 0.3)' }} />
            
            <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
                  {report.technicians && report.technicians.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {report.technicians.map((tech, index) => (
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
                            animation: animationStep >= 1 ? `${writeIn} 0.5s ease-out ${2.5 + (index * 0.15)}s both` : 'none',
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
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                      No hay técnicos asignados
                    </Typography>
                  )}
            </Box>
          </Paper>

          {/* 3. Diagnóstico, Causa y Acciones - En columna vertical */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Diagnóstico */}
            <Paper
              sx={{
                p: 3,
                bgcolor: '#FFFFFF',
                borderRadius: 3,
                border: '1px solid rgba(255, 214, 0, 0.3)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                borderLeft: '4px solid #FFD600',
                transition: 'all 0.3s ease',
                animation: animationStep >= 1 ? `${revealText} 0.7s ease-out 3.2s both` : 'none',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  boxShadow: '0 6px 24px rgba(255, 214, 0, 0.25)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', animation: animationStep >= 1 ? `${slideDown} 0.5s ease-out 3.3s both` : 'none' }}>
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
                            lineHeight: 1.8,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            animation: animationStep >= 1 ? `${gentleFadeIn} 0.8s ease-out 3.4s both` : 'none',
                            textAlign: 'justify',
                            maxWidth: '800px',
                            mx: 'auto',
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

            {/* Causa */}
            <Paper
              sx={{
                p: 3,
                bgcolor: '#FFFFFF',
                borderRadius: 3,
                border: '1px solid rgba(255, 214, 0, 0.3)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                borderLeft: '4px solid #FFD600',
                transition: 'all 0.3s ease',
                animation: animationStep >= 1 ? `${revealText} 0.7s ease-out 3.5s both` : 'none',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  boxShadow: '0 6px 24px rgba(255, 214, 0, 0.25)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', animation: animationStep >= 1 ? `${slideDown} 0.5s ease-out 3.6s both` : 'none' }}>
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
                            lineHeight: 1.8,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            animation: animationStep >= 1 ? `${gentleFadeIn} 0.8s ease-out 3.7s both` : 'none',
                            textAlign: 'justify',
                            maxWidth: '800px',
                            mx: 'auto',
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

            {/* Acciones */}
            <Paper
              sx={{
                p: 3,
                bgcolor: '#FFFFFF',
                borderRadius: 3,
                border: '1px solid rgba(255, 214, 0, 0.3)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                borderLeft: '4px solid #FFD600',
                transition: 'all 0.3s ease',
                animation: animationStep >= 1 ? `${revealText} 0.7s ease-out 3.8s both` : 'none',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  boxShadow: '0 6px 24px rgba(255, 214, 0, 0.25)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', animation: animationStep >= 1 ? `${slideDown} 0.5s ease-out 3.9s both` : 'none' }}>
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
                            lineHeight: 1.8,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            animation: animationStep >= 1 ? `${gentleFadeIn} 0.8s ease-out 4s both` : 'none',
                            textAlign: 'justify',
                            maxWidth: '800px',
                            mx: 'auto',
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
          </Box>

          {/* 4. Historial Completo - ANTES de Materiales y Servicios */}
          <Accordion
            defaultExpanded={false}
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255, 214, 0, 0.1)',
              '&:before': { display: 'none' },
              overflow: 'hidden',
              animation: animationStep >= 1 ? `${writeIn} 0.6s ease-out 4.5s both` : 'none',
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

          {/* 5. Formulario Unificado para Técnicos Asignados - Desplegable */}
          {isAssignedTechnician && (
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
          )}

          {/* 6. Materiales Usados - AL FINAL */}
          <Paper
            sx={{
              p: 3,
              bgcolor: '#FFFFFF',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(255, 214, 0, 0.1)',
              animation: animationStep >= 1 ? `${writeIn} 0.6s ease-out 5.5s both` : 'none',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333333', mb: 2, textAlign: 'center' }}>
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
              <Typography color="text.secondary" sx={{ textAlign: 'center' }}>No hay materiales registrados</Typography>
            )}
          </Paper>

          {/* 7. Servicios Facturados - AL FINAL */}
          <Paper
            sx={{
              p: 3,
              bgcolor: '#FFFFFF',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(255, 214, 0, 0.1)',
              animation: animationStep >= 1 ? `${writeIn} 0.6s ease-out 5.8s both` : 'none',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333333', mb: 2, textAlign: 'center' }}>
              Servicios Facturados
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2, textAlign: 'center' }}>
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
              <Typography color="text.secondary" sx={{ textAlign: 'center' }}>No hay servicios facturados</Typography>
            )}
          </Paper>

          {/* 8. Monto del Siniestro - Solo para ADMIN - Al Final */}
          {isAdmin && (
            <Paper
              sx={{
                p: { xs: 3, sm: 4 },
                bgcolor: '#FFFFFF',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '2px solid rgba(76, 175, 80, 0.3)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 245, 233, 0.3) 100%)',
                animation: animationStep >= 1 ? `${writeIn} 0.6s ease-out 6s both` : 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#4CAF50',
                  mb: 3,
                  textAlign: 'center',
                  animation: animationStep >= 1 ? `${slideDown} 0.5s ease-out 6.1s both` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                <AttachMoneyIcon sx={{ fontSize: 28 }} />
                Monto del Siniestro
              </Typography>
              <Divider sx={{ mb: 3, borderColor: 'rgba(76, 175, 80, 0.3)' }} />

              {errorValor && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorValor('')}>
                  {errorValor}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '600px', mx: 'auto' }}>
                {!editingValor ? (
                  <Box
                    sx={{
                      p: 2.5,
                      bgcolor: '#E8F5E9',
                      borderRadius: 2,
                      border: '1px solid rgba(76, 175, 80, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666', mb: 0.5 }}>
                          Monto Actual
                        </Typography>
                        {(report.valor === undefined || report.valor === null || report.valor === -1) ? (
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: '#FF9800',
                              fontSize: { xs: '1.25rem', sm: '1.5rem' },
                            }}
                          >
                            No definido (No facturado)
                          </Typography>
                        ) : (
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color: '#4CAF50',
                              fontSize: { xs: '1.5rem', sm: '2rem' },
                            }}
                          >
                            ${formatNumber(report.valor)}
                          </Typography>
                        )}
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setEditingValor(true);
                          const currentValor = report.valor !== undefined && report.valor !== null && report.valor !== -1 ? report.valor : -1;
                          setNewValor(currentValor === -1 ? '' : currentValor.toString());
                        }}
                        sx={{
                          bgcolor: '#4CAF50',
                          color: '#FFF',
                          fontWeight: 700,
                          px: 3,
                          py: 1.5,
                          '&:hover': {
                            bgcolor: '#45A049',
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {report.valor === -1 || report.valor === undefined || report.valor === null ? 'Definir Monto' : 'Editar Monto'}
                      </Button>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Estado de Facturación
                      </Typography>
                      <Chip 
                        label={report.billedStatus || 'NO_FACTURADO'} 
                        size="small"
                        color={report.billedStatus === 'FACTURADO' ? 'success' : 'warning'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 2.5,
                      bgcolor: '#E8F5E9',
                      borderRadius: 2,
                      border: '1px solid rgba(76, 175, 80, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Monto del Siniestro"
                      type="number"
                      value={newValor}
                      onChange={(e) => {
                        setNewValor(e.target.value);
                        setErrorValor('');
                      }}
                      placeholder="Dejar vacío para no facturado (-1)"
                      helperText={newValor === '' || newValor === '-1' ? 'Si deja vacío o -1, el reporte será NO_FACTURADO. Si ingresa un valor, será FACTURADO automáticamente.' : `El reporte será marcado como FACTURADO con monto $${formatNumber(Number(newValor || 0))}`}
                      InputLabelProps={{
                        shrink: true,
                        sx: { fontWeight: 600, color: '#666' },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography sx={{ color: '#666', fontWeight: 600 }}>
                              $
                            </Typography>
                          </InputAdornment>
                        ),
                      }}
                      disabled={changingValor}
                      sx={{
                        bgcolor: '#FFFFFF',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(76, 175, 80, 0.4)',
                          borderWidth: '2px',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(76, 175, 80, 0.6)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4CAF50',
                          borderWidth: '2px',
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleChangeValor}
                        disabled={changingValor}
                        sx={{
                          flex: 1,
                          bgcolor: '#4CAF50',
                          color: '#FFF',
                          fontWeight: 700,
                          py: 1.5,
                          '&:hover': {
                            bgcolor: '#45A049',
                            transform: 'translateY(-2px)',
                          },
                          '&:disabled': {
                            bgcolor: '#E0E0E0',
                            color: '#9E9E9E',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {changingValor ? (
                          <>
                            <CircularProgress size={20} sx={{ mr: 1, color: '#FFF' }} />
                            Guardando...
                          </>
                        ) : (
                          'Guardar Monto'
                        )}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={() => {
                          setEditingValor(false);
                          const currentValor = report.valor !== undefined && report.valor !== null && report.valor !== -1 ? report.valor : -1;
                          setNewValor(currentValor === -1 ? '' : currentValor.toString());
                          setErrorValor('');
                        }}
                        disabled={changingValor}
                        sx={{
                          flex: 1,
                          borderColor: '#666',
                          color: '#666',
                          fontWeight: 600,
                          py: 1.5,
                          '&:hover': {
                            borderColor: '#000',
                            bgcolor: 'rgba(0,0,0,0.05)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

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

