import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { Collections } from '../models/index.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/reports/:id/history
 * Agregar entrada al historial
 * Body: { type, comment, oldStatus?, newStatus? }
 */
router.post('/:id/history', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, comment, oldStatus, newStatus } = req.body;

    if (!type || !comment) {
      return res.status(400).json({ error: 'type y comment son requeridos' });
    }

    if (type !== 'CAMBIO_ESTADO' && type !== 'ACTUALIZACION_TECNICO' && type !== 'NOTA_ADMIN') {
      return res.status(400).json({ error: 'type debe ser CAMBIO_ESTADO, ACTUALIZACION_TECNICO o NOTA_ADMIN' });
    }

    const db = getDB();
    const reportsCollection = db.collection(Collections.REPORTS);
    const historyCollection = db.collection(Collections.REPORT_HISTORY);

    // Verificar que el reporte existe
    const report = await reportsCollection.findOne({ _id: new ObjectId(id) });
    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    const newHistory = {
      reportId: new ObjectId(id),
      userId: new ObjectId(req.user.userId),
      createdAt: new Date(),
      type,
      comment,
    };

    if (oldStatus) newHistory.oldStatus = oldStatus;
    if (newStatus) newHistory.newStatus = newStatus;
    if (req.body.mediaId) newHistory.mediaId = new ObjectId(req.body.mediaId);

    const result = await historyCollection.insertOne(newHistory);

    res.status(201).json({
      message: 'Entrada de historial agregada exitosamente',
      historyId: result.insertedId.toString(),
      history: { ...newHistory, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Error agregando historial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PATCH /api/reports/:id/history/:historyId
 * Actualizar entrada del historial (solo el usuario que la creó)
 * Body: { comment }
 */
router.patch('/:id/history/:historyId', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id, historyId } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'comment es requerido' });
    }

    const db = getDB();
    const reportsCollection = db.collection(Collections.REPORTS);
    const historyCollection = db.collection(Collections.REPORT_HISTORY);

    // Verificar que el reporte existe
    const report = await reportsCollection.findOne({ _id: new ObjectId(id) });
    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Verificar que la entrada del historial existe y pertenece al usuario actual
    const historyEntry = await historyCollection.findOne({ _id: new ObjectId(historyId) });
    if (!historyEntry) {
      return res.status(404).json({ error: 'Entrada de historial no encontrada' });
    }

    if (historyEntry.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Solo puedes editar tus propias entradas' });
    }

    // Solo se pueden editar entradas de tipo ACTUALIZACION_TECNICO
    if (historyEntry.type !== 'ACTUALIZACION_TECNICO') {
      return res.status(400).json({ error: 'Solo se pueden editar actualizaciones de técnico' });
    }

    // Actualizar el comentario
    await historyCollection.updateOne(
      { _id: new ObjectId(historyId) },
      { $set: { comment: comment.trim() } }
    );

    const updatedEntry = await historyCollection.findOne({ _id: new ObjectId(historyId) });

    res.json({
      message: 'Entrada de historial actualizada exitosamente',
      history: updatedEntry,
    });
  } catch (error) {
    console.error('Error actualizando historial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

