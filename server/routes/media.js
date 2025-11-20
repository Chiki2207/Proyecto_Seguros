import express from 'express';
import { ObjectId } from 'mongodb';
import path from 'path';
import fs from 'fs';
import { getDB } from '../db.js';
import { Collections } from '../models/index.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { upload, transcribeAudio } from '../middleware/upload.js';

const router = express.Router();

/**
 * POST /api/reports/:id/media
 * Subir archivo multimedia (foto, video o audio)
 * Form-data: file, type
 */
router.post('/:id/media', authenticateToken, requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    // El tipo debe venir en el body del form-data
    const type = req.body?.type?.toUpperCase();

    if (!type) {
      return res.status(400).json({ error: 'type es requerido en el form-data' });
    }

    if (type !== 'FOTO' && type !== 'VIDEO' && type !== 'AUDIO') {
      return res.status(400).json({ error: 'type debe ser FOTO, VIDEO o AUDIO' });
    }
    
    // Verificar que el archivo se guardó en la carpeta correcta según el tipo
    const filePath = req.file?.path || '';
    const expectedDir = type === 'FOTO' ? 'images' : type === 'VIDEO' ? 'videos' : 'audios';
    
    if (!filePath.includes(expectedDir)) {
      console.warn(`⚠️ Advertencia: Archivo tipo ${type} guardado en ruta incorrecta: ${filePath}`);
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Archivo no proporcionado' });
    }

    const db = getDB();
    const reportsCollection = db.collection(Collections.REPORTS);
    const mediaCollection = db.collection(Collections.REPORT_MEDIA);

    // Verificar que el reporte existe
    const report = await reportsCollection.findOne({ _id: new ObjectId(id) });
    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Generar nombre de archivo único con userId y username
    // Esto asegura que incluso si dos usuarios suben al mismo milisegundo,
    // los nombres serán diferentes
    const userId = req.user.userId;
    const username = req.user.username || userId; // Usar username si está disponible, sino userId
    const fileExt = path.extname(req.file.filename);
    const baseName = req.file.filename.replace(fileExt, '');
    
    // Formato final: tipo-timestamp-random1-random2-username.ext
    // Ejemplo: foto-1763543370428-463224350-123456-admin.jpg
    let newFilename = `${baseName}-${username}${fileExt}`;
    
    // Renombrar archivo para incluir username (más legible que userId)
    const oldPath = req.file.path;
    let newPath = path.join(path.dirname(oldPath), newFilename);
    
    // Verificar si el archivo ya existe (muy improbable pero por seguridad)
    let finalFilename = newFilename;
    let finalPath = newPath;
    if (fs.existsSync(newPath)) {
      // Si existe, agregar un contador adicional
      let counter = 1;
      while (fs.existsSync(finalPath) && counter < 1000) {
        const nameWithoutExt = baseName;
        finalFilename = `${nameWithoutExt}-${username}-${counter}${fileExt}`;
        finalPath = path.join(path.dirname(oldPath), finalFilename);
        counter++;
      }
      fs.renameSync(oldPath, finalPath);
      newFilename = finalFilename; // Actualizar para usar en la URL
      newPath = finalPath; // Actualizar newPath también
    } else {
      fs.renameSync(oldPath, newPath);
    }

    // Generar URL relativa (desde public/media, accesible desde el frontend)
    let fileUrl;
    if (type === 'FOTO') {
      fileUrl = `/media/images/${newFilename}`;
    } else if (type === 'VIDEO') {
      fileUrl = `/media/videos/${newFilename}`;
    } else if (type === 'AUDIO') {
      fileUrl = `/media/audios/${newFilename}`;
    } else {
      fileUrl = `/media/${newFilename}`;
    }

    const newMedia = {
      reportId: new ObjectId(id),
      type,
      url: fileUrl,
      uploadedBy: new ObjectId(userId),
      createdAt: new Date(),
    };

    // Si es audio, transcribir
    if (type === 'AUDIO') {
      try {
        // Usar newPath que ya tiene el path final correcto
        const transcription = await transcribeAudio(newPath);
        newMedia.transcripcion = transcription;
      } catch (error) {
        console.error('Error transcribiendo audio:', error);
        newMedia.transcripcion = 'Error al transcribir audio';
      }
    }

    const result = await mediaCollection.insertOne(newMedia);

    res.status(201).json({
      message: 'Media subido exitosamente',
      mediaId: result.insertedId.toString(),
      media: { ...newMedia, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Error subiendo media:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

