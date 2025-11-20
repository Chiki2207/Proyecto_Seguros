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

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loadingServices ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Servicio</InputLabel>
              <Select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                label="Servicio"
                disabled={!!price} // No permitir cambiar el servicio al editar
                sx={{
                  bgcolor: '#FFFDE7',
                }}
              >
                {services.length === 0 ? (
                  <MenuItem value="" disabled>
                    No hay servicios disponibles
                  </MenuItem>
                ) : (
                  services.map((service) => (
                    <MenuItem key={service._id} value={service._id}>
                      {service.name} {service.category ? `(${service.category})` : ''}
                    </MenuItem>
                  ))
                )}
              </Select>
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#FFFDE7',
                },
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#FFFDE7',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Accesorios"
              name="accessories"
              value={formData.accessories}
              onChange={handleChange}
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
              label="Notas"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#FFFDE7',
                },
              }}
            />
          </Grid>
        </Grid>
      )}

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
            '&:hover': { bgcolor: '#FFB300' },
          }}
        >
          {loading ? 'Guardando...' : price ? 'Actualizar' : 'Crear'}
        </Button>
      </Box>
    </Box>
  );
}

export default PriceForm;

