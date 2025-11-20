import React, { useRef, useState } from 'react';
import { Box, Button, Paper, Typography, CircularProgress } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import DeleteIcon from '@mui/icons-material/Delete';
import { mediaAPI } from '../../services/api';

function VideoCapture({ reportId, onUploadSuccess }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setPreview({ file, url: videoUrl });
    }
  };

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!preview?.file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', preview.file);
    formData.append('type', 'VIDEO');

    try {
      await mediaAPI.upload(reportId, formData);
      if (preview.url) {
        URL.revokeObjectURL(preview.url);
      }
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadSuccess?.();
    } catch (error) {
      console.error('Error subiendo video:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
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
        accept="video/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {!preview ? (
        <Button
          variant="contained"
          startIcon={<VideocamIcon />}
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
          Grabar Video
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
          <Box sx={{ mb: 2 }}>
            <video
              src={preview.url}
              controls
              style={{
                width: '100%',
                maxHeight: '300px',
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
              {uploading ? <CircularProgress size={20} /> : 'Subir Video'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default VideoCapture;

