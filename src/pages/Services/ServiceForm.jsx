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
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={2}>
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
                bgcolor: '#FFFDE7',
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
            rows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#FFFDE7',
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Categoría</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Categoría"
              sx={{
                bgcolor: '#FFFDE7',
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
          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
                color="primary"
              />
            }
            label="Servicio Activo"
            sx={{ mt: 2 }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: '#FFD600',
            color: '#000',
            fontWeight: 600,
            '&:hover': { bgcolor: '#FFB300' },
          }}
        >
          {loading ? 'Guardando...' : service ? 'Actualizar' : 'Crear'}
        </Button>
      </Box>
    </Box>
  );
}

export default ServiceForm;

