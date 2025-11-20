import React, { useRef, useState } from 'react';
import { Box, Button, IconButton, Paper, Typography, CircularProgress } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import { mediaAPI } from '../../services/api';

function PhotoCapture({ reportId, onUploadSuccess }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files[0]) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);
    formData.append('type', 'FOTO');
    formData.append('skipHistory', 'true'); // El historial se creará desde el formulario unificado

    try {
      const result = await mediaAPI.upload(reportId, formData);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadSuccess?.(result);
    } catch (error) {
      console.error('Error subiendo foto:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {!preview ? (
        <Button
          variant="contained"
          startIcon={<CameraAltIcon />}
          onClick={handleCapture}
          fullWidth
          sx={{
            bgcolor: '#FFD600',
            color: '#000',
            fontWeight: 600,
            py: 1.5,
            fontSize: '1rem',
            '&:hover': { bgcolor: '#FFB300' },
          }}
        >
          Tomar Foto
        </Button>
      ) : (
        <Paper
          sx={{
            p: 2,
            bgcolor: '#FFF8E1',
            border: '1px solid #FFD600',
            borderRadius: 2,
          }}
        >
          <Box sx={{ position: 'relative', mb: 2 }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
                borderRadius: 8,
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleCancel}
              disabled={uploading}
              sx={{ flex: 1 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading}
              sx={{
                flex: 1,
                bgcolor: '#FFD600',
                color: '#000',
                '&:hover': { bgcolor: '#FFB300' },
              }}
            >
              {uploading ? <CircularProgress size={20} /> : 'Subir Foto'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default PhotoCapture;

