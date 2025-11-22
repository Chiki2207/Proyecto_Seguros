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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { clientsAPI } from '../../services/api';
import ClientForm from './ClientForm';

function ClientsList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientsAPI.getAll();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const handleCreate = () => {
    setEditingClient(null);
    setOpenDialog(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingClient(null);
  };

  const handleSuccess = () => {
    handleClose();
    loadClients();
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
            Gestión de Clientes
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
            Crear Cliente
          </Button>
        </Box>
      </Paper>

      {/* Campo de búsqueda */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          bgcolor: '#FFFFFF',
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1px solid rgba(255, 214, 0, 0.1)',
        }}
      >
        <TextField
          fullWidth
          placeholder="Buscar cliente por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: '#666', mr: 1 }} />
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'rgba(255, 214, 0, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 214, 0, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#FFB300',
                borderWidth: '2px',
              },
            },
          }}
        />
      </Paper>

      {/* Vista móvil: Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {filteredClients.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#FFFFFF', borderRadius: 3 }}>
            <Typography color="text.secondary">No hay clientes registrados</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredClients.map((client) => (
              <Grid item xs={12} key={client._id}>
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
                        {client.name}
                      </Typography>
                      <Chip
                        label={client.type}
                        size="small"
                        color={client.type === 'ASEGURADORA' ? 'primary' : 'default'}
                        sx={{ 
                          fontWeight: 600,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          mb: 1.5,
                        }}
                      />
                    </Box>
                    <IconButton
                      onClick={() => handleEdit(client)}
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                        Código Interno:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>{client.codigoInterno}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                        Código Asistencia:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>{client.codigoAsistencia || 'N/A'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                        Contacto:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>{client.contacto}</Typography>
                    </Box>
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
              <TableCell>Tipo</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Código Interno</TableCell>
              <TableCell>Código Asistencia</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {searchTerm ? `No se encontraron clientes con el nombre "${searchTerm}"` : 'No hay clientes registrados'}
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow 
                  key={client._id} 
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
                  <TableCell>
                    <Chip
                      label={client.type}
                      size="small"
                      color={client.type === 'ASEGURADORA' ? 'primary' : 'default'}
                      sx={{ 
                        fontWeight: 600,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{client.name}</TableCell>
                  <TableCell sx={{ color: '#666' }}>{client.codigoInterno}</TableCell>
                  <TableCell sx={{ color: '#666' }}>{client.codigoAsistencia || 'N/A'}</TableCell>
                  <TableCell sx={{ color: '#666' }}>{client.contacto}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(client)}
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
          {editingClient ? 'Editar Cliente' : 'Crear Cliente'}
        </DialogTitle>
        <DialogContent>
          <ClientForm client={editingClient} onSuccess={handleSuccess} onCancel={handleClose} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ClientsList;

