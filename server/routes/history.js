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

export default router;

