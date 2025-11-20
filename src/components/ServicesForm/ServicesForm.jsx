import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { reportsAPI, pricesAPI } from '../../services/api';

function ServicesForm({ reportId, clientId, services = [], onUpdate }) {
  const [servicesList, setServicesList] = useState(services);
  const [priceList, setPriceList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [formData, setFormData] = useState({
    priceItemId: '',
    quantity: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientId) {
      loadPriceList();
    }
  }, [clientId]);

  const loadPriceList = async () => {
    if (!clientId) return;
    setLoadingPrices(true);
    try {
      const data = await pricesAPI.getByClient(clientId);
      setPriceList(data);
    } catch (err) {
      console.error('Error cargando lista de precios:', err);
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleOpenDialog = (index = null) => {
    if (index !== null) {
      const service = servicesList[index];
      setFormData({
        priceItemId: service.priceItemId?.toString() || '',
        quantity: service.quantity || '',
      });
      setEditingIndex(index);
    } else {
      setFormData({ priceItemId: '', quantity: '' });
      setEditingIndex(null);
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ priceItemId: '', quantity: '' });
    setEditingIndex(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const getSelectedPriceItem = () => {
    return priceList.find((p) => p._id.toString() === formData.priceItemId);
  };

  const calculateSubtotal = () => {
    const priceItem = getSelectedPriceItem();
    if (!priceItem || !formData.quantity) return 0;
    const qty = parseFloat(formData.quantity) || 0;
    return qty * priceItem.price;
  };

  const handleSave = async () => {
    if (!formData.priceItemId) {
      setError('Debes seleccionar un servicio');
      return;
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newServices = [...servicesList];
      const priceItem = getSelectedPriceItem();
      const serviceData = {
        priceItemId: formData.priceItemId,
        quantity: parseFloat(formData.quantity),
        subtotal: calculateSubtotal(),
      };

      if (editingIndex !== null) {
        newServices[editingIndex] = serviceData;
      } else {
        newServices.push(serviceData);
      }

      await reportsAPI.update(reportId, { servicesBilled: newServices });
      setServicesList(newServices);
      handleCloseDialog();
      onUpdate?.();
    } catch (err) {
      console.error('Error guardando servicios:', err);
      setError(err.message || 'Error al guardar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return;

    setLoading(true);
    try {
      const newServices = servicesList.filter((_, i) => i !== index);
      await reportsAPI.update(reportId, { servicesBilled: newServices });
      setServicesList(newServices);
      onUpdate?.();
    } catch (err) {
      console.error('Error eliminando servicio:', err);
      alert('Error al eliminar servicio');
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (priceItemId) => {
    const priceItem = priceList.find((p) => p._id.toString() === priceItemId);
    return priceItem?.serviceName || 'Servicio no encontrado';
  };

  const getServicePrice = (priceItemId) => {
    const priceItem = priceList.find((p) => p._id.toString() === priceItemId);
    return priceItem?.price || 0;
  };

  const totalSubtotal = servicesList.reduce((sum, s) => sum + (s.subtotal || 0), 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333333' }}>
          Servicios Facturados
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={!clientId || loadingPrices}
          sx={{
            background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
            color: '#000',
            fontWeight: 700,
            '&:hover': {
              background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
            },
          }}
        >
          Agregar Servicio
        </Button>
      </Box>

      {!clientId ? (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: '#FFF8E1',
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary">
            No hay cliente asociado a este reporte
          </Typography>
        </Paper>
      ) : servicesList.length === 0 ? (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: '#FFF8E1',
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary">No hay servicios registrados</Typography>
        </Paper>
      ) : (
        <Box>
          {servicesList.map((service, idx) => (
            <Paper
              key={idx}
              sx={{
                p: 2,
                mb: 2,
                bgcolor: '#FFF8E1',
                borderRadius: 2,
                border: '1px solid rgba(255, 214, 0, 0.2)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(255, 214, 0, 0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {getServiceName(service.priceItemId)}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Cantidad
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {service.quantity}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Precio Unitario
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${getServicePrice(service.priceItemId)?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Subtotal
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFB300' }}>
                        ${service.subtotal?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(idx)}
                    sx={{
                      color: '#FFB300',
                      '&:hover': { bgcolor: 'rgba(255, 179, 0, 0.1)' },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(idx)}
                    disabled={loading}
                    sx={{
                      color: '#D32F2F',
                      '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
          <Paper
            sx={{
              p: 2,
              mt: 2,
              bgcolor: '#FFD600',
              borderRadius: 2,
              border: '2px solid #FFB300',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#000', textAlign: 'right' }}>
              Total: ${totalSubtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </Typography>
          </Paper>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Editar Servicio' : 'Agregar Servicio'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {loadingPrices ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Servicio</InputLabel>
                <Select
                  name="priceItemId"
                  value={formData.priceItemId}
                  onChange={handleChange}
                  label="Servicio"
                >
                  {priceList.length === 0 ? (
                    <MenuItem value="" disabled>
                      No hay servicios disponibles para este cliente
                    </MenuItem>
                  ) : (
                    priceList.map((price) => (
                      <MenuItem key={price._id} value={price._id}>
                        {price.serviceName} - ${price.price?.toLocaleString('es-ES')}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Cantidad"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
                inputProps={{ min: 0.01, step: 0.01 }}
              />
              {formData.priceItemId && formData.quantity && (
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: '#FFF8E1',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Subtotal:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFB300' }}>
                    ${calculateSubtotal().toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || loadingPrices || priceList.length === 0}
            sx={{
              bgcolor: '#FFD600',
              color: '#000',
              fontWeight: 700,
              '&:hover': { bgcolor: '#FFB300' },
            }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ServicesForm;

