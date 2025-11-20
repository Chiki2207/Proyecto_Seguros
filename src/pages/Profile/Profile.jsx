import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { usersAPI } from '../../services/api';

function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    documentType: 'CC',
    documentNumber: '',
    username: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await usersAPI.getById(currentUser.userId);
      setUser(data);
      setFormData({
        fullName: data.fullName || '',
        documentType: data.documentType || 'CC',
        documentNumber: data.documentNumber || '',
        username: data.username || '',
      });
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await usersAPI.update(currentUser.userId, {
        fullName: formData.fullName,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        username: formData.username,
      });

      // Actualizar localStorage
      const updatedUser = {
        ...currentUser,
        fullName: formData.fullName,
        username: formData.username,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess('Perfil actualizado exitosamente');
    } catch (error) {
      setError(error.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSaving(true);

    try {
      await usersAPI.update(currentUser.userId, {
        newPassword: passwordData.newPassword,
      });

      setSuccess('Contraseña actualizada exitosamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setError(error.message || 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
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
          Mi Perfil
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Información Personal */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3.5, 
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDE7 100%)',
              borderRadius: 3,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255, 214, 0, 0.2)',
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: '#333',
                fontSize: '1.25rem',
              }}
            >
              Información Personal
            </Typography>
            <Divider sx={{ mb: 3, borderColor: 'rgba(255, 214, 0, 0.3)' }} />

            <Box component="form" onSubmit={handleUpdateProfile}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre Completo"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Tipo de Documento"
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="PASAPORTE">PASAPORTE</option>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Número de Documento"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Rol"
                    value={user?.role || ''}
                    disabled
                    sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
                      color: '#000',
                      fontWeight: 700,
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
                    {saving ? 'Guardando...' : 'Actualizar Perfil'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Cambiar Contraseña */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3.5, 
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDE7 100%)',
              borderRadius: 3,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255, 214, 0, 0.2)',
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: '#333',
                fontSize: '1.25rem',
              }}
            >
              Cambiar Contraseña
            </Typography>
            <Divider sx={{ mb: 3, borderColor: 'rgba(255, 214, 0, 0.3)' }} />

            <Box component="form" onSubmit={handleChangePassword}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showNewPassword ? 'text' : 'password'}
                    label="Nueva Contraseña"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirmar Nueva Contraseña"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
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

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
                      color: '#000',
                      fontWeight: 700,
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
                    {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Profile;

