import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Alert,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { usersAPI } from '../../services/api';

function UserForm({ user, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: '',
    documentType: 'CC',
    documentNumber: '',
    username: '',
    role: 'TECNICO',
    active: true,
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        documentType: user.documentType || 'CC',
        documentNumber: user.documentNumber || '',
        username: user.username || '',
        role: user.role || 'TECNICO',
        active: user.active !== undefined ? user.active : true,
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

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

    if (!formData.fullName || !formData.documentNumber || !formData.username) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (!user && !formData.password) {
      setError('La contraseña es requerida para nuevos usuarios');
      return;
    }

    if (changePassword || !user) {
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    setLoading(true);

    try {
      if (user) {
        const updateData = {
          fullName: formData.fullName,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          username: formData.username,
          role: formData.role,
          active: formData.active,
        };

        if (changePassword && formData.password) {
          updateData.newPassword = formData.password;
        }

        await usersAPI.update(user._id, updateData);
      } else {
        await usersAPI.create({
          fullName: formData.fullName,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          username: formData.username,
          password: formData.password,
          role: formData.role,
        });
      }

      onSuccess();
    } catch (error) {
      setError(error.message || 'Error al guardar usuario');
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

  const selectStyles = {
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
            <TextField
              fullWidth
              label="Nombre Completo"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ 
                '&.Mui-focused': { color: '#FFB300' },
              }}>Tipo de Documento</InputLabel>
              <Select
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                label="Tipo de Documento"
                sx={selectStyles}
              >
                <MenuItem value="CC">CC</MenuItem>
                <MenuItem value="CE">CE</MenuItem>
                <MenuItem value="NIT">NIT</MenuItem>
                <MenuItem value="PASAPORTE">PASAPORTE</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Número de Documento"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              required
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              sx={inputStyles}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ 
                '&.Mui-focused': { color: '#FFB300' },
              }}>Rol</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Rol"
                sx={selectStyles}
              >
                <MenuItem value="ADMIN">ADMIN</MenuItem>
                <MenuItem value="TECNICO">TÉCNICO</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {user && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(255, 214, 0, 0.3)',
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
                      Usuario Activo
                    </Typography>
                  }
                />
              </Box>
            </Grid>
          )}

          {user && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 1, borderColor: 'rgba(255, 214, 0, 0.3)' }} />
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#FFB300',
                    mt: 2,
                  }}
                >
                  Cambiar Contraseña
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(255, 214, 0, 0.3)',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={changePassword}
                        onChange={(e) => setChangePassword(e.target.checked)}
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
                        Cambiar contraseña
                      </Typography>
                    }
                  />
                </Box>
              </Grid>
            </>
          )}

          {(!user || changePassword) && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label={user ? 'Nueva Contraseña' : 'Contraseña'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#666' }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirmar Contraseña"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: '#666' }}
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyles}
                />
              </Grid>
            </>
          )}
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
            {loading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default UserForm;
