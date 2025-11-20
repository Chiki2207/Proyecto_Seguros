import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { servicesAPI } from '../../services/api';

function ServiceForm({ service, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'GENERAL',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        category: service.category || 'GENERAL',
        active: service.active !== undefined ? service.active : true,
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('El nombre del servicio es requerido');
      return;
    }

    setLoading(true);

    try {
      if (service) {
        await servicesAPI.update(service._id, formData);
      } else {
        await servicesAPI.create(formData);
      }
      onSuccess();
    } catch (error) {
      setError(error.message || 'Error al guardar servicio');
    } finally {
      setLoading(false);
    }
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

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre del Servicio"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{
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
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              sx={{
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
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ 
                '&.Mui-focused': { color: '#FFB300' },
              }}>Categoría</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Categoría"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 2,
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
                <MenuItem value="GENERAL">General</MenuItem>
                <MenuItem value="REPARACION">Reparación</MenuItem>
                <MenuItem value="MANTENIMIENTO">Mantenimiento</MenuItem>
                <MenuItem value="INSTALACION">Instalación</MenuItem>
                <MenuItem value="INSPECCION">Inspección</MenuItem>
                <MenuItem value="OTRO">Otro</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(255, 214, 0, 0.3)',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#FFB300',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#FFD600',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 600, color: '#333' }}>
                    Servicio Activo
                  </Typography>
                }
              />
            </Box>
          </Grid>
        </Grid>

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
            {loading ? 'Guardando...' : service ? 'Actualizar' : 'Crear'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default ServiceForm;

