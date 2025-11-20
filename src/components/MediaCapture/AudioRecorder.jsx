import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Paper, Typography, CircularProgress, LinearProgress, IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { mediaAPI } from '../../services/api';

function AudioRecorder({ reportId, onUploadSuccess }) {
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accediendo al micrófono:', error);
      alert('No se pudo acceder al micrófono. Por favor, permite el acceso.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleUpload = async () => {
    if (!recordedBlob) return;

    setUploading(true);
    setTranscribing(true);

    const formData = new FormData();
    formData.append('file', recordedBlob, 'audio.webm');
    formData.append('type', 'AUDIO');
    formData.append('skipHistory', 'true'); // El historial se creará desde el formulario unificado

    try {
      const result = await mediaAPI.upload(reportId, formData);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setRecordedBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      onUploadSuccess?.(result);
    } catch (error) {
      console.error('Error subiendo audio:', error);
    } finally {
      setUploading(false);
      setTranscribing(false);
    }
  };

  const handleCancel = () => {
    if (recording) {
      stopRecording();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setRecordedBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      {!recordedBlob ? (
        <Box>
          {!recording ? (
            <Button
              variant="contained"
              startIcon={<MicIcon />}
              onClick={startRecording}
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
              Grabar Audio
            </Button>
          ) : (
            <Paper
              sx={{
                p: 3,
                bgcolor: '#FFEBEE',
                border: '2px solid #F44336',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: '#F44336',
                  mx: 'auto',
                  mb: 2,
                  animation: 'pulse 1.5s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                  },
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {formatTime(recordingTime)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Grabando...
              </Typography>
              <Button
                variant="contained"
                startIcon={<StopIcon />}
                onClick={stopRecording}
                sx={{
                  bgcolor: '#F44336',
                  color: '#FFF',
                  '&:hover': { bgcolor: '#D32F2F' },
                }}
              >
                Detener
              </Button>
            </Paper>
          )}
        </Box>
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
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setPlaying(false)}
              style={{ width: '100%' }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <IconButton
                onClick={togglePlay}
                sx={{
                  bgcolor: '#FFD600',
                  color: '#000',
                  '&:hover': { bgcolor: '#FFB300' },
                }}
              >
                {playing ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <Typography variant="body1" sx={{ flex: 1 }}>
                {formatTime(recordingTime)}
              </Typography>
            </Box>
          </Box>

          {transcribing && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Guardando y transcribiendo...
              </Typography>
              <LinearProgress />
            </Box>
          )}

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
              {uploading ? <CircularProgress size={20} /> : 'Subir Audio'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default AudioRecorder;

