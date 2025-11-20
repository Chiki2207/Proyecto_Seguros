import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { usersAPI } from '../../services/api';
import UserForm from './UserForm';

function UsersList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setOpenDialog(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSuccess = () => {
    handleClose();
    loadUsers();
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            Gestión de Usuarios
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
              color: '#000',
              fontWeight: 700,
              px: 3,
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
              transition: 'all 0.3s ease',
            }}
          >
            Crear Usuario
          </Button>
        </Box>
      </Paper>

      {/* Vista móvil: Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {users.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#FFFFFF', borderRadius: 3 }}>
            <Typography color="text.secondary">No hay usuarios registrados</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {users.map((user) => (
              <Grid item xs={12} key={user._id}>
                <Paper
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDE7 100%)',
                    borderRadius: 3,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(255, 214, 0, 0.15)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(255, 214, 0, 0.2)',
                      transform: 'translateY(-4px)',
                      borderColor: 'rgba(255, 214, 0, 0.3)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 1 }}>
                        {user.fullName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', mb: 1.5 }}>
                        @{user.username}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={user.role}
                          size="small"
                          color={user.role === 'ADMIN' ? 'primary' : 'default'}
                          sx={{ 
                            fontWeight: 600,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Chip
                          label={user.active ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={user.active ? 'success' : 'default'}
                          sx={{ 
                            fontWeight: 600,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
                        />
                      </Box>
                    </Box>
                    <IconButton
                      onClick={() => handleEdit(user)}
                      sx={{ 
                        color: '#FFB300',
                        bgcolor: 'rgba(255, 214, 0, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 214, 0, 0.2)',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                      Documento:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {user.documentType} {user.documentNumber}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Vista desktop: Tabla */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          bgcolor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: 3,
          border: '1px solid rgba(255, 214, 0, 0.1)',
          overflow: 'hidden',
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Table>
          <TableHead>
            <TableRow 
              sx={{ 
                background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
                '& .MuiTableCell-head': {
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  py: 2,
                },
              }}
            >
              <TableCell>Nombre Completo</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow 
                  key={user._id} 
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: '#FFFDE7',
                    },
                    transition: 'background-color 0.2s ease',
                    '& .MuiTableCell-body': {
                      py: 2,
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{user.fullName}</TableCell>
                  <TableCell sx={{ color: '#666' }}>
                    {user.documentType} {user.documentNumber}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{user.username}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={user.role === 'ADMIN' ? 'primary' : 'default'}
                      sx={{ 
                        fontWeight: 600,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.active ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={user.active ? 'success' : 'default'}
                      sx={{ 
                        fontWeight: 600,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(user)}
                      sx={{ 
                        color: '#FFB300',
                        '&:hover': {
                          bgcolor: 'rgba(255, 214, 0, 0.1)',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 0, sm: 2 },
            borderRadius: { xs: 0, sm: 3 },
            maxHeight: { xs: '100vh', sm: '90vh' },
          },
        }}
      >
        <DialogTitle>
          {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
        </DialogTitle>
        <DialogContent>
          <UserForm user={editingUser} onSuccess={handleSuccess} onCancel={handleClose} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default UsersList;

