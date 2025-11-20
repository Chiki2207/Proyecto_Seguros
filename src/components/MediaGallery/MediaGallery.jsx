import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Dialog,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PhotoIcon from '@mui/icons-material/Photo';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import DownloadIcon from '@mui/icons-material/Download';
import PersonIcon from '@mui/icons-material/Person';
import PhotoCapture from '../MediaCapture/PhotoCapture';
import VideoCapture from '../MediaCapture/VideoCapture';
import AudioRecorder from '../MediaCapture/AudioRecorder';
import { usersAPI } from '../../services/api';

function MediaGallery({ reportId, media = [], onRefresh }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploaders, setUploaders] = useState({});
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'ADMIN';

  const photos = media.filter((m) => m.type === 'FOTO');
  const videos = media.filter((m) => m.type === 'VIDEO');
  const audios = media.filter((m) => m.type === 'AUDIO');

  useEffect(() => {
    loadUploaders();
  }, [media]);

  const loadUploaders = async () => {
    const userIds = [...new Set(media.map((m) => m.uploadedBy?.toString()).filter(Boolean))];
    const uploadersMap = {};
    
    for (const userId of userIds) {
      try {
        const userData = await usersAPI.getById(userId);
        uploadersMap[userId] = userData;
      } catch (error) {
        console.error('Error cargando usuario:', error);
      }
    }
    
    setUploaders(uploadersMap);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getMediaUrl = (url) => {
    if (url.startsWith('http')) return url;
    // Los archivos están en public/media, así que usamos la URL relativa
    // En desarrollo, Vite sirve desde public/ directamente
    // En producción, el backend también sirve desde /media
    // Asegurar que la URL comience con /
    if (!url.startsWith('/')) {
      return `/${url}`;
    }
    // Si la URL antigua tiene /uploads/, reemplazarla por /media/
    return url.replace(/^\/uploads\//, '/media/');
  };

  const handleDownload = async (mediaItem) => {
    try {
      const url = getMediaUrl(mediaItem.url);
      
      // Si es una URL relativa, construir la URL completa
      const fullUrl = url.startsWith('http') 
        ? url 
        : `${window.location.origin}${url}`;
      
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        throw new Error(`Error al descargar el archivo: ${response.status}`);
      }
      
      // Obtener el tipo MIME del response
      const contentType = response.headers.get('content-type') || '';
      const blob = await response.blob();
      
      // Crear un blob con el tipo MIME correcto
      const typedBlob = new Blob([blob], { type: contentType });
      const downloadUrl = window.URL.createObjectURL(typedBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Obtener la extensión del archivo desde la URL
      const urlParts = mediaItem.url.split('.');
      let ext = urlParts.length > 1 ? urlParts[urlParts.length - 1].toLowerCase() : '';
      
      // Si no hay extensión, inferirla del tipo MIME
      if (!ext) {
        if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) ext = 'jpg';
        else if (contentType.includes('image/png')) ext = 'png';
        else if (contentType.includes('image/gif')) ext = 'gif';
        else if (contentType.includes('video/mp4')) ext = 'mp4';
        else if (contentType.includes('video/webm')) ext = 'webm';
        else if (contentType.includes('audio/mpeg') || contentType.includes('audio/mp3')) ext = 'mp3';
        else if (contentType.includes('audio/webm')) ext = 'webm';
        else if (contentType.includes('audio/wav')) ext = 'wav';
        else ext = 'bin';
      }
      
      // Nombre del archivo con tipo, fecha y extensión correcta
      const date = new Date(mediaItem.createdAt).toISOString().split('T')[0];
      const uploaderName = getUploaderName(mediaItem.uploadedBy).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      const filename = `${mediaItem.type.toLowerCase()}_${uploaderName}_${date}.${ext}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error descargando archivo:', error);
      alert(`Error al descargar el archivo: ${error.message}`);
    }
  };

  const getUploaderName = (uploadedBy) => {
    if (!uploadedBy) return 'Desconocido';
    const uploader = uploaders[uploadedBy.toString()];
    return uploader?.fullName || uploader?.username || 'Desconocido';
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: '#FFFFFF',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333333' }}>
            Multimedia
          </Typography>
          <Chip
            label={`${media.length} archivo${media.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{ bgcolor: '#FFD600', color: '#000' }}
          />
        </Box>

        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              minWidth: { xs: 80, sm: 120 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        >
          <Tab
            icon={<PhotoIcon />}
            iconPosition="start"
            label={`Fotos (${photos.length})`}
            sx={{ textTransform: 'none' }}
          />
          <Tab
            icon={<VideocamIcon />}
            iconPosition="start"
            label={`Videos (${videos.length})`}
            sx={{ textTransform: 'none' }}
          />
          <Tab
            icon={<MicIcon />}
            iconPosition="start"
            label={`Audios (${audios.length})`}
            sx={{ textTransform: 'none' }}
          />
        </Tabs>

        {/* FOTOS */}
        {selectedTab === 0 && (
          <Box>
            {!isAdmin && (
              <Box sx={{ mb: 3 }}>
                <PhotoCapture reportId={reportId} onUploadSuccess={onRefresh} />
              </Box>
            )}
            {photos.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No hay fotos registradas
              </Typography>
            ) : (
              <Grid 
                container 
                spacing={2}
                sx={{
                  width: '100%',
                  maxWidth: '100%',
                  margin: 0,
                  '& > .MuiGrid-item': {
                    paddingLeft: { xs: 1, sm: 2 },
                    paddingTop: { xs: 1, sm: 2 },
                  },
                }}
              >
                {photos.map((photo) => (
                  <Grid item xs={6} sm={4} md={3} key={photo._id} sx={{ maxWidth: '100%' }}>
                    <Paper
                      sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: '100%',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Box
                        onClick={() => setSelectedImage(photo)}
                        sx={{ position: 'relative', width: '100%', maxWidth: '100%' }}
                      >
                        <img
                          src={getMediaUrl(photo.url)}
                          alt="Foto"
                          style={{
                            width: '100%',
                            maxWidth: '100%',
                            height: '150px',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        {isAdmin && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(photo);
                            }}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(0,0,0,0.6)',
                              color: '#FFF',
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      <Box sx={{ p: 1, bgcolor: '#FFF8E1' }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon fontSize="small" sx={{ color: '#FFB300' }} />
                          {getUploaderName(photo.uploadedBy)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                          {new Date(photo.createdAt).toLocaleString('es-ES')}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* VIDEOS */}
        {selectedTab === 1 && (
          <Box>
            {!isAdmin && (
              <Box sx={{ mb: 3 }}>
                <VideoCapture reportId={reportId} onUploadSuccess={onRefresh} />
              </Box>
            )}
            {videos.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No hay videos registrados
              </Typography>
            ) : (
              <Grid 
                container 
                spacing={2}
                sx={{
                  width: '100%',
                  maxWidth: '100%',
                  margin: 0,
                  '& > .MuiGrid-item': {
                    paddingLeft: { xs: 1, sm: 2 },
                    paddingTop: { xs: 1, sm: 2 },
                  },
                }}
              >
                {videos.map((video) => (
                  <Grid item xs={12} sm={6} key={video._id} sx={{ maxWidth: '100%' }}>
                    <Paper
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        bgcolor: '#FFF8E1',
                        border: '1px solid #FFD600',
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: '100%',
                        overflow: 'hidden',
                      }}
                    >
                      <Box sx={{ position: 'relative', width: '100%', maxWidth: '100%' }}>
                        <video
                          src={getMediaUrl(video.url)}
                          controls
                          style={{
                            width: '100%',
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: 8,
                            display: 'block',
                          }}
                        />
                        {isAdmin && (
                          <Button
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownload(video)}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: '#FFF',
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                              fontSize: { xs: '0.7rem', sm: '0.875rem' },
                              padding: { xs: '4px 8px', sm: '6px 16px' },
                            }}
                          >
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                              Descargar
                            </Box>
                            <DownloadIcon sx={{ display: { xs: 'inline', sm: 'none' }, fontSize: '1rem' }} />
                          </Button>
                        )}
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <PersonIcon fontSize="small" sx={{ color: '#FFB300' }} />
                          {getUploaderName(video.uploadedBy)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                          {new Date(video.createdAt).toLocaleString('es-ES')}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* AUDIOS */}
        {selectedTab === 2 && (
          <Box>
            {!isAdmin && (
              <Box sx={{ mb: 3 }}>
                <AudioRecorder reportId={reportId} onUploadSuccess={onRefresh} />
              </Box>
            )}
            {audios.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No hay audios registrados
              </Typography>
            ) : (
              <Grid 
                container 
                spacing={2}
                sx={{
                  width: '100%',
                  maxWidth: '100%',
                  margin: 0,
                  '& > .MuiGrid-item': {
                    paddingLeft: { xs: 1, sm: 2 },
                    paddingTop: { xs: 1, sm: 2 },
                  },
                }}
              >
                {audios.map((audio) => (
                  <Grid item xs={12} key={audio._id} sx={{ maxWidth: '100%', width: '100%' }}>
                    <Paper
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        bgcolor: '#FFF8E1',
                        border: '1px solid #FFD600',
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: '100%',
                        overflow: 'hidden',
                      }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: { xs: 1, sm: 2 }, 
                          mb: 2,
                          width: '100%',
                          maxWidth: '100%',
                          flexWrap: { xs: 'wrap', sm: 'nowrap' },
                        }}
                      >
                        <PlayArrowIcon sx={{ color: '#FFB300', flexShrink: 0 }} />
                        <audio
                          src={getMediaUrl(audio.url)}
                          controls
                          style={{ 
                            flex: 1,
                            width: '100%',
                            maxWidth: '100%',
                            minWidth: 0,
                          }}
                        />
                        {isAdmin && (
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(audio)}
                            sx={{
                              bgcolor: '#FFD600',
                              color: '#000',
                              flexShrink: 0,
                              '&:hover': { bgcolor: '#FFB300' },
                            }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        )}
                      </Box>
                      {audio.transcripcion && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: '#FFFFFF',
                            borderRadius: 1,
                            maxHeight: '150px',
                            overflowY: 'auto',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                            Transcripción:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#555' }}>
                            {audio.transcripcion}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <PersonIcon fontSize="small" sx={{ color: '#FFB300' }} />
                          {getUploaderName(audio.uploadedBy)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                          {new Date(audio.createdAt).toLocaleString('es-ES')}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Paper>

      {/* Dialog para imagen grande */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, display: 'flex', gap: 1 }}>
            {isAdmin && selectedImage && (
              <IconButton
                onClick={() => handleDownload(selectedImage)}
                sx={{
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: '#FFF',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                }}
              >
                <DownloadIcon />
              </IconButton>
            )}
            <IconButton
              onClick={() => setSelectedImage(null)}
              sx={{
                bgcolor: 'rgba(0,0,0,0.5)',
                color: '#FFF',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          {selectedImage && (
            <>
              <img
                src={getMediaUrl(selectedImage.url)}
                alt="Foto"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <Box sx={{ p: 2, bgcolor: '#FFF8E1' }}>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <PersonIcon fontSize="small" sx={{ color: '#FFB300' }} />
                  Subido por: {getUploaderName(selectedImage.uploadedBy)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                  {new Date(selectedImage.createdAt).toLocaleString('es-ES')}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default MediaGallery;

