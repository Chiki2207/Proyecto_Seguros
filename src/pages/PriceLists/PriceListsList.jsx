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
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { pricesAPI, clientsAPI } from '../../services/api';
import PriceForm from './PriceForm';

function PriceListsList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [prices, setPrices] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadPrices();
    } else {
      setPrices([]);
      setLoading(false);
    }
  }, [selectedClientId]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await clientsAPI.getAll();
      setClients(data);
      if (data.length > 0 && !selectedClientId) {
        setSelectedClientId(data[0]._id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error cargando clientes:', error);
      setLoading(false);
    }
  };

  const loadPrices = async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const data = await pricesAPI.getByClient(selectedClientId);
      setPrices(data);
    } catch (error) {
      console.error('Error cargando precios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPrice(null);
    setOpenDialog(true);
  };

  const handleEdit = (price) => {
    setEditingPrice(price);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingPrice(null);
  };

  const handleSuccess = () => {
    handleClose();
    loadPrices();
  };

  const selectedClient = clients.find((c) => c._id === selectedClientId);

  if (loading && clients.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (clients.length === 0) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#333', mb: 3 }}>
          Listas de Precios
        </Typography>
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            bgcolor: '#FFF8E1',
            border: '2px dashed #FFD600',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: '#666', mb: 2 }}>
            No hay clientes registrados
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Primero debes crear al menos un cliente para poder agregar listas de precios.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/clients'}
            sx={{
              bgcolor: '#FFD600',
              color: '#000',
              '&:hover': { bgcolor: '#FFB300' },
            }}
          >
            Ir a Clientes
          </Button>
        </Paper>
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
            Listas de Precios
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            disabled={!selectedClientId}
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
              '&:disabled': {
                background: '#E0E0E0',
                color: '#9E9E9E',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Agregar Precio
          </Button>
        </Box>
      </Paper>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: '#FFFFFF',
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1px solid rgba(255, 214, 0, 0.1)',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontWeight: 500 }}>Cliente</InputLabel>
              <Select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                label="Cliente"
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 214, 0, 0.3)',
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
        </Grid>
      </Paper>

      {selectedClient && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            bgcolor: '#FFFDE7',
            borderRadius: 2,
            border: '1px solid rgba(255, 214, 0, 0.2)',
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#666' }}>
            Precios para: <Box component="span" sx={{ color: '#FFB300', fontWeight: 700 }}>{selectedClient.name}</Box>
          </Typography>
        </Paper>
      )}

      {/* Vista móvil: Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : prices.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#FFFFFF', borderRadius: 3 }}>
            <Typography color="text.secondary">
              {selectedClientId ? 'No hay precios registrados para este cliente' : 'Selecciona un cliente'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {prices.map((price) => (
              <Grid item xs={12} key={price._id}>
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
                        {price.serviceName}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFB300', mb: 1.5 }}>
                        ${price.price?.toLocaleString('es-ES') || '0'}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => handleEdit(price)}
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
                        Descripción:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>{price.description || 'N/A'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                        Accesorios:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>{price.accessories || 'N/A'}</Typography>
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
              <TableCell>Servicio</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Accesorios</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : prices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {selectedClientId ? 'No hay precios registrados para este cliente' : 'Selecciona un cliente'}
                </TableCell>
              </TableRow>
            ) : (
              prices.map((price) => (
                <TableRow 
                  key={price._id} 
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
                  <TableCell sx={{ fontWeight: 500 }}>{price.serviceName}</TableCell>
                  <TableCell sx={{ color: '#666' }}>{price.description || 'N/A'}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#FFB300' }}>
                    ${price.price?.toLocaleString('es-ES') || '0'}
                  </TableCell>
                  <TableCell sx={{ color: '#666' }}>{price.accessories || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(price)}
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
          {editingPrice ? 'Editar Precio' : 'Agregar Precio'}
        </DialogTitle>
        <DialogContent>
          <PriceForm
            clientId={selectedClientId}
            price={editingPrice}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default PriceListsList;

