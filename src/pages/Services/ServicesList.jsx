import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { servicesAPI } from '../../services/api';
import ServiceForm from './ServiceForm';

function ServicesList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await servicesAPI.getAll();
      setServices(data);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setOpenDialog(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setOpenDialog(true);
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`¿Estás seguro de eliminar el servicio "${service.name}"?`)) {
      return;
    }

    try {
      await servicesAPI.delete(service._id);
      loadServices();
    } catch (error) {
      alert(error.message || 'Error al eliminar servicio');
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingService(null);
  };

  const handleSuccess = () => {
    handleClose();
    loadServices();
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
            Gestión de Servicios
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
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
            Crear Servicio
          </Button>
        </Box>
      </Paper>

      {/* Mobile View: Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {services.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#FFFFFF', borderRadius: 2 }}>
            <Typography color="text.secondary">No hay servicios registrados</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {services.map((service) => (
              <Grid item xs={12} key={service._id}>
                <Paper
                  sx={{
                    p: 2.5,
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
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333333', mb: 0.5 }}>
                        {service.name}
                      </Typography>
                      <Chip
                        label={service.active ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={service.active ? 'success' : 'default'}
                        sx={{ 
                          fontWeight: 600,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          mb: 1,
                        }}
                      />
                      {service.category && (
                        <Chip
                          label={service.category}
                          size="small"
                          sx={{ 
                            ml: 1,
                            bgcolor: '#FFD600',
                            color: '#000',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(service)}
                        sx={{ 
                          color: '#FFB300',
                          '&:hover': {
                            bgcolor: 'rgba(255, 214, 0, 0.1)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(service)}
                        sx={{ 
                          color: '#f44336',
                          '&:hover': {
                            bgcolor: 'rgba(244, 67, 54, 0.1)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  {service.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {service.description}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Desktop View: Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          bgcolor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: 3,
          border: '1px solid rgba(255, 214, 0, 0.1)',
          overflow: 'hidden',
          display: { xs: 'none', md: 'block' },
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
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay servicios registrados
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow 
                  key={service._id} 
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
                  <TableCell sx={{ fontWeight: 500 }}>{service.name}</TableCell>
                  <TableCell sx={{ color: '#666', maxWidth: 300 }}>
                    {service.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={service.category || 'GENERAL'}
                      size="small"
                      sx={{ 
                        bgcolor: '#FFD600',
                        color: '#000',
                        fontWeight: 600,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={service.active ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={service.active ? 'success' : 'default'}
                      sx={{ 
                        fontWeight: 600,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(service)}
                        sx={{ 
                          color: '#FFB300',
                          '&:hover': {
                            bgcolor: 'rgba(255, 214, 0, 0.1)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(service)}
                        sx={{ 
                          color: '#f44336',
                          '&:hover': {
                            bgcolor: 'rgba(244, 67, 54, 0.1)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingService ? 'Editar Servicio' : 'Crear Servicio'}
        </DialogTitle>
        <DialogContent>
          <ServiceForm service={editingService} onSuccess={handleSuccess} onCancel={handleClose} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ServicesList;

