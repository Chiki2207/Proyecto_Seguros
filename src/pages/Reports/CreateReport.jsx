import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Autocomplete,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { reportsAPI, clientsAPI, usersAPI } from '../../services/api';

function CreateReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [formData, setFormData] = useState({
    clientId: '',
    technicianIds: [],
    diagnosticoInicial: '',
    causa: '',
    acciones: '',
  });

  useEffect(() => {
    loadClients();
    loadTechnicians();
  }, []);

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

    if (!formData.clientId) {
      setError('Debes seleccionar un cliente');
      return;
    }

    setLoading(true);

    try {
      const result = await reportsAPI.create({
        clientId: formData.clientId,
        technicianIds: formData.technicianIds,
        diagnosticoInicial: formData.diagnosticoInicial,
        causa: formData.causa,
        acciones: formData.acciones,
      });

      navigate(`/reports/${result.reportId}`);
    } catch (error) {
      setError(error.message || 'Error al crear el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/reports')}
        sx={{ mb: 2, color: '#FFB300' }}
      >
        Volver
      </Button>

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
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.75rem', sm: '2rem' },
            mb: 3,
          }}
        >
          Crear Nuevo Reporte
        </Typography>

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

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel sx={{ 
                  '&.Mui-focused': { color: '#FFB300' },
                }}>Cliente</InputLabel>
                <Select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  label="Cliente"
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
                  {clients.map((client) => (
                    <MenuItem key={client._id} value={client._id}>
                      {client.name} ({client.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={technicians}
                getOptionLabel={(option) => option.fullName}
                value={technicians.filter((t) => formData.technicianIds.includes(t._id))}
                onChange={(e, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    technicianIds: newValue.map((t) => t._id),
                  }));
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Técnicos Asignados"
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
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option._id}
                      label={option.fullName}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 214, 0, 0.2)',
                        color: '#333',
                        fontWeight: 500,
                        '& .MuiChip-deleteIcon': {
                          color: '#666',
                        },
                      }}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Diagnóstico Inicial"
                name="diagnosticoInicial"
                value={formData.diagnosticoInicial}
                onChange={handleChange}
                placeholder="Describe el diagnóstico inicial del problema..."
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
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Causa"
                name="causa"
                value={formData.causa}
                onChange={handleChange}
                placeholder="Describe la causa del problema..."
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
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Acciones"
                name="acciones"
                value={formData.acciones}
                onChange={handleChange}
                placeholder="Describe las acciones realizadas..."
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
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  onClick={() => navigate('/reports')}
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
                  startIcon={<SaveIcon />}
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
                  {loading ? 'Creando...' : 'Crear Reporte'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

export default CreateReport;

