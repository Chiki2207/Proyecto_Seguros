import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { reportsAPI } from '../../services/api';

function MaterialsForm({ reportId, materials = [], onUpdate }) {
  const [materialsList, setMaterialsList] = useState(materials);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unitCost: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenDialog = (index = null) => {
    if (index !== null) {
      const material = materialsList[index];
      setFormData({
        name: material.name || '',
        quantity: material.quantity || '',
        unitCost: material.unitCost || '',
      });
      setEditingIndex(index);
    } else {
      setFormData({ name: '', quantity: '', unitCost: '' });
      setEditingIndex(null);
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: '', quantity: '', unitCost: '' });
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

  const calculateTotal = () => {
    const qty = parseFloat(formData.quantity) || 0;
    const unit = parseFloat(formData.unitCost) || 0;
    return qty * unit;
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('El nombre del material es requerido');
      return;
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    if (!formData.unitCost || parseFloat(formData.unitCost) < 0) {
      setError('El costo unitario debe ser mayor o igual a 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newMaterials = [...materialsList];
      const materialData = {
        name: formData.name.trim(),
        quantity: parseFloat(formData.quantity),
        unitCost: parseFloat(formData.unitCost),
        totalCost: calculateTotal(),
      };

      if (editingIndex !== null) {
        newMaterials[editingIndex] = materialData;
      } else {
        newMaterials.push(materialData);
      }

      await reportsAPI.update(reportId, { materialsUsed: newMaterials });
      setMaterialsList(newMaterials);
      handleCloseDialog();
      onUpdate?.();
    } catch (err) {
      console.error('Error guardando materiales:', err);
      setError(err.message || 'Error al guardar materiales');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm('¿Estás seguro de eliminar este material?')) return;

    setLoading(true);
    try {
      const newMaterials = materialsList.filter((_, i) => i !== index);
      await reportsAPI.update(reportId, { materialsUsed: newMaterials });
      setMaterialsList(newMaterials);
      onUpdate?.();
    } catch (err) {
      console.error('Error eliminando material:', err);
      alert('Error al eliminar material');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = materialsList.reduce((sum, m) => sum + (m.totalCost || 0), 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333333' }}>
          Materiales Usados
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
            color: '#000',
            fontWeight: 700,
            '&:hover': {
              background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
            },
          }}
        >
          Agregar Material
        </Button>
      </Box>

      {materialsList.length === 0 ? (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: '#FFF8E1',
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary">No hay materiales registrados</Typography>
        </Paper>
      ) : (
        <Box>
          {materialsList.map((material, idx) => (
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
                    {material.name}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Cantidad
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {material.quantity}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Costo Unitario
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${material.unitCost?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">
                        Costo Total
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFB300' }}>
                        ${material.totalCost?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
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
              Total: ${totalCost.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </Typography>
          </Paper>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Editar Material' : 'Agregar Material'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del Material"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
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
            <TextField
              fullWidth
              label="Costo Unitario"
              name="unitCost"
              type="number"
              value={formData.unitCost}
              onChange={handleChange}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <Paper
              sx={{
                p: 2,
                bgcolor: '#FFF8E1',
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Costo Total:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFB300' }}>
                ${calculateTotal().toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
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

export default MaterialsForm;

