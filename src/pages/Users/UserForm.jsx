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

    // Validaciones
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
        // Actualizar usuario
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
        // Crear usuario
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

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nombre Completo"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Documento</InputLabel>
            <Select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              label="Tipo de Documento"
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
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Rol</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Rol"
            >
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="TECNICO">TÉCNICO</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {user && (
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
                />
              }
              label="Usuario Activo"
            />
          </Grid>
        )}

        {user && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Cambiar Contraseña
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                  />
                }
                label="Cambiar contraseña"
              />
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
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </>
        )}
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
          {loading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
        </Button>
      </Box>
    </Box>
  );
}

export default UserForm;

