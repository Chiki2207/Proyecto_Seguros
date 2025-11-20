import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  Alert,
} from '@mui/material';
import { pricesAPI, servicesAPI } from '../../services/api';

function PriceForm({ clientId, price, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    serviceId: '',
    description: '',
    price: '',
    accessories: '',
    notes: '',
  });
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (price) {
      setFormData({
        serviceId: price.serviceId?.toString() || '',
        description: price.description || '',
        price: price.price || '',
        accessories: price.accessories || '',
        notes: price.notes || '',
      });
    }
  }, [price]);

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const data = await servicesAPI.getActive();
      setServices(data);
    } catch (error) {
      console.error('Error cargando servicios:', error);
      setError('Error al cargar servicios');
    } finally {
      setLoadingServices(false);
    }
  };

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

    if (!formData.serviceId || !formData.price) {
      setError('Servicio y precio son requeridos');
      return;
    }

    setLoading(true);

    try {
      if (price) {
        await pricesAPI.update(clientId, price._id, {
          description: formData.description,
          price: parseFloat(formData.price),
          accessories: formData.accessories,
          notes: formData.notes,
        });
      } else {
        await pricesAPI.create(clientId, {
          serviceId: formData.serviceId,
          description: formData.description,
          price: parseFloat(formData.price),
          accessories: formData.accessories,
          notes: formData.notes,
        });
      }
      onSuccess();
    } catch (error) {
      setError(error.message || 'Error al guardar precio');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255, 255, 255, 0.8)',
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
    <Paper
      sx={{
        p: { xs: 3, sm: 4 },
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 253, 231, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(255, 179, 0, 0.15), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
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
      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(211, 47, 47, 0.2)',
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {loadingServices ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress sx={{ color: '#FFB300' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel 
                  sx={{ 
                    '&.Mui-focused': { color: '#FFB300' },
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                  shrink
                >
                  Servicio
                </InputLabel>
                <Select
                  name="serviceId"
                  value={formData.serviceId || ''}
                  onChange={handleChange}
                  label="Servicio"
                  disabled={!!price}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected || selected === '') {
                      return (
                        <Box component="span" sx={{ color: '#999', fontSize: '1rem', fontWeight: 500 }}>
                          Seleccione un servicio
                        </Box>
                      );
                    }
                    const selectedService = services.find(s => s._id === selected);
                    if (selectedService) {
                      return (
                        <Box component="span" sx={{ color: '#333', fontSize: '1rem', fontWeight: 500 }}>
                          {selectedService.name} {selectedService.category ? `(${selectedService.category})` : ''}
                        </Box>
                      );
                    }
                    return selected;
                  }}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 2,
                    minHeight: '56px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    '& .MuiSelect-select': {
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 214, 0, 0.4)',
                      borderWidth: '2px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 214, 0, 0.6)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#FFB300',
                      borderWidth: '2px',
                    },
                  }}
                >
                  {services.length === 0 ? (
                    <MenuItem value="" disabled sx={{ fontSize: '1rem', fontWeight: 500 }}>
                      No hay servicios disponibles
                    </MenuItem>
                  ) : (
                    services.map((service) => (
                      <MenuItem 
                        key={service._id} 
                        value={service._id}
                        sx={{ fontSize: '1rem', fontWeight: 500 }}
                      >
                        {service.name} {service.category ? `(${service.category})` : ''}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {!!price && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5, fontSize: '0.875rem' }}>
                    El servicio no se puede cambiar al editar
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                sx={inputStyles}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
                sx={inputStyles}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Accesorios"
                name="accessories"
                value={formData.accessories}
                onChange={handleChange}
                sx={inputStyles}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
                sx={inputStyles}
              />
            </Grid>
          </Grid>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button 
            onClick={onCancel} 
            disabled={loading}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              color: '#666',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.05)',
              },
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
              px: 4,
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
            {loading ? 'Guardando...' : price ? 'Actualizar' : 'Crear'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default PriceForm;
