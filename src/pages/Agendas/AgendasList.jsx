import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  useTheme,
  useMediaQuery,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventIcon from '@mui/icons-material/Event';
import { agendasAPI } from '../../services/api';

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const diasSemanaCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Función para normalizar fechas (solo fecha, sin hora) - usando hora local
const getDateOnly = (date) => {
  if (!date) return null;
  const d = new Date(date);
  // Usar métodos locales para evitar problemas de zona horaria
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  return new Date(year, month, day, 0, 0, 0, 0);
};

// Función para comparar solo la fecha (sin hora)
const isSameDate = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = getDateOnly(date1);
  const d2 = getDateOnly(date2);
  return d1.getTime() === d2.getTime();
};

// Función para obtener la fecha en formato YYYY-MM-DD en hora local
const getLocalDateString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function AgendasList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState(null);
  const [viewType, setViewType] = useState('dia');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState('');

  useEffect(() => {
    loadAgendas();
  }, [viewType, currentDate]);

  const loadAgendas = async () => {
    try {
      setLoading(true);
      let filters = {};
      
      if (viewType === 'dia') {
        const fechaStr = getLocalDateString(currentDate);
        filters = { fecha: fechaStr };
      } else if (viewType === 'semana') {
        const inicioSemana = new Date(currentDate);
        inicioSemana.setDate(currentDate.getDate() - currentDate.getDay());
        inicioSemana.setHours(0, 0, 0, 0);
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        finSemana.setHours(23, 59, 59, 999);
        filters = {
          fechaInicio: getLocalDateString(inicioSemana),
          fechaFin: getLocalDateString(finSemana),
        };
      } else if (viewType === 'mes') {
        const inicioMes = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        inicioMes.setHours(0, 0, 0, 0);
        const finMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        finMes.setHours(23, 59, 59, 999);
        filters = {
          fechaInicio: getLocalDateString(inicioMes),
          fechaFin: getLocalDateString(finMes),
        };
      }

      const data = await agendasAPI.getAll(filters);
      console.log('Agendas cargadas:', data);
      console.log('Filtros aplicados:', filters);
      setAgendas(data);
    } catch (error) {
      console.error('Error cargando agendas:', error);
      setError('Error al cargar las agendas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAgenda(null);
    setOpenDialog(true);
    setError('');
  };

  const handleEdit = (agenda) => {
    setEditingAgenda(agenda);
    setOpenDialog(true);
    setError('');
  };

  const handleDelete = async (agenda) => {
    if (!window.confirm(`¿Estás seguro de eliminar la agenda "${agenda.titulo}"?`)) {
      return;
    }
    try {
      setLoading(true);
      await agendasAPI.remove(agenda._id);
      await loadAgendas();
    } catch (error) {
      console.error('Error eliminando agenda:', error);
      setError(error.message || 'Error al eliminar la agenda');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingAgenda(null);
    setError('');
  };

  const handleSuccess = () => {
    handleClose();
    loadAgendas();
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      dayOfWeek: diasSemana[date.getDay()],
      day: date.getDate(),
      month: meses[date.getMonth()],
      year: date.getFullYear(),
    };
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewType === 'dia') {
      newDate.setDate(currentDate.getDate() + direction);
    } else if (viewType === 'semana') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    } else if (viewType === 'mes') {
      newDate.setMonth(currentDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateSelect = (date) => {
    // Extraer los componentes de la fecha directamente sin conversiones
    // Esto evita cualquier problema de zona horaria
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // Crear una nueva fecha en hora local usando los componentes
    // Usar mediodía (12:00) para evitar problemas de zona horaria en el límite del día
    const newDate = new Date(year, month, day, 12, 0, 0, 0);
    
    setCurrentDate(newDate);
    setViewType('dia');
  };

  // Agrupar agendas por día usando comparación de fecha local
  const agendasByDay = agendas.reduce((acc, agenda) => {
    if (!agenda || !agenda.fechaHora) return acc;
    const agendaDate = new Date(agenda.fechaHora);
    const dayKey = getLocalDateString(agendaDate);
    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(agenda);
    return acc;
  }, {});

  // Obtener días de la semana
  const getWeekDays = () => {
    const inicioSemana = new Date(currentDate);
    inicioSemana.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(inicioSemana);
      day.setDate(inicioSemana.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Obtener solo los días del mes actual
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Días del mes anterior para completar la primera semana (solo visual)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false, isEmpty: true });
    }
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push({ date: day, isCurrentMonth: true, isEmpty: false });
    }
    // Completar hasta 6 semanas (42 días)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push({ date: day, isCurrentMonth: false, isEmpty: true });
    }
    return days;
  };

  const renderDayView = () => {
    const dayOfWeek = diasSemana[currentDate.getDay()];
    const day = currentDate.getDate();
    const month = meses[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const dateFormatted = `${day} de ${month} de ${year}`;
    const currentDateStr = getLocalDateString(currentDate);
    
    // Filtrar agendas del día
    const dayAgendas = agendas.filter(a => {
      if (!a || !a.fechaHora) return false;
      const agendaDate = new Date(a.fechaHora);
      const agendaDateStr = getLocalDateString(agendaDate);
      return agendaDateStr === currentDateStr;
    });

    // Agrupar agendas por hora (redondeando a la hora completa)
    const agendasByHour = dayAgendas.reduce((acc, agenda) => {
      const date = new Date(agenda.fechaHora);
      const hour = `${date.getHours().toString().padStart(2, '0')}:00`;
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(agenda);
      return acc;
    }, {});

    // Solo mostrar horas que tienen agendas
    const hours = Object.keys(agendasByHour).sort();

    return (
      <Box>
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 231, 0.95) 100%)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(255, 179, 0, 0.12), 0 4px 16px rgba(0,0,0,0.08)',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box
              sx={{
                width: { xs: 50, sm: 60 },
                height: { xs: 50, sm: 60 },
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 179, 0, 0.3)',
              }}
            >
              <CalendarTodayIcon sx={{ color: '#000', fontSize: { xs: 28, sm: 32 } }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#FFB300',
                  mb: 0.5,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                }}
              >
                {dayOfWeek}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: '#666',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                {dateFormatted}
              </Typography>
            </Box>
            <Chip
              label={`${dayAgendas.length} agenda${dayAgendas.length !== 1 ? 's' : ''}`}
              sx={{
                bgcolor: '#FFD600',
                color: '#000',
                fontWeight: 700,
                fontSize: '0.875rem',
                height: 32,
                boxShadow: '0 2px 8px rgba(255, 179, 0, 0.3)',
              }}
            />
          </Box>
        </Paper>

        {hours.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 231, 0.95) 100%)',
              borderRadius: 4,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              border: '1px solid rgba(255, 214, 0, 0.15)',
            }}
          >
            <EventIcon sx={{ fontSize: 64, color: '#FFD600', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ color: '#999', fontWeight: 500 }}>
              No hay agendas para este día
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: { xs: 1.5, sm: 2 },
              width: '100%',
            }}
          >
            {/* Header de horas */}
            <Paper
              sx={{
                p: { xs: 1.5, sm: 2 },
                textAlign: 'center',
                background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 50%, #F9A825 100%)',
                borderRadius: 4,
                boxShadow: '0 6px 20px rgba(255, 179, 0, 0.4), 0 4px 12px rgba(0,0,0,0.1)',
                border: '3px solid rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: { xs: 60, sm: 70 },
                position: 'sticky',
                left: 0,
                zIndex: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: '#000',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  letterSpacing: 1,
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
                }}
              >
                Hora
              </Typography>
            </Paper>

            {/* Header de contenido */}
            <Paper
              sx={{
                p: { xs: 1.5, sm: 2 },
                textAlign: 'center',
                background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 50%, #F9A825 100%)',
                borderRadius: 4,
                boxShadow: '0 6px 20px rgba(255, 179, 0, 0.4), 0 4px 12px rgba(0,0,0,0.1)',
                border: '3px solid rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: { xs: 60, sm: 70 },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: '#000',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  letterSpacing: 1,
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
                }}
              >
                Agendas
              </Typography>
            </Paper>

            {/* Filas de horas y contenido */}
            {hours.map((hour) => {
              const hourAgendas = agendasByHour[hour] || [];
              const currentHour = new Date().getHours().toString().padStart(2, '0') + ':00';
              const isCurrentHour = currentHour === hour;

              return (
                <React.Fragment key={hour}>
                  {/* Celda de hora */}
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      background: isCurrentHour
                        ? 'linear-gradient(135deg, rgba(255, 214, 0, 0.4) 0%, rgba(255, 248, 225, 1) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 231, 0.95) 100%)',
                      borderRadius: 4,
                      boxShadow: isCurrentHour
                        ? '0 6px 20px rgba(255, 179, 0, 0.4), 0 4px 12px rgba(0,0,0,0.1)'
                        : '0 4px 12px rgba(0,0,0,0.08), 0 2px 6px rgba(255, 214, 0, 0.1)',
                      border: isCurrentHour
                        ? '3px solid #FFB300'
                        : '2px solid rgba(255, 214, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: { xs: 70, sm: 80 },
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon 
                        sx={{ 
                          color: isCurrentHour ? '#FFB300' : '#666', 
                          fontSize: { xs: 20, sm: 24 },
                          opacity: 0.8,
                        }} 
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: isCurrentHour ? 900 : 800,
                          color: isCurrentHour ? '#FFB300' : '#333',
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          lineHeight: 1,
                        }}
                      >
                        {hour}
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Celda de contenido */}
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      background: isCurrentHour
                        ? 'linear-gradient(135deg, rgba(255, 214, 0, 0.15) 0%, rgba(255, 248, 225, 0.98) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 231, 0.95) 100%)',
                      borderRadius: 4,
                      boxShadow: isCurrentHour
                        ? '0 6px 20px rgba(255, 179, 0, 0.25), 0 4px 12px rgba(0,0,0,0.08)'
                        : '0 4px 12px rgba(0,0,0,0.08), 0 2px 6px rgba(255, 214, 0, 0.1)',
                      border: isCurrentHour
                        ? '2px solid rgba(255, 214, 0, 0.5)'
                        : '1.5px solid rgba(255, 214, 0, 0.25)',
                      minHeight: { xs: 70, sm: 80 },
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      transition: 'all 0.3s ease',
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(255, 214, 0, 0.1)',
                        borderRadius: '3px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(255, 214, 0, 0.5)',
                        borderRadius: '3px',
                        '&:hover': {
                          background: 'rgba(255, 214, 0, 0.7)',
                        },
                      },
                    }}
                  >
                    {hourAgendas.map((agenda) => {
                      const { time } = formatDateTime(agenda.fechaHora);
                      return (
                        <Box
                          key={agenda._id}
                          sx={{
                            p: { xs: 1.5, sm: 2 },
                            background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.3) 0%, rgba(255, 248, 225, 0.95) 100%)',
                            borderRadius: 3,
                            border: '2px solid rgba(255, 214, 0, 0.5)',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 2px 8px rgba(255, 179, 0, 0.2)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '4px',
                              height: '100%',
                              background: 'linear-gradient(180deg, #FFD600 0%, #FFB300 100%)',
                            },
                            '&:hover': {
                              background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.4) 0%, rgba(255, 248, 225, 1) 100%)',
                              transform: 'translateX(6px) scale(1.02)',
                              boxShadow: '0 4px 16px rgba(255, 179, 0, 0.35), 0 2px 8px rgba(0,0,0,0.1)',
                              borderColor: 'rgba(255, 214, 0, 0.7)',
                            },
                          }}
                          onClick={() => handleEdit(agenda)}
                        >
                          <Box sx={{ pl: 1.5 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#FFB300',
                                fontWeight: 800,
                                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                display: 'block',
                                mb: 1,
                                letterSpacing: 0.5,
                              }}
                            >
                              {time}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: '#333',
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                lineHeight: 1.4,
                                mb: 0.5,
                              }}
                            >
                              {agenda.titulo}
                            </Typography>
                            {agenda.descripcion && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#666',
                                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                  lineHeight: 1.5,
                                  mt: 1,
                                }}
                              >
                                {agenda.descripcion}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Paper>
                </React.Fragment>
              );
            })}
          </Box>
        )}
      </Box>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const inicioSemana = weekDays[0];
    const finSemana = weekDays[6];
    const fechaInicio = inicioSemana.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const fechaFin = finSemana.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

    // Agrupar agendas por día y hora
    const agendasByDayAndHour = weekDays.reduce((acc, day) => {
      const dayKey = getLocalDateString(day);
      const dayAgendas = agendasByDay[dayKey] || [];
      
      const byHour = dayAgendas.reduce((hourAcc, agenda) => {
        const date = new Date(agenda.fechaHora);
        const hour = `${date.getHours().toString().padStart(2, '0')}:00`;
        if (!hourAcc[hour]) hourAcc[hour] = [];
        hourAcc[hour].push(agenda);
        return hourAcc;
      }, {});
      
      acc[dayKey] = byHour;
      return acc;
    }, {});

    // Obtener todas las horas únicas que tienen agendas en cualquier día de la semana
    const allHours = new Set();
    weekDays.forEach((day) => {
      const dayKey = getLocalDateString(day);
      const byHour = agendasByDayAndHour[dayKey] || {};
      Object.keys(byHour).forEach((hour) => allHours.add(hour));
    });
    const hours = Array.from(allHours).sort();

    return (
      <Box>
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 231, 0.95) 100%)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(255, 179, 0, 0.12), 0 4px 16px rgba(0,0,0,0.08)',
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
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#FFB300',
              textAlign: 'center',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            Semana del {fechaInicio} - {fechaFin}
          </Typography>
        </Paper>

        {hours.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 231, 0.95) 100%)',
              borderRadius: 4,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              border: '1px solid rgba(255, 214, 0, 0.15)',
            }}
          >
            <EventIcon sx={{ fontSize: 64, color: '#FFD600', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ color: '#999', fontWeight: 500 }}>
              No hay agendas para esta semana
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '120px repeat(7, 1fr)',
              gap: { xs: 1.5, sm: 2 },
              width: '100%',
              overflowX: 'auto',
            }}
          >
            {/* Header vacío para la primera columna */}
            <Box />

            {/* Headers de días de la semana */}
            {weekDays.map((day) => {
              const isToday = isSameDate(day, new Date());
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              return (
                <Paper
                  key={`header-${getLocalDateString(day)}`}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    textAlign: 'center',
                    background: isToday
                      ? 'linear-gradient(135deg, rgba(255, 214, 0, 0.4) 0%, rgba(255, 248, 225, 1) 100%)'
                      : 'linear-gradient(135deg, #FFD600 0%, #FFB300 50%, #F9A825 100%)',
                    borderRadius: 4,
                    boxShadow: isToday
                      ? '0 6px 20px rgba(255, 179, 0, 0.4), 0 4px 12px rgba(0,0,0,0.1)'
                      : '0 6px 20px rgba(255, 179, 0, 0.4), 0 4px 12px rgba(0,0,0,0.1)',
                    border: isToday
                      ? '3px solid #FFB300'
                      : '3px solid rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: { xs: 70, sm: 80 },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: '#000',
                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                      textTransform: 'uppercase',
                      mb: 0.5,
                      letterSpacing: 0.5,
                      textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    {diasSemanaCortos[day.getDay()]}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 900,
                      color: '#000',
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      lineHeight: 1,
                      textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    {day.getDate()}
                  </Typography>
                </Paper>
              );
            })}

            {/* Filas de horas y contenido por día */}
            {hours.map((hour) => {
              const currentHour = new Date().getHours().toString().padStart(2, '0') + ':00';
              const isCurrentHour = currentHour === hour;

              return (
                <React.Fragment key={hour}>
                  {/* Celda de hora */}
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      background: isCurrentHour
                        ? 'linear-gradient(135deg, rgba(255, 214, 0, 0.4) 0%, rgba(255, 248, 225, 1) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 231, 0.95) 100%)',
                      borderRadius: 4,
                      boxShadow: isCurrentHour
                        ? '0 6px 20px rgba(255, 179, 0, 0.4), 0 4px 12px rgba(0,0,0,0.1)'
                        : '0 4px 12px rgba(0,0,0,0.08), 0 2px 6px rgba(255, 214, 0, 0.1)',
                      border: isCurrentHour
                        ? '3px solid #FFB300'
                        : '2px solid rgba(255, 214, 0, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: { xs: 70, sm: 80 },
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <AccessTimeIcon 
                      sx={{ 
                        color: isCurrentHour ? '#FFB300' : '#666', 
                        fontSize: { xs: 20, sm: 24 },
                        opacity: 0.8,
                        mb: 0.5,
                      }} 
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: isCurrentHour ? 900 : 800,
                        color: isCurrentHour ? '#FFB300' : '#333',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        lineHeight: 1,
                      }}
                    >
                      {hour}
                    </Typography>
                  </Paper>

                  {/* Celdas de contenido para cada día */}
                  {weekDays.map((day) => {
                    const dayKey = getLocalDateString(day);
                    const isToday = isSameDate(day, new Date());
                    const hourAgendas = agendasByDayAndHour[dayKey]?.[hour] || [];
                    const isCurrentHourAndDay = isCurrentHour && isToday;

                    return (
                      <Paper
                        key={`${dayKey}-${hour}`}
                        sx={{
                          p: { xs: 1, sm: 1.25 },
                          background: isCurrentHourAndDay
                            ? 'linear-gradient(135deg, rgba(255, 214, 0, 0.25) 0%, rgba(255, 248, 225, 0.98) 100%)'
                            : isToday
                              ? 'linear-gradient(135deg, rgba(255, 214, 0, 0.12) 0%, rgba(255, 248, 225, 0.95) 100%)'
                              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 231, 0.95) 100%)',
                          borderRadius: 4,
                          boxShadow: isCurrentHourAndDay
                            ? '0 4px 12px rgba(255, 179, 0, 0.3), 0 2px 6px rgba(0,0,0,0.08)'
                            : '0 2px 8px rgba(0,0,0,0.06), 0 1px 4px rgba(255, 214, 0, 0.1)',
                          border: isCurrentHourAndDay
                            ? '2px solid rgba(255, 214, 0, 0.6)'
                            : isToday
                              ? '1.5px solid rgba(255, 214, 0, 0.4)'
                              : '1.5px solid rgba(255, 214, 0, 0.25)',
                          minHeight: { xs: 70, sm: 80 },
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          cursor: hourAgendas.length > 0 ? 'pointer' : 'default',
                          transition: 'all 0.3s ease',
                          '&::-webkit-scrollbar': {
                            width: '4px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: 'rgba(255, 214, 0, 0.1)',
                            borderRadius: '2px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(255, 214, 0, 0.5)',
                            borderRadius: '2px',
                            '&:hover': {
                              background: 'rgba(255, 214, 0, 0.7)',
                            },
                          },
                        }}
                        onClick={() => {
                          if (hourAgendas.length > 0) {
                            handleEdit(hourAgendas[0]);
                          }
                        }}
                      >
                        {hourAgendas.length === 0 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, opacity: 0.2 }}>
                            <EventIcon sx={{ fontSize: { xs: 18, sm: 22 }, color: '#FFD600' }} />
                          </Box>
                        ) : (
                          <>
                            {hourAgendas.slice(0, 2).map((agenda) => {
                              const { time } = formatDateTime(agenda.fechaHora);
                              return (
                                <Box
                                  key={agenda._id}
                                  sx={{
                                    p: { xs: 1, sm: 1.25 },
                                    background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.35) 0%, rgba(255, 248, 225, 0.95) 100%)',
                                    borderRadius: 3,
                                    border: '2px solid rgba(255, 214, 0, 0.55)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 2px 6px rgba(255, 179, 0, 0.25)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                      content: '""',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '3px',
                                      height: '100%',
                                      background: 'linear-gradient(180deg, #FFD600 0%, #FFB300 100%)',
                                    },
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.45) 0%, rgba(255, 248, 225, 1) 100%)',
                                      transform: 'scale(1.05) translateX(4px)',
                                      boxShadow: '0 4px 12px rgba(255, 179, 0, 0.4), 0 2px 6px rgba(0,0,0,0.1)',
                                      borderColor: 'rgba(255, 214, 0, 0.75)',
                                    },
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(agenda);
                                  }}
                                >
                                  <Box sx={{ pl: 1 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: '#FFB300',
                                        fontWeight: 800,
                                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                        display: 'block',
                                        mb: 0.5,
                                        letterSpacing: 0.3,
                                      }}
                                    >
                                      {time}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: '#333',
                                        fontWeight: 700,
                                        fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        lineHeight: 1.3,
                                      }}
                                    >
                                      {agenda.titulo}
                                    </Typography>
                                  </Box>
                                </Box>
                              );
                            })}
                            {hourAgendas.length > 2 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#FFB300',
                                  fontWeight: 800,
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  textAlign: 'center',
                                  p: 0.75,
                                  background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.25) 0%, rgba(255, 248, 225, 0.7) 100%)',
                                  borderRadius: 2,
                                  border: '1.5px solid rgba(255, 214, 0, 0.4)',
                                  boxShadow: '0 1px 3px rgba(255, 179, 0, 0.2)',
                                }}
                              >
                                +{hourAgendas.length - 2} más
                              </Typography>
                            )}
                          </>
                        )}
                      </Paper>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </Box>
        )}
      </Box>
    );
  };

  const renderMonthView = () => {
    const monthDays = getMonthDays();
    const monthName = meses[currentDate.getMonth()];
    const year = currentDate.getFullYear();

    return (
      <Box>
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 231, 0.95) 100%)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(255, 179, 0, 0.12), 0 4px 16px rgba(0,0,0,0.08)',
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
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#FFB300',
              textAlign: 'center',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            {monthName} {year}
          </Typography>
        </Paper>

        {/* Calendario del mes - MATRIZ PERFECTA CON HEADERS INCLUIDOS */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: { xs: 1, sm: 1.5 },
            width: '100%',
          }}
        >
          {/* Headers de días de la semana - DENTRO DE LA MATRIZ */}
          {diasSemana.map((dia, index) => (
            <Paper
              key={`header-${dia}`}
              sx={{
                p: { xs: 1.25, sm: 1.5, md: 1.75 },
                textAlign: 'center',
                background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 50%, #F9A825 100%)',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(255, 179, 0, 0.35), 0 2px 6px rgba(0,0,0,0.1)',
                border: '2px solid rgba(255, 255, 255, 0.6)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: { xs: 50, sm: 55, md: 60 },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
                  pointerEvents: 'none',
                },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255, 179, 0, 0.45), 0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: '#000',
                  fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                  letterSpacing: 0.8,
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {dia}
              </Typography>
            </Paper>
          ))}
          {monthDays.map((dayObj, index) => {
            if (dayObj.isEmpty) {
              return (
                <Box
                  key={index}
                  sx={{
                    aspectRatio: '1',
                    minHeight: { xs: 120, sm: 140, md: 160 },
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
                    border: '1px solid rgba(0,0,0,0.03)',
                  }}
                />
              );
            }

            const dayKey = getLocalDateString(dayObj.date);
            const dayAgendas = agendasByDay[dayKey] || [];
            const isToday = isSameDate(dayObj.date, new Date());
            const isCurrentMonth = dayObj.isCurrentMonth;

            return (
              <Paper
                key={index}
                sx={{
                  p: { xs: 1, sm: 1.25, md: 1.5 },
                  aspectRatio: '1',
                  minHeight: { xs: 120, sm: 140, md: 160 },
                  background: isToday
                    ? 'linear-gradient(135deg, rgba(255, 214, 0, 0.25) 0%, rgba(255, 248, 225, 0.98) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 231, 0.95) 100%)',
                  borderRadius: 3,
                  boxShadow: isToday
                    ? '0 6px 20px rgba(255, 179, 0, 0.35), 0 4px 12px rgba(0,0,0,0.12)'
                    : '0 3px 10px rgba(0,0,0,0.08), 0 1px 4px rgba(255, 214, 0, 0.1)',
                  border: isToday 
                    ? '2.5px solid #FFB300' 
                    : '1.5px solid rgba(255, 214, 0, 0.25)',
                  cursor: isCurrentMonth ? 'pointer' : 'default',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': isToday ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #FFD600 0%, #FFB300 50%, #F9A825 100%)',
                    borderRadius: '3px 3px 0 0',
                  } : {},
                  '&:hover': isCurrentMonth ? {
                    boxShadow: '0 10px 28px rgba(255, 214, 0, 0.25), 0 6px 16px rgba(0,0,0,0.12)',
                    transform: 'translateY(-3px) scale(1.02)',
                    borderColor: isToday ? '#F9A825' : 'rgba(255, 214, 0, 0.5)',
                  } : {},
                }}
                onClick={() => {
                  if (isCurrentMonth) {
                    handleDateSelect(dayObj.date);
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 1,
                    minHeight: { xs: 45, sm: 50, md: 55 },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: isToday ? '#FFB300' : '#666',
                      fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' },
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      mb: 0.25,
                      textAlign: 'center',
                      opacity: 0.85,
                    }}
                  >
                    {diasSemanaCortos[dayObj.date.getDay()]}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: isToday ? 900 : 800,
                      color: isToday ? '#FFB300' : '#333',
                      fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
                      textAlign: 'center',
                      textShadow: isToday ? '0 2px 4px rgba(255, 179, 0, 0.3)' : 'none',
                      lineHeight: 1,
                    }}
                  >
                    {dayObj.date.getDate()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    flex: 1,
                    overflowX: 'hidden',
                    pr: 0.5,
                    minHeight: 0,
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(255, 214, 0, 0.1)',
                      borderRadius: '2px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(255, 214, 0, 0.5)',
                      borderRadius: '2px',
                      '&:hover': {
                        background: 'rgba(255, 214, 0, 0.7)',
                      },
                    },
                  }}
                >
                  {dayAgendas.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        opacity: 0.3,
                      }}
                    >
                      <EventIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: '#FFD600' }} />
                    </Box>
                  ) : (
                    <>
                      {dayAgendas.slice(0, 3).map((agenda) => {
                        const { time } = formatDateTime(agenda.fechaHora);
                        return (
                          <Box
                            key={agenda._id}
                            sx={{
                              p: { xs: 0.5, sm: 0.6 },
                              background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.28) 0%, rgba(255, 248, 225, 0.85) 100%)',
                              borderRadius: 1.5,
                              border: '1.5px solid rgba(255, 214, 0, 0.45)',
                              cursor: 'pointer',
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: '0 1px 3px rgba(255, 179, 0, 0.2)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.38) 0%, rgba(255, 248, 225, 0.95) 100%)',
                                transform: 'translateX(3px)',
                                boxShadow: '0 2px 6px rgba(255, 179, 0, 0.35)',
                                borderColor: 'rgba(255, 214, 0, 0.65)',
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(agenda);
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#FFB300',
                                fontWeight: 800,
                                fontSize: { xs: '0.6rem', sm: '0.65rem' },
                                display: 'block',
                                mb: 0.15,
                                letterSpacing: 0.2,
                              }}
                            >
                              {time}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#333',
                                fontWeight: 700,
                                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.2,
                              }}
                            >
                              {agenda.titulo}
                            </Typography>
                          </Box>
                        );
                      })}
                      {dayAgendas.length > 3 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#FFB300',
                            fontWeight: 800,
                            fontSize: { xs: '0.65rem', sm: '0.7rem' },
                            textAlign: 'center',
                            mt: 0.25,
                            p: 0.5,
                            background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.2) 0%, rgba(255, 248, 225, 0.6) 100%)',
                            borderRadius: 1.5,
                            border: '1.5px solid rgba(255, 214, 0, 0.4)',
                            boxShadow: '0 1px 2px rgba(255, 179, 0, 0.2)',
                          }}
                        >
                          +{dayAgendas.length - 3}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: '#FFB300' }} size={48} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 231, 0.95) 100%)',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(255, 179, 0, 0.12), 0 4px 16px rgba(0,0,0,0.08)',
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            Agendas
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
              color: '#000',
              fontWeight: 700,
              px: { xs: 2, sm: 3 },
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)',
              textTransform: 'none',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              '&:hover': {
                background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
                boxShadow: '0 6px 16px rgba(255, 214, 0, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Nueva Agenda
          </Button>
        </Box>
      </Paper>

      {/* Selector de vista y navegación */}
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 231, 0.95) 100%)',
          borderRadius: 4,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid rgba(255, 214, 0, 0.15)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Tabs
            value={viewType}
            onChange={(e, newValue) => setViewType(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minWidth: { xs: 70, sm: 100 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                color: '#666',
                '&.Mui-selected': {
                  color: '#FFB300',
                },
              },
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(90deg, #FFD600 0%, #FFB300 100%)',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab icon={<ViewDayIcon />} iconPosition="start" label="Día" value="dia" />
            <Tab icon={<ViewWeekIcon />} iconPosition="start" label="Semana" value="semana" />
            <Tab icon={<ViewModuleIcon />} iconPosition="start" label="Mes" value="mes" />
          </Tabs>

          {viewType === 'dia' && (
            <TextField
              type="date"
              value={getLocalDateString(currentDate)}
              onChange={(e) => {
                // Cuando se cambia desde el input date, crear la fecha correctamente
                const dateStr = e.target.value;
                const [year, month, day] = dateStr.split('-').map(Number);
                const newDate = new Date(year, month - 1, day, 12, 0, 0, 0);
                setCurrentDate(newDate);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon sx={{ color: '#FFB300' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: { xs: '100%', sm: 200 },
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(255, 214, 0, 0.4)',
                    borderWidth: '2px',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 214, 0, 0.6)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FFB300',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#FFB300',
                },
              }}
            />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => navigateDate(-1)}
              sx={{
                color: '#FFB300',
                bgcolor: 'rgba(255, 214, 0, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 214, 0, 0.2)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <Button
              onClick={goToToday}
              sx={{
                color: '#FFB300',
                fontWeight: 700,
                px: 2,
                fontSize: '0.875rem',
                '&:hover': {
                  bgcolor: 'rgba(255, 214, 0, 0.1)',
                },
              }}
            >
              Hoy
            </Button>
            <IconButton
              onClick={() => navigateDate(1)}
              sx={{
                color: '#FFB300',
                bgcolor: 'rgba(255, 214, 0, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 214, 0, 0.2)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(211, 47, 47, 0.2)',
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Contenido según vista */}
      {viewType === 'dia' && renderDayView()}
      {viewType === 'semana' && renderWeekView()}
      {viewType === 'mes' && renderMonthView()}

      {/* Dialog para crear/editar */}
      <Dialog
        open={openDialog}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 0, sm: 2 },
            borderRadius: { xs: 0, sm: 4 },
            maxHeight: { xs: '100vh', sm: '95vh' },
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 231, 0.95) 100%)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
            color: '#000',
            fontWeight: 700,
            py: 2,
            flexShrink: 0,
          }}
        >
          {editingAgenda ? 'Editar Agenda' : 'Crear Nueva Agenda'}
        </DialogTitle>
        <DialogContent 
          sx={{ 
            p: 3,
            overflowY: 'auto',
            flex: '1 1 auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 214, 0, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 214, 0, 0.5)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(255, 214, 0, 0.7)',
              },
            },
          }}
        >
          <AgendaForm
            agenda={editingAgenda}
            onSuccess={handleSuccess}
            onCancel={handleClose}
            setError={setError}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function AgendaForm({ agenda, onSuccess, onCancel, setError }) {
  const [formData, setFormData] = useState({
    fechaHora: '',
    titulo: '',
    descripcion: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agenda) {
      const fechaHora = new Date(agenda.fechaHora);
      // Convertir a hora local para el input datetime-local
      const year = fechaHora.getFullYear();
      const month = String(fechaHora.getMonth() + 1).padStart(2, '0');
      const day = String(fechaHora.getDate()).padStart(2, '0');
      const hours = String(fechaHora.getHours()).padStart(2, '0');
      const minutes = String(fechaHora.getMinutes()).padStart(2, '0');
      const fechaHoraStr = `${year}-${month}-${day}T${hours}:${minutes}`;
      setFormData({
        fechaHora: fechaHoraStr,
        titulo: agenda.titulo || '',
        descripcion: agenda.descripcion || '',
      });
    } else {
      const now = new Date();
      now.setHours(9, 0, 0, 0);
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setFormData({
        fechaHora: `${year}-${month}-${day}T${hours}:${minutes}`,
        titulo: '',
        descripcion: '',
      });
    }
  }, [agenda]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fechaHora || !formData.titulo) {
      setError('Fecha/Hora y Título son requeridos');
      return;
    }

    setLoading(true);

    try {
      // El input datetime-local ya da la fecha en hora local, solo la enviamos
      const agendaData = {
        fechaHora: formData.fechaHora,
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
      };

      if (agenda) {
        await agendasAPI.update(agenda._id, agendaData);
      } else {
        await agendasAPI.create(agendaData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error guardando agenda:', error);
      setError(error.message || 'Error al guardar la agenda');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 2,
      '& fieldset': {
        borderColor: 'rgba(255, 214, 0, 0.4)',
        borderWidth: '2px',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 214, 0, 0.6)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#FFB300',
        borderWidth: '2px',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#FFB300',
    },
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Fecha y Hora"
            name="fechaHora"
            type="datetime-local"
            value={formData.fechaHora}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
            sx={{
              ...inputStyles,
              '& .MuiOutlinedInput-input': {
                py: 1.5,
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Título"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            placeholder="Ej: Llamada con cliente, Revisión técnica..."
            sx={inputStyles}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            multiline
            rows={4}
            placeholder="Descripción detallada de la agenda..."
            sx={inputStyles}
          />
        </Grid>
      </Grid>

      <DialogActions sx={{ mt: 2, px: 0, flexShrink: 0 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          sx={{
            color: '#555',
            fontWeight: 600,
            px: 2.5,
            py: 1,
            borderRadius: 2,
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.05)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
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
          {loading ? 'Guardando...' : agenda ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Box>
  );
}

export default AgendasList;
