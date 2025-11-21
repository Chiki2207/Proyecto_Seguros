import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Divider,
  Grid,
  Chip,
  Paper,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import CodeIcon from '@mui/icons-material/Code';

function ClientDetailModal({ open, onClose, client }) {
  if (!client) return null;

  const isAseguradora = client.type === 'ASEGURADORA';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 245, 233, 0.9) 100%)',
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.2)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
          color: '#FFF',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 2,
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: '#FFFFFF',
            color: isAseguradora ? '#4CAF50' : '#2196F3',
            fontSize: '1.25rem',
            fontWeight: 700,
            border: '3px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {isAseguradora ? <BusinessIcon /> : <PersonIcon />}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFF' }}>
            Información del Cliente
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9, color: '#FFF' }}>
            {isAseguradora ? 'Datos de la aseguradora' : 'Datos de la persona'}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: '#FFF',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* Tipo de Cliente */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 2,
                bgcolor: isAseguradora ? '#E8F5E9' : '#E3F2FD',
                borderRadius: 2,
                border: `1px solid ${isAseguradora ? 'rgba(76, 175, 80, 0.3)' : 'rgba(33, 150, 243, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: isAseguradora ? '#4CAF50' : '#2196F3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isAseguradora ? (
                  <BusinessIcon sx={{ color: '#FFF', fontSize: 20 }} />
                ) : (
                  <PersonIcon sx={{ color: '#FFF', fontSize: 20 }} />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Tipo de Cliente
                </Typography>
                <Chip
                  label={isAseguradora ? 'Aseguradora' : 'Persona'}
                  size="small"
                  sx={{
                    bgcolor: isAseguradora ? '#4CAF50' : '#2196F3',
                    color: '#FFF',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Nombre */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#FFF8E1',
                borderRadius: 2,
                border: '1px solid rgba(255, 214, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#FFD600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isAseguradora ? (
                  <BusinessIcon sx={{ color: '#000', fontSize: 20 }} />
                ) : (
                  <PersonIcon sx={{ color: '#000', fontSize: 20 }} />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Nombre
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                  {client.name || 'N/A'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Código de Asistencia (solo para aseguradoras) */}
          {isAseguradora && client.codigoAsistencia && (
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: '#E8F5E9',
                  borderRadius: 2,
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CodeIcon sx={{ color: '#FFF', fontSize: 20 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Código de Asistencia
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                    {client.codigoAsistencia || 'N/A'}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Código Interno */}
          <Grid item xs={12} md={isAseguradora && client.codigoAsistencia ? 6 : 12}>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#FFF8E1',
                borderRadius: 2,
                border: '1px solid rgba(255, 214, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#FFD600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BadgeIcon sx={{ color: '#000', fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Código Interno
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                  {client.codigoInterno || 'N/A'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Contacto */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#E3F2FD',
                borderRadius: 2,
                border: '1px solid rgba(33, 150, 243, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#2196F3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {client.contacto?.includes('@') ? (
                  <EmailIcon sx={{ color: '#FFF', fontSize: 20 }} />
                ) : (
                  <PhoneIcon sx={{ color: '#FFF', fontSize: 20 }} />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Contacto
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                  {client.contacto || 'N/A'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Dirección */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#FFF3E0',
                borderRadius: 2,
                border: '1px solid rgba(255, 152, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#FF9800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LocationOnIcon sx={{ color: '#FFF', fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Dirección
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                  {client.direccion || 'N/A'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Fecha de Registro */}
          {client.createdAt && (
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: '#F3E5F5',
                  borderRadius: 2,
                  border: '1px solid rgba(156, 39, 176, 0.3)',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Fecha de Registro
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                  {new Date(client.createdAt).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#4CAF50',
            color: '#FFF',
            fontWeight: 700,
            px: 3,
            '&:hover': {
              bgcolor: '#45A049',
            },
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ClientDetailModal;

