import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogContent,
  TextField,
  Button,
} from '@mui/material';
import PhotoIcon from '@mui/icons-material/Photo';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import DownloadIcon from '@mui/icons-material/Download';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import NoteIcon from '@mui/icons-material/Note';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { historyAPI, mediaAPI } from '../../services/api';

function ReportTimeline({ reportId, history = [], media = [], onUpdate, isAssignedTechnician = false }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [deletingMedia, setDeletingMedia] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'ADMIN';
  const currentUserId = user?._id?.toString() || user?.userId?.toString();

  // Función para verificar si el usuario puede eliminar un media
  const canDeleteMedia = (mediaItem) => {
    if (isAdmin) return true;
    if (!isAssignedTechnician) return false;
    const uploadedBy = mediaItem.uploadedBy?.toString() || (typeof mediaItem.uploadedBy === 'object' ? mediaItem.uploadedBy?._id?.toString() : null);
    return uploadedBy === currentUserId;
  };

  // Función para eliminar media
  const handleDeleteMedia = async (mediaItem) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta evidencia?')) {
      return;
    }

    setDeletingMedia(mediaItem._id);
    try {
      await mediaAPI.delete(reportId, mediaItem._id);
      onUpdate?.();
    } catch (error) {
      console.error('Error eliminando media:', error);
      alert(error.message || 'Error al eliminar la evidencia');
    } finally {
      setDeletingMedia(null);
    }
  };

  // Combinar historial y media en un array unificado
  // Si una entrada del historial tiene media asociado, no duplicamos el media
  const mediaIdsInHistory = new Set(
    history
      .filter((entry) => entry.mediaId || entry.associatedMedia)
      .map((entry) => (entry.mediaId?.toString() || entry.associatedMedia?._id?.toString()))
  );

  const timelineItems = [
    ...history.map((entry) => ({
      type: 'history',
      id: entry._id,
      date: new Date(entry.createdAt),
      data: entry,
      // Si tiene media asociado, incluirlo en la entrada del historial
      associatedMedia: entry.associatedMedia || (entry.mediaId ? media.find((m) => m._id.toString() === entry.mediaId.toString()) : null),
    })),
    // Solo incluir media que NO esté asociado a una entrada del historial
    ...media
      .filter((item) => !mediaIdsInHistory.has(item._id.toString()))
      .map((item) => ({
        type: 'media',
        id: item._id,
        date: new Date(item.createdAt),
        data: item,
      })),
  ];

  // Ordenar por fecha (más antiguo primero, como un documento que se va escribiendo)
  timelineItems.sort((a, b) => a.date - b.date);

  const getMediaUrl = (url) => {
    if (url.startsWith('http')) return url;
    if (!url.startsWith('/')) {
      return `/${url}`;
    }
    return url.replace(/^\/uploads\//, '/media/');
  };

  const handleDownload = async (mediaItem) => {
    try {
      const url = getMediaUrl(mediaItem.url);
      const fullUrl = url.startsWith('http') 
        ? url 
        : `${window.location.origin}${url}`;
      
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        throw new Error(`Error al descargar el archivo: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type') || '';
      const blob = await response.blob();
      const typedBlob = new Blob([blob], { type: contentType });
      const downloadUrl = window.URL.createObjectURL(typedBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const urlParts = mediaItem.url.split('.');
      let ext = urlParts.length > 1 ? urlParts[urlParts.length - 1].toLowerCase() : '';
      
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
      
      const date = new Date(mediaItem.createdAt).toISOString().split('T')[0];
      const uploaderName = (mediaItem.uploadedByUser?.fullName || mediaItem.uploadedByUser?.username || 'Desconocido')
        .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'CAMBIO_ESTADO':
        return <CheckCircleIcon sx={{ color: '#FFB300' }} />;
      case 'ACTUALIZACION_TECNICO':
        return <EditIcon sx={{ color: '#00BFA5' }} />;
      case 'NOTA_ADMIN':
        return <NoteIcon sx={{ color: '#1A237E' }} />;
      case 'FOTO':
        return <PhotoIcon sx={{ color: '#FFB300' }} />;
      case 'VIDEO':
        return <VideocamIcon sx={{ color: '#FFB300' }} />;
      case 'AUDIO':
        return <MicIcon sx={{ color: '#FFB300' }} />;
      default:
        return <PersonIcon sx={{ color: '#FFB300' }} />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'CAMBIO_ESTADO':
        return 'Cambio de Estado';
      case 'ACTUALIZACION_TECNICO':
        return 'Actualización del Técnico';
      case 'NOTA_ADMIN':
        return 'Nota Administrativa';
      case 'FOTO':
        return 'Foto';
      case 'VIDEO':
        return 'Video';
      case 'AUDIO':
        return 'Audio';
      default:
        return type;
    }
  };

  const getUserName = (item) => {
    if (item.type === 'media') {
      return item.data.uploadedByUser?.fullName || item.data.uploadedByUser?.username || 'Desconocido';
    } else {
      return item.data.user?.fullName || item.data.user?.username || 'Desconocido';
    }
  };

  const getUserRole = (item) => {
    if (item.type === 'media') {
      return item.data.uploadedByUser?.role || '';
    } else {
      return item.data.user?.role || '';
    }
  };

  if (timelineItems.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          bgcolor: '#FFFFFF',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}
      >
        <Typography color="text.secondary">
          No hay actividad registrada en este reporte
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
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
          Historial Completo
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ position: 'relative', pl: { xs: 2, sm: 3 } }}>
          {timelineItems.map((item, idx) => {
            const isLast = idx === timelineItems.length - 1;
            return (
            <Box
              key={item.id}
              sx={{
                position: 'relative',
                pb: isLast ? 0 : 4,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: { xs: '-9px', sm: '-11px' },
                  top: 8,
                  width: { xs: '16px', sm: '20px' },
                  height: { xs: '16px', sm: '20px' },
                  borderRadius: '50%',
                  bgcolor: item.type === 'media' ? '#00BFA5' : '#FFB300',
                  border: '3px solid #FFFFFF',
                  boxShadow: '0 0 0 2px #FFD600',
                  zIndex: 2,
                },
                '&::after': !isLast ? {
                  content: '""',
                  position: 'absolute',
                  left: { xs: '-2px', sm: '-1px' },
                  top: 28,
                  width: '2px',
                  height: 'calc(100% - 8px)',
                  bgcolor: '#FFE082',
                  zIndex: 1,
                } : {},
              }}
            >
              <Paper
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  ml: { xs: 2, sm: 3 },
                  background: item.type === 'media'
                    ? 'linear-gradient(135deg, rgba(0, 191, 165, 0.05) 0%, rgba(255, 253, 231, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 214, 0, 0.05) 0%, rgba(255, 253, 231, 0.9) 100%)',
                  borderRadius: 3,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: `1px solid ${item.type === 'media' ? 'rgba(0, 191, 165, 0.2)' : 'rgba(255, 214, 0, 0.2)'}`,
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Header con tipo, usuario y fecha */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    {getTypeIcon(item.type === 'media' ? item.data.type : item.data.type)}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333' }}>
                        {getTypeLabel(item.type === 'media' ? item.data.type : item.data.type)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: '#FFD600',
                            color: '#000',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {getUserName(item).charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
                          {getUserName(item)}
                        </Typography>
                        {getUserRole(item) && (
                          <Chip
                            label={getUserRole(item)}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: getUserRole(item) === 'ADMIN' ? '#1A237E' : '#00BFA5',
                              color: '#FFF',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#999', fontWeight: 500 }}>
                    {item.date.toLocaleString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>

                {/* Contenido según el tipo */}
                {item.type === 'media' ? (
                  <Box>
                    {item.data.type === 'FOTO' && (
                      <Box
                        onClick={() => setSelectedImage(item.data)}
                        sx={{
                          position: 'relative',
                          cursor: 'pointer',
                          borderRadius: 2,
                          overflow: 'hidden',
                          mb: 1,
                          '&:hover': {
                            transform: 'scale(1.02)',
                          },
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        <img
                          src={getMediaUrl(item.data.url)}
                          alt="Foto"
                          style={{
                            width: '100%',
                            maxHeight: '300px',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            display: 'flex',
                            gap: 0.5,
                          }}
                        >
                          {isAdmin && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item.data);
                              }}
                              sx={{
                                bgcolor: 'rgba(0,0,0,0.6)',
                                color: '#FFF',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                              }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          )}
                          {canDeleteMedia(item.data) && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMedia(item.data);
                              }}
                              disabled={deletingMedia === item.data._id}
                              sx={{
                                bgcolor: 'rgba(211, 47, 47, 0.8)',
                                color: '#FFF',
                                '&:hover': { bgcolor: 'rgba(211, 47, 47, 1)' },
                                '&:disabled': { bgcolor: 'rgba(211, 47, 47, 0.5)' },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    )}

                    {item.data.type === 'VIDEO' && (
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ position: 'relative' }}>
                          <video
                            src={getMediaUrl(item.data.url)}
                            controls
                            style={{
                              width: '100%',
                              maxHeight: '400px',
                              borderRadius: 8,
                              display: 'block',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              display: 'flex',
                              gap: 0.5,
                            }}
                          >
                            {isAdmin && (
                              <IconButton
                                size="small"
                                onClick={() => handleDownload(item.data)}
                                sx={{
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  color: '#FFF',
                                  '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                                }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            )}
                            {canDeleteMedia(item.data) && (
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteMedia(item.data)}
                                disabled={deletingMedia === item.data._id}
                                sx={{
                                  bgcolor: 'rgba(211, 47, 47, 0.8)',
                                  color: '#FFF',
                                  '&:hover': { bgcolor: 'rgba(211, 47, 47, 1)' },
                                  '&:disabled': { bgcolor: 'rgba(211, 47, 47, 0.5)' },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {item.data.type === 'AUDIO' && (
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <MicIcon sx={{ color: '#FFB300', fontSize: 32 }} />
                          <audio
                            src={getMediaUrl(item.data.url)}
                            controls
                            style={{ flex: 1, width: '100%' }}
                          />
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {isAdmin && (
                              <IconButton
                                size="small"
                                onClick={() => handleDownload(item.data)}
                                sx={{
                                  bgcolor: '#FFD600',
                                  color: '#000',
                                  '&:hover': { bgcolor: '#FFB300' },
                                }}
                              >
                                <DownloadIcon />
                              </IconButton>
                            )}
                            {canDeleteMedia(item.data) && (
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteMedia(item.data)}
                                disabled={deletingMedia === item.data._id}
                                sx={{
                                  bgcolor: 'rgba(211, 47, 47, 0.8)',
                                  color: '#FFF',
                                  '&:hover': { bgcolor: 'rgba(211, 47, 47, 1)' },
                                  '&:disabled': { bgcolor: 'rgba(211, 47, 47, 0.5)' },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                        {item.data.transcripcion && (
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: '#FFFFFF',
                              borderRadius: 2,
                              border: '1px solid rgba(0, 191, 165, 0.2)',
                              maxHeight: '150px',
                              overflowY: 'auto',
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', mb: 1, display: 'block' }}>
                              Transcripción:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#555' }}>
                              {item.data.transcripcion}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                 ) : (
                   <Box>
                     {/* Mostrar media asociado si existe */}
                     {item.associatedMedia && (
                       <Box sx={{ mb: 2 }}>
                         {item.associatedMedia.type === 'FOTO' && (
                           <Box
                             onClick={() => setSelectedImage(item.associatedMedia)}
                             sx={{
                               position: 'relative',
                               cursor: 'pointer',
                               borderRadius: 2,
                               overflow: 'hidden',
                               '&:hover': {
                                 transform: 'scale(1.02)',
                               },
                               transition: 'transform 0.2s ease',
                             }}
                           >
                             <img
                               src={getMediaUrl(item.associatedMedia.url)}
                               alt="Foto"
                               style={{
                                 width: '100%',
                                 maxHeight: '200px',
                                 objectFit: 'cover',
                                 display: 'block',
                               }}
                             />
                             <Box
                               sx={{
                                 position: 'absolute',
                                 top: 8,
                                 right: 8,
                                 display: 'flex',
                                 gap: 0.5,
                               }}
                             >
                               {isAdmin && (
                                 <IconButton
                                   size="small"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleDownload(item.associatedMedia);
                                   }}
                                   sx={{
                                     bgcolor: 'rgba(0,0,0,0.6)',
                                     color: '#FFF',
                                     '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                                   }}
                                 >
                                   <DownloadIcon fontSize="small" />
                                 </IconButton>
                               )}
                               {canDeleteMedia(item.associatedMedia) && (
                                 <IconButton
                                   size="small"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleDeleteMedia(item.associatedMedia);
                                   }}
                                   disabled={deletingMedia === item.associatedMedia._id}
                                   sx={{
                                     bgcolor: 'rgba(211, 47, 47, 0.8)',
                                     color: '#FFF',
                                     '&:hover': { bgcolor: 'rgba(211, 47, 47, 1)' },
                                     '&:disabled': { bgcolor: 'rgba(211, 47, 47, 0.5)' },
                                   }}
                                 >
                                   <DeleteIcon fontSize="small" />
                                 </IconButton>
                               )}
                             </Box>
                           </Box>
                         )}
                         {item.associatedMedia.type === 'VIDEO' && (
                           <Box sx={{ position: 'relative' }}>
                             <video
                               src={getMediaUrl(item.associatedMedia.url)}
                               controls
                               style={{
                                 width: '100%',
                                 maxHeight: '300px',
                                 borderRadius: 8,
                                 display: 'block',
                               }}
                             />
                             <Box
                               sx={{
                                 position: 'absolute',
                                 top: 8,
                                 right: 8,
                                 display: 'flex',
                                 gap: 0.5,
                               }}
                             >
                               {isAdmin && (
                                 <IconButton
                                   size="small"
                                   onClick={() => handleDownload(item.associatedMedia)}
                                   sx={{
                                     bgcolor: 'rgba(0,0,0,0.7)',
                                     color: '#FFF',
                                     '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                                   }}
                                 >
                                   <DownloadIcon fontSize="small" />
                                 </IconButton>
                               )}
                               {canDeleteMedia(item.associatedMedia) && (
                                 <IconButton
                                   size="small"
                                   onClick={() => handleDeleteMedia(item.associatedMedia)}
                                   disabled={deletingMedia === item.associatedMedia._id}
                                   sx={{
                                     bgcolor: 'rgba(211, 47, 47, 0.8)',
                                     color: '#FFF',
                                     '&:hover': { bgcolor: 'rgba(211, 47, 47, 1)' },
                                     '&:disabled': { bgcolor: 'rgba(211, 47, 47, 0.5)' },
                                   }}
                                 >
                                   <DeleteIcon fontSize="small" />
                                 </IconButton>
                               )}
                             </Box>
                           </Box>
                         )}
                         {item.associatedMedia.type === 'AUDIO' && (
                           <Box>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                               <MicIcon sx={{ color: '#FFB300', fontSize: 24 }} />
                               <audio
                                 src={getMediaUrl(item.associatedMedia.url)}
                                 controls
                                 style={{ flex: 1, width: '100%' }}
                               />
                               <Box sx={{ display: 'flex', gap: 0.5 }}>
                                 {isAdmin && (
                                   <IconButton
                                     size="small"
                                     onClick={() => handleDownload(item.associatedMedia)}
                                     sx={{
                                       bgcolor: '#FFD600',
                                       color: '#000',
                                       '&:hover': { bgcolor: '#FFB300' },
                                     }}
                                   >
                                     <DownloadIcon />
                                   </IconButton>
                                 )}
                                 {canDeleteMedia(item.associatedMedia) && (
                                   <IconButton
                                     size="small"
                                     onClick={() => handleDeleteMedia(item.associatedMedia)}
                                     disabled={deletingMedia === item.associatedMedia._id}
                                     sx={{
                                       bgcolor: 'rgba(211, 47, 47, 0.8)',
                                       color: '#FFF',
                                       '&:hover': { bgcolor: 'rgba(211, 47, 47, 1)' },
                                       '&:disabled': { bgcolor: 'rgba(211, 47, 47, 0.5)' },
                                     }}
                                   >
                                     <DeleteIcon fontSize="small" />
                                   </IconButton>
                                 )}
                               </Box>
                             </Box>
                             {item.associatedMedia.transcripcion && (
                               <Box
                                 sx={{
                                   p: 1.5,
                                   bgcolor: '#FFFFFF',
                                   borderRadius: 2,
                                   border: '1px solid rgba(0, 191, 165, 0.2)',
                                   maxHeight: '120px',
                                   overflowY: 'auto',
                                 }}
                               >
                                 <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', mb: 0.5, display: 'block' }}>
                                   Transcripción:
                                 </Typography>
                                 <Typography variant="body2" sx={{ color: '#555', fontSize: '0.85rem' }}>
                                   {item.associatedMedia.transcripcion}
                                 </Typography>
                               </Box>
                             )}
                           </Box>
                         )}
                       </Box>
                     )}
                     {item.data.oldStatus && item.data.newStatus && (
                       <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                         <Chip
                           label={item.data.oldStatus}
                           size="small"
                           sx={{
                             bgcolor: '#FFE082',
                             color: '#000',
                             fontWeight: 600,
                           }}
                         />
                         <Typography variant="body2" sx={{ color: '#666' }}>→</Typography>
                         <Chip
                           label={item.data.newStatus}
                           size="small"
                           sx={{
                             bgcolor: '#FFD600',
                             color: '#000',
                             fontWeight: 600,
                           }}
                         />
                       </Box>
                     )}
                     {editingEntry === item.id ? (
                       <Box>
                         <TextField
                           fullWidth
                           multiline
                           rows={3}
                           value={editComment}
                           onChange={(e) => setEditComment(e.target.value)}
                           sx={{ mb: 2 }}
                         />
                         <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                           <Button
                             size="small"
                             startIcon={<CancelIcon />}
                             onClick={() => {
                               setEditingEntry(null);
                               setEditComment('');
                             }}
                           >
                             Cancelar
                           </Button>
                           <Button
                             size="small"
                             variant="contained"
                             startIcon={<SaveIcon />}
                             onClick={async () => {
                               try {
                                 await historyAPI.update(reportId, item.id, { comment: editComment });
                                 setEditingEntry(null);
                                 setEditComment('');
                                 onUpdate?.();
                               } catch (err) {
                                 console.error('Error actualizando comentario:', err);
                                 alert('Error al actualizar el comentario');
                               }
                             }}
                             sx={{
                               bgcolor: '#FFD600',
                               color: '#000',
                               '&:hover': { bgcolor: '#FFB300' },
                             }}
                           >
                             Guardar
                           </Button>
                         </Box>
                       </Box>
                     ) : (
                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                         <Typography
                           variant="body2"
                           sx={{
                             color: '#555',
                             lineHeight: 1.6,
                             whiteSpace: 'pre-wrap',
                             flex: 1,
                           }}
                         >
                           {item.data.comment}
                         </Typography>
                         {isAssignedTechnician && 
                          item.type === 'history' && 
                          (item.data.userId?.toString() === currentUserId || 
                           (typeof item.data.userId === 'object' && item.data.userId?._id?.toString() === currentUserId)) && 
                          item.data.type === 'ACTUALIZACION_TECNICO' && (
                           <IconButton
                             size="small"
                             onClick={() => {
                               setEditingEntry(item.id);
                               setEditComment(item.data.comment);
                             }}
                             sx={{
                               color: '#FFB300',
                               ml: 1,
                               '&:hover': { bgcolor: 'rgba(255, 179, 0, 0.1)' },
                             }}
                           >
                             <EditIcon fontSize="small" />
                           </IconButton>
                         )}
                       </Box>
                     )}
                   </Box>
                 )}
              </Paper>
            </Box>
            );
          })}
        </Box>
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
                  Subido por: {selectedImage.uploadedByUser?.fullName || selectedImage.uploadedByUser?.username || 'Desconocido'}
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

export default ReportTimeline;

