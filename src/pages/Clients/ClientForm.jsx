import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { clientsAPI } from '../../services/api';

function ClientForm({ client, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'PERSONA',
    name: '',
    codigoInterno: '',
    codigoAsistencia: '',
    contacto: '',
    direccion: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      setFormData({
        type: client.type || 'PERSONA',
        name: client.name || '',
        codigoInterno: client.codigoInterno || '',
        codigoAsistencia: client.codigoAsistencia || '',
        contacto: client.contacto || '',
        direccion: client.direccion || '',
      });
    }
  }, [client]);

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

    if (!formData.name || !formData.codigoInterno || !formData.contacto || !formData.direccion) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (formData.type === 'ASEGURADORA' && !formData.codigoAsistencia) {
      setError('El código de asistencia es requerido para aseguradoras');
      return;
    }

    setLoading(true);

    try {
      if (client) {
        setError('La edición de clientes aún no está implementada en el backend');
      } else {
        await clientsAPI.create({
          type: formData.type,
          name: formData.name,
          codigoInterno: formData.codigoInterno,
          codigoAsistencia: formData.codigoAsistencia || undefined,
          contacto: formData.contacto,
          direccion: formData.direccion,
        });
        onSuccess();
      }
    } catch (error) {
      setError(error.message || 'Error al guardar cliente');
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

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ 
                '&.Mui-focused': { color: '#FFB300' },
              }}>Tipo</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Tipo"
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
                <MenuItem value="PERSONA">Persona</MenuItem>
                <MenuItem value="ASEGURADORA">Aseguradora</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Código Interno"
              name="codigoInterno"
              value={formData.codigoInterno}
              onChange={handleChange}
              required
              sx={inputStyles}
            />
          </Grid>

          {formData.type === 'ASEGURADORA' && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código de Asistencia"
                name="codigoAsistencia"
                value={formData.codigoAsistencia}
                onChange={handleChange}
                required={formData.type === 'ASEGURADORA'}
                sx={inputStyles}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contacto"
              name="contacto"
              value={formData.contacto}
              onChange={handleChange}
              required
              placeholder="Teléfono o correo"
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
              multiline
              rows={3}
              sx={inputStyles}
            />
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
            {loading ? 'Guardando...' : client ? 'Actualizar' : 'Crear'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default ClientForm;
