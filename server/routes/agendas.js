import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { Collections } from '../models/index.js';
import { authenticateToken, requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/agendas
 * Listar agendas con filtros opcionales
 * Query params: ?fecha=YYYY-MM-DD&fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
 */
router.get('/', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  try {
    const { fecha, fechaInicio, fechaFin } = req.query;

    const db = getDB();
    const agendasCollection = db.collection(Collections.AGENDAS);

    const filter = {};

    // Filtrar por fecha específica (día)
    if (fecha) {
      // Parsear la fecha en formato YYYY-MM-DD y crear fecha en hora local
      const [year, month, day] = fecha.split('-').map(Number);
      const fechaInicio = new Date(year, month - 1, day, 0, 0, 0, 0);
      const fechaFin = new Date(year, month - 1, day, 23, 59, 59, 999);
      filter.fechaHora = { $gte: fechaInicio, $lte: fechaFin };
    }
    // Filtrar por rango de fechas (semana/mes)
    else if (fechaInicio && fechaFin) {
      // Parsear fechas en formato YYYY-MM-DD y crear fechas en hora local
      const [yearInicio, monthInicio, dayInicio] = fechaInicio.split('-').map(Number);
      const [yearFin, monthFin, dayFin] = fechaFin.split('-').map(Number);
      const inicio = new Date(yearInicio, monthInicio - 1, dayInicio, 0, 0, 0, 0);
      const fin = new Date(yearFin, monthFin - 1, dayFin, 23, 59, 59, 999);
      filter.fechaHora = { $gte: inicio, $lte: fin };
    }

    const agendas = await agendasCollection
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: Collections.USERS,
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdByUser',
          },
        },
        {
          $unwind: { path: '$createdByUser', preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            'createdByUser._id': 1,
            'createdByUser.fullName': 1,
            'createdByUser.username': 1,
            fechaHora: 1,
            titulo: 1,
            descripcion: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { fechaHora: 1 } },
      ])
      .toArray();

    res.json(agendas);
  } catch (error) {
    console.error('Error listando agendas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/agendas/:id
 * Obtener una agenda por ID
 */
router.get('/:id', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const db = getDB();
    const agendasCollection = db.collection(Collections.AGENDAS);

    const agenda = await agendasCollection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: Collections.USERS,
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdByUser',
          },
        },
        {
          $unwind: { path: '$createdByUser', preserveNullAndEmptyArrays: true },
        },
      ])
      .toArray();

    if (agenda.length === 0) {
      return res.status(404).json({ error: 'Agenda no encontrada' });
    }

    res.json(agenda[0]);
  } catch (error) {
    console.error('Error obteniendo agenda:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/agendas
 * Crear nueva agenda
 * Body: { fechaHora, titulo, descripcion }
 */
router.post('/', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  try {
    const { fechaHora, titulo, descripcion } = req.body;

    if (!fechaHora || !titulo) {
      return res.status(400).json({ error: 'fechaHora y titulo son requeridos' });
    }

    const db = getDB();
    const agendasCollection = db.collection(Collections.AGENDAS);

    // Parsear fechaHora que viene en formato ISO (YYYY-MM-DDTHH:mm)
    // y crear fecha en hora local para evitar problemas de zona horaria
    let fechaHoraDate;
    if (fechaHora.includes('T')) {
      const [datePart, timePart] = fechaHora.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      fechaHoraDate = new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
    } else {
      fechaHoraDate = new Date(fechaHora);
    }

    const newAgenda = {
      fechaHora: fechaHoraDate,
      titulo: titulo.trim(),
      descripcion: (descripcion || '').trim(),
      createdBy: new ObjectId(req.user.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await agendasCollection.insertOne(newAgenda);

    // Obtener la agenda creada con lookups
    const createdAgenda = await agendasCollection
      .aggregate([
        { $match: { _id: result.insertedId } },
        {
          $lookup: {
            from: Collections.USERS,
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdByUser',
          },
        },
        {
          $unwind: { path: '$createdByUser', preserveNullAndEmptyArrays: true },
        },
      ])
      .toArray();

    res.status(201).json({
      message: 'Agenda creada exitosamente',
      agenda: createdAgenda[0],
    });
  } catch (error) {
    console.error('Error creando agenda:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PATCH /api/agendas/:id
 * Actualizar agenda
 * Body: { fechaHora?, titulo?, descripcion? }
 */
router.patch('/:id', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaHora, titulo, descripcion } = req.body;

    const db = getDB();
    const agendasCollection = db.collection(Collections.AGENDAS);

    // Verificar que la agenda existe
    const agenda = await agendasCollection.findOne({ _id: new ObjectId(id) });
    if (!agenda) {
      return res.status(404).json({ error: 'Agenda no encontrada' });
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (fechaHora !== undefined) {
      // Parsear fechaHora que viene en formato ISO (YYYY-MM-DDTHH:mm)
      // y crear fecha en hora local para evitar problemas de zona horaria
      let fechaHoraDate;
      if (fechaHora.includes('T')) {
        const [datePart, timePart] = fechaHora.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        fechaHoraDate = new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
      } else {
        fechaHoraDate = new Date(fechaHora);
      }
      updateData.fechaHora = fechaHoraDate;
    }
    if (titulo !== undefined) updateData.titulo = titulo.trim();
    if (descripcion !== undefined) updateData.descripcion = descripcion.trim();

    await agendasCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Obtener la agenda actualizada con lookups
    const updatedAgenda = await agendasCollection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: Collections.USERS,
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdByUser',
          },
        },
        {
          $unwind: { path: '$createdByUser', preserveNullAndEmptyArrays: true },
        },
      ])
      .toArray();

    res.json({
      message: 'Agenda actualizada exitosamente',
      agenda: updatedAgenda[0],
    });
  } catch (error) {
    console.error('Error actualizando agenda:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/agendas/:id
 * Eliminar agenda
 */
router.delete('/:id', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const db = getDB();
    const agendasCollection = db.collection(Collections.AGENDAS);

    const result = await agendasCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Agenda no encontrada' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error eliminando agenda:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
