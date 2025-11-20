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
        // TODO: Implementar actualización cuando el backend lo soporte
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

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Tipo"
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
            rows={2}
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
            '&:hover': { bgcolor: '#FFB300' },
          }}
        >
          {loading ? 'Guardando...' : client ? 'Actualizar' : 'Crear'}
        </Button>
      </Box>
    </Box>
  );
}

export default ClientForm;

