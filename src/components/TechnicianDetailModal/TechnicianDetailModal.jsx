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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';

function TechnicianDetailModal({ open, onClose, technician }) {
  if (!technician) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 253, 231, 0.9) 100%)',
          boxShadow: '0 8px 32px rgba(255, 179, 0, 0.2)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
          color: '#000',
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
            color: '#000',
            fontSize: '1.25rem',
            fontWeight: 700,
            border: '3px solid rgba(0,0,0,0.1)',
          }}
        >
          {technician.fullName?.charAt(0) || 'T'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Información del Técnico
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Detalles completos del profesional
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          sx={{
            minWidth: 'auto',
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.1)',
            color: '#000',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.2)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* Nombre Completo */}
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
                <PersonIcon sx={{ color: '#000', fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Nombre Completo
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                  {technician.fullName || 'N/A'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Documento */}
          <Grid item xs={12} md={6}>
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
                  Tipo de Documento
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                  {technician.documentType || 'N/A'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
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
                  Número de Documento
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                  {technician.documentNumber || 'N/A'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Username */}
          <Grid item xs={12} md={6}>
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
                <PersonIcon sx={{ color: '#000', fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Usuario
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                  {technician.username || 'N/A'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Rol */}
          <Grid item xs={12} md={6}>
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
                <WorkIcon sx={{ color: '#000', fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Rol
                </Typography>
                <Chip
                  label={technician.role || 'N/A'}
                  size="small"
                  sx={{
                    bgcolor: technician.role === 'ADMIN' ? '#1A237E' : '#00BFA5',
                    color: '#FFF',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Estado */}
          {technician.active !== undefined && (
            <Grid item xs={12} md={6}>
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
                  <WorkIcon sx={{ color: '#000', fontSize: 20 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Estado
                  </Typography>
                  <Chip
                    label={technician.active ? 'Activo' : 'Inactivo'}
                    size="small"
                    color={technician.active ? 'success' : 'default'}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Fechas */}
          {technician.createdAt && (
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: '#FFF8E1',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 214, 0, 0.3)',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Fecha de Registro
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                  {new Date(technician.createdAt).toLocaleString('es-ES', {
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
            bgcolor: '#FFD600',
            color: '#000',
            fontWeight: 700,
            px: 3,
            '&:hover': {
              bgcolor: '#FFB300',
            },
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TechnicianDetailModal;

