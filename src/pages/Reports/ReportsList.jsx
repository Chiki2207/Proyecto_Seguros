import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Collapse,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { reportsAPI, clientsAPI, usersAPI } from '../../services/api';

function ReportsList() {
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [clients, setClients] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [filterType, setFilterType] = useState('todos'); // 'todos', 'cliente', 'tecnico', 'intervalo', 'fecha', 'id', 'cedula'
  const [filters, setFilters] = useState({
    estado: '',
    clientId: '',
    technicianId: '',
    fechaDesde: '',
    fechaHasta: '',
    fechaEspecifica: '',
    reportId: '',
    cedula: '',
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadReports();
    if (isAdmin) {
      loadClients();
      loadTechnicians();
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, filterType, allReports]);

  const loadClients = async () => {
    try {
      const data = await clientsAPI.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  const loadTechnicians = async () => {
    try {
      const allUsers = await usersAPI.getAll();
      const techs = allUsers.filter((u) => u.role === 'TECNICO' && u.active);
      setTechnicians(techs);
    } catch (error) {
      console.error('Error cargando técnicos:', error);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const apiFilters = {};
      if (!isAdmin) apiFilters.technicianId = user.userId;
      
      const data = await reportsAPI.getAll(apiFilters);
      setAllReports(data);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allReports];

    // Filtro por estado (siempre disponible)
    if (filters.estado) {
      filtered = filtered.filter((r) => r.estado === filters.estado);
    }

    // Filtro según el tipo seleccionado
    if (filterType === 'cliente') {
      // Filtro por cliente específico
      if (filters.clientId) {
        filtered = filtered.filter((r) => r.clientId?.toString() === filters.clientId);
      }
    } else if (filterType === 'tecnico') {
      // Filtro por técnico asignado
      if (filters.technicianId) {
        filtered = filtered.filter((r) => {
          if (!r.technicianIds || r.technicianIds.length === 0) return false;
          return r.technicianIds.some((id) => id.toString() === filters.technicianId);
        });
      }
    } else if (filterType === 'intervalo') {
      // Filtro por intervalo de fechas
      if (filters.fechaDesde) {
        // Parsear la fecha de entrada (formato YYYY-MM-DD)
        const fechaParts = filters.fechaDesde.split('-');
        const año = parseInt(fechaParts[0], 10);
        const mes = parseInt(fechaParts[1], 10) - 1; // Los meses en JS son 0-indexed
        const dia = parseInt(fechaParts[2], 10);
        const fechaDesde = new Date(año, mes, dia, 0, 0, 0, 0);
        
        filtered = filtered.filter((r) => {
          if (!r.createdAt) return false;
          const reportDate = new Date(r.createdAt);
          return reportDate >= fechaDesde;
        });
      }
      if (filters.fechaHasta) {
        // Parsear la fecha de entrada (formato YYYY-MM-DD)
        const fechaParts = filters.fechaHasta.split('-');
        const año = parseInt(fechaParts[0], 10);
        const mes = parseInt(fechaParts[1], 10) - 1; // Los meses en JS son 0-indexed
        const dia = parseInt(fechaParts[2], 10);
        const fechaHasta = new Date(año, mes, dia, 23, 59, 59, 999);
        
        filtered = filtered.filter((r) => {
          if (!r.createdAt) return false;
          const reportDate = new Date(r.createdAt);
          return reportDate <= fechaHasta;
        });
      }
    } else if (filterType === 'fecha') {
      // Filtro por fecha específica - comparar solo año, mes y día
      if (filters.fechaEspecifica) {
        // Parsear la fecha de entrada (formato YYYY-MM-DD)
        const fechaParts = filters.fechaEspecifica.split('-');
        const añoInput = parseInt(fechaParts[0], 10);
        const mesInput = parseInt(fechaParts[1], 10) - 1; // Los meses en JS son 0-indexed
        const diaInput = parseInt(fechaParts[2], 10);
        
        filtered = filtered.filter((r) => {
          if (!r.createdAt) return false;
          
          // Crear fecha del reporte en hora local
          const reportDate = new Date(r.createdAt);
          
          // Comparar año, mes y día en hora local
          const añoReporte = reportDate.getFullYear();
          const mesReporte = reportDate.getMonth();
          const diaReporte = reportDate.getDate();
          
          return añoReporte === añoInput &&
                 mesReporte === mesInput &&
                 diaReporte === diaInput;
        });
      }
    } else if (filterType === 'id') {
      // Filtro por ID de reporte
      if (filters.reportId) {
        const searchId = filters.reportId.toLowerCase();
        filtered = filtered.filter((r) => 
          r._id.toString().toLowerCase().includes(searchId)
        );
      }
    } else if (filterType === 'cedula') {
      // Filtro por número de cédula del técnico
      if (filters.cedula) {
        const searchCedula = filters.cedula.trim();
        filtered = filtered.filter((r) => {
          if (!r.technicians || r.technicians.length === 0) return false;
          return r.technicians.some((tech) => 
            tech.documentNumber?.toString().includes(searchCedula)
          );
        });
      }
    }
    // Si filterType === 'todos', no se aplica filtro adicional (solo estado si está seleccionado)

    setReports(filtered);
  };

  const clearFilters = () => {
    setFilterType('todos');
    setFilters({
      estado: '',
      clientId: '',
      technicianId: '',
      fechaDesde: '',
      fechaHasta: '',
      fechaEspecifica: '',
      reportId: '',
      cedula: '',
    });
  };

  const hasActiveFilters = () => {
    return filters.estado || (filterType !== 'todos' && (
      filters.clientId || 
      filters.technicianId || 
      filters.fechaDesde || 
      filters.fechaHasta || 
      filters.fechaEspecifica || 
      filters.reportId || 
      filters.cedula
    ));
  };

  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    // Limpiar todos los filtros específicos cuando cambia el tipo
    setFilters((prev) => ({
      ...prev,
      clientId: '',
      technicianId: '',
      fechaDesde: '',
      fechaHasta: '',
      fechaEspecifica: '',
      reportId: '',
      cedula: '',
    }));
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'warning';
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

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDE7 100%)',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255, 214, 0, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.75rem', sm: '2rem' },
            }}
          >
            {isAdmin ? 'Reportes' : 'Mis Reportes'}
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              onClick={() => navigate('/reports/create')}
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
                transition: 'all 0.3s ease',
              }}
            >
              Crear Reporte
            </Button>
          )}
        </Box>
      </Paper>

      {isAdmin && (
        <Paper
          sx={{
            mb: 3,
            bgcolor: '#FFFFFF',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255, 214, 0, 0.15)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.1) 0%, rgba(255, 179, 0, 0.05) 100%)',
              borderBottom: '1px solid rgba(255, 214, 0, 0.2)',
              cursor: 'pointer',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.15) 0%, rgba(255, 179, 0, 0.1) 100%)',
              },
            }}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FilterListIcon sx={{ color: '#FFB300', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                Filtros de Búsqueda
              </Typography>
              {hasActiveFilters() && (
                <Chip
                  label="Activos"
                  size="small"
                  sx={{
                    bgcolor: '#FFD600',
                    color: '#000',
                    fontWeight: 600,
                    height: 24,
                  }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {hasActiveFilters() && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}
                  sx={{
                    color: '#FFB300',
                    '&:hover': {
                      bgcolor: 'rgba(255, 214, 0, 0.1)',
                    },
                  }}
                >
                  <ClearIcon />
                </IconButton>
              )}
            </Box>
          </Box>
          <Collapse in={filtersOpen}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2.5}>
                {/* Filtro de estado siempre visible */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#666', 
                        fontSize: '1rem',
                        '&.Mui-focused': {
                          color: '#FFB300',
                        },
                      }}
                      shrink
                    >
                      Estado
                    </InputLabel>
                    <Select
                      value={filters.estado || ''}
                      onChange={(e) => handleFilterChange('estado', e.target.value)}
                      label="Estado"
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected || selected === '') {
                          return (
                            <Box component="span" sx={{ color: '#999', fontSize: '1rem', fontWeight: 500 }}>
                              Todos los estados
                            </Box>
                          );
                        }
                        return (
                          <Box component="span" sx={{ color: '#333', fontSize: '1rem', fontWeight: 500 }}>
                            {selected === 'PENDIENTE' ? 'Pendiente' : 'Terminado'}
                          </Box>
                        );
                      }}
                      sx={{
                        borderRadius: 2,
                        bgcolor: '#FFFDE7',
                        minHeight: '56px',
                        '& .MuiSelect-select': {
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                        },
                        '& .MuiOutlinedInput-input': {
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 500,
                        },
                        '& .MuiNativeSelect-root': {
                          fontSize: '1rem',
                          fontWeight: 500,
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 214, 0, 0.4)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 214, 0, 0.6)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FFB300',
                          borderWidth: 2,
                        },
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        Todos los estados
                      </MenuItem>
                      <MenuItem value="PENDIENTE" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        Pendiente
                      </MenuItem>
                      <MenuItem value="TERMINADO" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        Terminado
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Selector principal de tipo de filtro */}
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#666',
                        fontSize: '1rem',
                      }}
                    >
                      Filtrar por
                    </InputLabel>
                    <Select
                      value={filterType || 'todos'}
                      onChange={(e) => handleFilterTypeChange(e.target.value)}
                      label="Filtrar por"
                      sx={{
                        borderRadius: 2,
                        bgcolor: '#FFFDE7',
                        minHeight: '56px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        '& .MuiSelect-select': {
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 500,
                          color: filterType && filterType !== 'todos' ? '#333' : '#999',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 214, 0, 0.4)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 214, 0, 0.6)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FFB300',
                          borderWidth: 2,
                        },
                      }}
                    >
                      <MenuItem value="todos" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        Todos los reportes
                      </MenuItem>
                      <MenuItem value="cliente" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        Por Cliente
                      </MenuItem>
                      <MenuItem value="tecnico" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        Por Técnico
                      </MenuItem>
                      <MenuItem value="intervalo" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        Por Intervalo de Tiempo
                      </MenuItem>
                      <MenuItem value="fecha" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        Por Fecha Específica
                      </MenuItem>
                      <MenuItem value="id" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        Por ID de Reporte
                      </MenuItem>
                      <MenuItem value="cedula" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        Por Número de Cédula
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Campos dinámicos según el tipo de filtro seleccionado */}
                  {filterType === 'cliente' && (
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ fontWeight: 600, color: '#666', fontSize: '1rem' }}>Seleccionar Cliente</InputLabel>
                        <Select
                          value={filters.clientId}
                          onChange={(e) => handleFilterChange('clientId', e.target.value)}
                          label="Seleccionar Cliente"
                          sx={{
                            borderRadius: 2,
                            bgcolor: '#FFFDE7',
                            minHeight: '56px',
                            fontSize: '1rem',
                            fontWeight: 500,
                            '& .MuiSelect-select': {
                              py: 1.5,
                              fontSize: '1rem',
                              fontWeight: 500,
                              color: filters.clientId ? '#333' : '#999',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 214, 0, 0.4)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 214, 0, 0.6)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FFB300',
                              borderWidth: 2,
                            },
                          }}
                        >
                          <MenuItem value="" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                            Seleccione un cliente
                          </MenuItem>
                          {clients.map((client) => (
                            <MenuItem key={client._id} value={client._id} sx={{ fontSize: '1rem', fontWeight: 500 }}>
                              {client.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {filterType === 'tecnico' && (
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ fontWeight: 600, color: '#666', fontSize: '1rem' }}>Seleccionar Técnico</InputLabel>
                        <Select
                          value={filters.technicianId}
                          onChange={(e) => handleFilterChange('technicianId', e.target.value)}
                          label="Seleccionar Técnico"
                          sx={{
                            borderRadius: 2,
                            bgcolor: '#FFFDE7',
                            minHeight: '56px',
                            fontSize: '1rem',
                            fontWeight: 500,
                            '& .MuiSelect-select': {
                              py: 1.5,
                              fontSize: '1rem',
                              fontWeight: 500,
                              color: filters.technicianId ? '#333' : '#999',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 214, 0, 0.4)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 214, 0, 0.6)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FFB300',
                              borderWidth: 2,
                            },
                          }}
                        >
                          <MenuItem value="" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                            Seleccione un técnico
                          </MenuItem>
                          {technicians.map((tech) => (
                            <MenuItem key={tech._id} value={tech._id} sx={{ fontSize: '1rem', fontWeight: 500 }}>
                              {tech.fullName} - {tech.documentNumber}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                {filterType === 'intervalo' && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Fecha Desde"
                        type="date"
                        value={filters.fechaDesde}
                        onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                          sx: { fontWeight: 600, color: '#666' },
                        }}
                        sx={{
                          borderRadius: 2,
                          bgcolor: '#FFFDE7',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 214, 0, 0.4)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 214, 0, 0.6)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FFB300',
                            borderWidth: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Fecha Hasta"
                        type="date"
                        value={filters.fechaHasta}
                        onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                          sx: { fontWeight: 600, color: '#666' },
                        }}
                        sx={{
                          borderRadius: 2,
                          bgcolor: '#FFFDE7',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 214, 0, 0.4)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 214, 0, 0.6)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FFB300',
                            borderWidth: 2,
                          },
                        }}
                      />
                    </Grid>
                  </>
                )}

                {filterType === 'fecha' && (
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Fecha Específica"
                      type="date"
                      value={filters.fechaEspecifica}
                      onChange={(e) => handleFilterChange('fechaEspecifica', e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                        sx: { fontWeight: 600, color: '#666' },
                      }}
                      sx={{
                        borderRadius: 2,
                        bgcolor: '#FFFDE7',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 214, 0, 0.4)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 214, 0, 0.6)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FFB300',
                          borderWidth: 2,
                        },
                      }}
                    />
                  </Grid>
                )}

                {filterType === 'id' && (
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="ID de Reporte"
                      value={filters.reportId}
                      onChange={(e) => handleFilterChange('reportId', e.target.value)}
                      placeholder="Ej: 65a1b2c3..."
                      InputLabelProps={{
                        sx: { fontWeight: 600, color: '#666' },
                      }}
                      sx={{
                        borderRadius: 2,
                        bgcolor: '#FFFDE7',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 214, 0, 0.4)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 214, 0, 0.6)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FFB300',
                          borderWidth: 2,
                        },
                      }}
                    />
                  </Grid>
                )}

                {filterType === 'cedula' && (
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Número de Cédula"
                      value={filters.cedula}
                      onChange={(e) => handleFilterChange('cedula', e.target.value)}
                      placeholder="Ej: 1234567890"
                      InputLabelProps={{
                        sx: { fontWeight: 600, color: '#666' },
                      }}
                      sx={{
                        borderRadius: 2,
                        bgcolor: '#FFFDE7',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 214, 0, 0.4)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 214, 0, 0.6)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FFB300',
                          borderWidth: 2,
                        },
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Vista móvil: Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : reports.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#FFFFFF', borderRadius: 2 }}>
            <Typography color="text.secondary">No hay reportes disponibles</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {reports.map((report) => (
              <Grid item xs={12} key={report._id}>
                <Paper
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDE7 100%)',
                    borderRadius: 3,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(255, 214, 0, 0.15)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(255, 214, 0, 0.2)',
                      transform: 'translateY(-4px)',
                      borderColor: 'rgba(255, 214, 0, 0.3)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333333' }}>
                      {report.client?.name || 'Cliente'}
                    </Typography>
                    <Chip label={report.estado} color={getEstadoColor(report.estado)} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <Box component="span" sx={{ fontWeight: 600, color: '#666' }}>Fecha de Reporte: </Box>
                    {new Date(report.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Técnicos: {report.technicians?.map((t) => t.fullName).join(', ') || 'Sin asignar'}
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate(`/reports/${report._id}`)}
                    sx={{
                      background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
                      color: '#000',
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)',
                      textTransform: 'none',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
                        boxShadow: '0 6px 16px rgba(255, 214, 0, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Ver Detalle
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Vista desktop: Tabla */}
      <TableContainer
        component={Paper}
        sx={{
          bgcolor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: 3,
          display: { xs: 'none', md: 'block' },
          border: '1px solid rgba(255, 214, 0, 0.1)',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow 
              sx={{ 
                background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
                '& .MuiTableCell-head': {
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  py: 2,
                },
              }}
            >
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Técnicos</TableCell>
              <TableCell>Fecha de Reporte</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay reportes disponibles
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow 
                  key={report._id} 
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: '#FFFDE7',
                    },
                    transition: 'background-color 0.2s ease',
                    '& .MuiTableCell-body': {
                      py: 2,
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 500, color: '#666' }}>
                    {report._id.toString().substring(0, 8)}...
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {report.client?.name || report.clientId.toString().substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={report.estado} 
                      color={getEstadoColor(report.estado)} 
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#666' }}>
                    {report.technicians?.map((t) => t.fullName).join(', ') || 
                     `${report.technicianIds?.length || 0} técnico(s)`}
                  </TableCell>
                  <TableCell sx={{ color: '#666', fontWeight: 500 }}>
                    {new Date(report.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => navigate(`/reports/${report._id}`)}
                      sx={{ 
                        color: '#FFB300',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: 'rgba(255, 214, 0, 0.1)',
                          transform: 'translateX(4px)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Ver Detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ReportsList;

