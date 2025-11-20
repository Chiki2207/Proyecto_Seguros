import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { reportsAPI, mediaAPI, pricesAPI } from '../../services/api';
import PhotoCapture from '../MediaCapture/PhotoCapture';
import VideoCapture from '../MediaCapture/VideoCapture';
import AudioRecorder from '../MediaCapture/AudioRecorder';

function UnifiedReportForm({ reportId, clientId, onUpdate }) {
  const [activeTab, setActiveTab] = useState('photo'); // photo, video, audio
  const [comment, setComment] = useState('');
  const [materials, setMaterials] = useState([]);
  const [services, setServices] = useState([]);
  const [priceList, setPriceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mediaUploaded, setMediaUploaded] = useState(false);
  const [uploadedMediaId, setUploadedMediaId] = useState(null);

  // Estados para formularios de materiales y servicios
  const [materialForm, setMaterialForm] = useState({ name: '', quantity: '', unitCost: '' });
  const [serviceForm, setServiceForm] = useState({ priceItemId: '', quantity: '' });

  useEffect(() => {
    if (clientId) {
      loadPriceList();
    }
  }, [clientId]);

  const loadPriceList = async () => {
    try {
      const data = await pricesAPI.getByClient(clientId);
      setPriceList(data);
    } catch (err) {
      console.error('Error cargando lista de precios:', err);
    }
  };

  const handleAddMaterial = () => {
    if (!materialForm.name || !materialForm.quantity || !materialForm.unitCost) {
      setError('Completa todos los campos del material');
      return;
    }
    const newMaterial = {
      name: materialForm.name.trim(),
      quantity: parseFloat(materialForm.quantity),
      unitCost: parseFloat(materialForm.unitCost),
      totalCost: parseFloat(materialForm.quantity) * parseFloat(materialForm.unitCost),
    };
    setMaterials([...materials, newMaterial]);
    setMaterialForm({ name: '', quantity: '', unitCost: '' });
    setError('');
  };

  const handleRemoveMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleAddService = () => {
    if (!serviceForm.priceItemId || !serviceForm.quantity) {
      setError('Completa todos los campos del servicio');
      return;
    }
    const priceItem = priceList.find((p) => p._id.toString() === serviceForm.priceItemId);
    if (!priceItem) {
      setError('Servicio no encontrado');
      return;
    }
    const newService = {
      priceItemId: serviceForm.priceItemId,
      quantity: parseFloat(serviceForm.quantity),
      subtotal: parseFloat(serviceForm.quantity) * priceItem.price,
    };
    setServices([...services, newService]);
    setServiceForm({ priceItemId: '', quantity: '' });
    setError('');
  };

  const handleRemoveService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleMediaUploadSuccess = async (mediaData) => {
    setMediaUploaded(true);
    // El backend retorna { mediaId, media: { _id, ... } }
    const mediaId = mediaData.mediaId || mediaData.media?._id || mediaData._id;
    if (mediaId) {
      setUploadedMediaId(typeof mediaId === 'string' ? mediaId : mediaId.toString());
    }
    // No llamamos onUpdate aquí, esperamos a que se complete todo el proceso
  };

  const handleSubmit = async () => {
    if (!mediaUploaded && !comment.trim() && materials.length === 0 && services.length === 0) {
      setError('Debes agregar al menos una evidencia, comentario, material o servicio');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Obtener materiales y servicios actuales del reporte
      const currentReport = await reportsAPI.getById(reportId);
      const currentMaterials = currentReport.materialsUsed || [];
      const currentServices = currentReport.servicesBilled || [];

      // 2. Combinar materiales y servicios nuevos con los existentes
      const updatedMaterials = [...currentMaterials, ...materials];
      const updatedServices = [...currentServices, ...services];

      // 3. Actualizar el reporte con materiales y servicios
      if (materials.length > 0 || services.length > 0) {
        await reportsAPI.update(reportId, {
          materialsUsed: updatedMaterials,
          servicesBilled: updatedServices,
        });
      }

      // 4. Crear entrada en historial con toda la información unificada
      // Solo si hay al menos media, comentario, materiales o servicios
      if (mediaUploaded || comment.trim() || materials.length > 0 || services.length > 0) {
        const historyComment = `${
          mediaUploaded 
            ? `${activeTab === 'photo' ? '📷 Foto' : activeTab === 'video' ? '🎥 Video' : '🎤 Audio'} subido. ` 
            : ''
        }${comment.trim()}${
          materials.length > 0 
            ? `\n\n📦 Materiales agregados:\n${materials.map(m => `  • ${m.name}: ${m.quantity} unidades - $${m.totalCost?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`).join('\n')}` 
            : ''
        }${
          services.length > 0 
            ? `\n\n🔧 Servicios agregados:\n${services.map(s => {
                const service = priceList.find(p => p._id.toString() === s.priceItemId);
                return service ? `  • ${service.serviceName}: ${s.quantity} unidades - $${s.subtotal?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}` : '';
              }).join('\n')}` 
            : ''
        }`;

        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/reports/${reportId}/history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            type: 'ACTUALIZACION_TECNICO',
            comment: historyComment.trim(),
            ...(uploadedMediaId && { mediaId: uploadedMediaId }),
          }),
        });
      }

      // 5. Limpiar formulario
      setComment('');
      setMaterials([]);
      setServices([]);
      setMaterialForm({ name: '', quantity: '', unitCost: '' });
      setServiceForm({ priceItemId: '', quantity: '' });
      setMediaUploaded(false);
      setUploadedMediaId(null);
      setActiveTab('photo');

      // 6. Actualizar vista
      onUpdate?.();
    } catch (err) {
      console.error('Error guardando avance:', err);
      setError(err.message || 'Error al guardar el avance');
    } finally {
      setLoading(false);
    }
  };

  const totalMaterialsCost = materials.reduce((sum, m) => sum + (m.totalCost || 0), 0);
  const totalServicesCost = services.reduce((sum, s) => sum + (s.subtotal || 0), 0);

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        bgcolor: '#FFFFFF',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255, 214, 0, 0.1)',
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 3,
        }}
      >
        Registrar Avance
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs para tipo de evidencia */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <Button
          variant={activeTab === 'photo' ? 'contained' : 'outlined'}
          startIcon={<CameraAltIcon />}
          onClick={() => setActiveTab('photo')}
          sx={{
            flex: 1,
            bgcolor: activeTab === 'photo' ? '#FFD600' : 'transparent',
            color: activeTab === 'photo' ? '#000' : '#FFB300',
            borderColor: '#FFB300',
            fontWeight: 600,
            '&:hover': {
              bgcolor: activeTab === 'photo' ? '#FFB300' : 'rgba(255, 179, 0, 0.1)',
            },
          }}
        >
          Foto
        </Button>
        <Button
          variant={activeTab === 'video' ? 'contained' : 'outlined'}
          startIcon={<VideocamIcon />}
          onClick={() => setActiveTab('video')}
          sx={{
            flex: 1,
            bgcolor: activeTab === 'video' ? '#FFD600' : 'transparent',
            color: activeTab === 'video' ? '#000' : '#FFB300',
            borderColor: '#FFB300',
            fontWeight: 600,
            '&:hover': {
              bgcolor: activeTab === 'video' ? '#FFB300' : 'rgba(255, 179, 0, 0.1)',
            },
          }}
        >
          Video
        </Button>
        <Button
          variant={activeTab === 'audio' ? 'contained' : 'outlined'}
          startIcon={<MicIcon />}
          onClick={() => setActiveTab('audio')}
          sx={{
            flex: 1,
            bgcolor: activeTab === 'audio' ? '#FFD600' : 'transparent',
            color: activeTab === 'audio' ? '#000' : '#FFB300',
            borderColor: '#FFB300',
            fontWeight: 600,
            '&:hover': {
              bgcolor: activeTab === 'audio' ? '#FFB300' : 'rgba(255, 179, 0, 0.1)',
            },
          }}
        >
          Audio
        </Button>
      </Box>

      {/* Captura de media según el tab activo */}
      <Box sx={{ mb: 3 }}>
        {activeTab === 'photo' && (
          <PhotoCapture
            reportId={reportId}
            onUploadSuccess={handleMediaUploadSuccess}
          />
        )}
        {activeTab === 'video' && (
          <VideoCapture
            reportId={reportId}
            onUploadSuccess={handleMediaUploadSuccess}
          />
        )}
        {activeTab === 'audio' && (
          <AudioRecorder
            reportId={reportId}
            onUploadSuccess={handleMediaUploadSuccess}
          />
        )}
        {mediaUploaded && (
          <Chip
            label={`${activeTab === 'photo' ? 'Foto' : activeTab === 'video' ? 'Video' : 'Audio'} subido correctamente`}
            color="success"
            sx={{ mt: 2 }}
          />
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Comentario/Observación */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
          Comentario / Observación
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Describe el avance, observaciones, acciones realizadas..."
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#FFF8E1',
              '& fieldset': {
                borderColor: 'rgba(255, 214, 0, 0.4)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 214, 0, 0.6)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#FFB300',
              },
            },
          }}
        />
      </Box>

      {/* Materiales Usados */}
      <Accordion sx={{ mb: 2, bgcolor: '#FFF8E1', borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Materiales Usados ({materials.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nombre"
                  value={materialForm.name}
                  onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cantidad"
                  type="number"
                  value={materialForm.quantity}
                  onChange={(e) => setMaterialForm({ ...materialForm, quantity: e.target.value })}
                  inputProps={{ min: 0.01, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Costo Unitario"
                  type="number"
                  value={materialForm.unitCost}
                  onChange={(e) => setMaterialForm({ ...materialForm, unitCost: e.target.value })}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            </Grid>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddMaterial}
              sx={{
                bgcolor: '#FFD600',
                color: '#000',
                fontWeight: 600,
                '&:hover': { bgcolor: '#FFB300' },
              }}
            >
              Agregar Material
            </Button>
          </Box>

          {materials.length > 0 && (
            <Box>
              {materials.map((material, idx) => (
                <Paper
                  key={idx}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    bgcolor: '#FFFFFF',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {material.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {material.quantity} x ${material.unitCost?.toLocaleString('es-ES')} = ${material.totalCost?.toLocaleString('es-ES')}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveMaterial(idx)}
                    sx={{ color: '#D32F2F' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#FFD600', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right' }}>
                  Total Materiales: ${totalMaterialsCost.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Servicios Facturados */}
      {clientId && (
        <Accordion sx={{ mb: 3, bgcolor: '#FFF8E1', borderRadius: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Servicios Facturados ({services.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Servicio</InputLabel>
                    <Select
                      value={serviceForm.priceItemId}
                      onChange={(e) => setServiceForm({ ...serviceForm, priceItemId: e.target.value })}
                      label="Servicio"
                    >
                      {priceList.map((price) => (
                        <MenuItem key={price._id} value={price._id}>
                          {price.serviceName} - ${price.price?.toLocaleString('es-ES')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Cantidad"
                    type="number"
                    value={serviceForm.quantity}
                    onChange={(e) => setServiceForm({ ...serviceForm, quantity: e.target.value })}
                    inputProps={{ min: 0.01, step: 0.01 }}
                  />
                </Grid>
              </Grid>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddService}
                disabled={priceList.length === 0}
                sx={{
                  bgcolor: '#FFD600',
                  color: '#000',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#FFB300' },
                }}
              >
                Agregar Servicio
              </Button>
            </Box>

            {services.length > 0 && (
              <Box>
                {services.map((service, idx) => {
                  const priceItem = priceList.find((p) => p._id.toString() === service.priceItemId);
                  return (
                    <Paper
                      key={idx}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        bgcolor: '#FFFFFF',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {priceItem?.serviceName || 'Servicio'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {service.quantity} x ${priceItem?.price?.toLocaleString('es-ES')} = ${service.subtotal?.toLocaleString('es-ES')}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveService(idx)}
                        sx={{ color: '#D32F2F' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  );
                })}
                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#FFD600', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right' }}>
                    Total Servicios: ${totalServicesCost.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Botón de guardar */}
      <Button
        fullWidth
        variant="contained"
        onClick={handleSubmit}
        disabled={loading || (!mediaUploaded && !comment.trim() && materials.length === 0 && services.length === 0)}
        sx={{
          background: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)',
          color: '#000',
          fontWeight: 700,
          py: 1.5,
          fontSize: '1rem',
          '&:hover': {
            background: 'linear-gradient(135deg, #FFB300 0%, #F9A825 100%)',
          },
          '&:disabled': {
            bgcolor: '#E0E0E0',
            color: '#9E9E9E',
          },
        }}
      >
        {loading ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1, color: '#000' }} />
            Guardando...
          </>
        ) : (
          'Guardar Avance'
        )}
      </Button>
    </Paper>
  );
}

export default UnifiedReportForm;

