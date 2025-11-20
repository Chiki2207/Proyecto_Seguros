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

    // Si es TECNICO, verificar que esté asignado al reporte
    if (req.user.role === 'TECNICO') {
      const isAssigned = report.technicianIds?.some(
        (techId) => techId.toString() === req.user.userId
      );
      if (!isAssigned) {
        return res.status(403).json({ error: 'No tienes permiso para subir evidencias a este reporte' });
      }
    }

    // Generar nombre de archivo único con userId y username
    const userId = req.user.userId;
    const username = req.user.username || userId;
    const fileExt = path.extname(req.file.filename);
    const baseName = req.file.filename.replace(fileExt, '');
    
    let newFilename = `${baseName}-${username}${fileExt}`;
    
    // Renombrar archivo para incluir username
    const oldPath = req.file.path;
    let newPath = path.join(path.dirname(oldPath), newFilename);
    
    // Verificar si el archivo ya existe
    let finalFilename = newFilename;
    let finalPath = newPath;
    if (fs.existsSync(newPath)) {
      let counter = 1;
      while (fs.existsSync(finalPath) && counter < 1000) {
        const nameWithoutExt = baseName;
        finalFilename = `${nameWithoutExt}-${username}-${counter}${fileExt}`;
        finalPath = path.join(path.dirname(oldPath), finalFilename);
        counter++;
      }
      fs.renameSync(oldPath, finalPath);
      newFilename = finalFilename;
      newPath = finalPath;
    } else {
      fs.renameSync(oldPath, newPath);
    }

    // Generar URL relativa
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
        const transcription = await transcribeAudio(newPath);
        newMedia.transcripcion = transcription;
      } catch (error) {
        console.error('Error transcribiendo audio:', error);
        newMedia.transcripcion = 'Error al transcribir audio';
      }
    }

    const result = await mediaCollection.insertOne(newMedia);

    // Crear entrada en el historial solo si no se especifica skipHistory
    const skipHistory = req.body?.skipHistory === 'true' || req.body?.skipHistory === true;
    
    if (!skipHistory) {
      const historyCollection = db.collection(Collections.REPORT_HISTORY);
      const comment = req.body?.comment || '';
      
      const historyEntry = {
        reportId: new ObjectId(id),
        userId: new ObjectId(userId),
        createdAt: new Date(),
        type: 'ACTUALIZACION_TECNICO',
        comment: comment || `${type === 'FOTO' ? 'Foto' : type === 'VIDEO' ? 'Video' : 'Audio'} subido${comment ? `: ${comment}` : ''}`,
        mediaId: result.insertedId,
      };

      await historyCollection.insertOne(historyEntry);
    }

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

/**
 * DELETE /api/reports/:id/media/:mediaId
 * Eliminar archivo multimedia (solo el usuario que lo subió o ADMIN)
 */
router.delete('/:id/media/:mediaId', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id, mediaId } = req.params;

    const db = getDB();
    const reportsCollection = db.collection(Collections.REPORTS);
    const mediaCollection = db.collection(Collections.REPORT_MEDIA);
    const historyCollection = db.collection(Collections.REPORT_HISTORY);

    // Verificar que el reporte existe
    const report = await reportsCollection.findOne({ _id: new ObjectId(id) });
    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Obtener el media
    const media = await mediaCollection.findOne({ _id: new ObjectId(mediaId) });
    if (!media) {
      return res.status(404).json({ error: 'Media no encontrado' });
    }

    // Verificar permisos: solo el usuario que lo subió o ADMIN puede eliminarlo
    const isOwner = media.uploadedBy.toString() === req.user.userId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este archivo' });
    }

    // Eliminar el archivo físico
    try {
      const fileUrl = media.url;
      let filePath;
      
      if (fileUrl.startsWith('/media/images/')) {
        const filename = fileUrl.replace('/media/images/', '');
        filePath = path.join(process.cwd(), 'public', 'media', 'images', filename);
      } else if (fileUrl.startsWith('/media/videos/')) {
        const filename = fileUrl.replace('/media/videos/', '');
        filePath = path.join(process.cwd(), 'public', 'media', 'videos', filename);
      } else if (fileUrl.startsWith('/media/audios/')) {
        const filename = fileUrl.replace('/media/audios/', '');
        filePath = path.join(process.cwd(), 'public', 'media', 'audios', filename);
      } else {
        const filename = fileUrl.replace('/media/', '');
        filePath = path.join(process.cwd(), 'public', 'media', filename);
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('Error eliminando archivo físico:', fileError);
      // Continuar aunque falle la eliminación del archivo
    }

    // Eliminar referencias en el historial
    await historyCollection.updateMany(
      { mediaId: new ObjectId(mediaId) },
      { $unset: { mediaId: '' } }
    );

    // Eliminar el documento de media
    await mediaCollection.deleteOne({ _id: new ObjectId(mediaId) });

    res.status(200).json({ message: 'Media eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando media:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
