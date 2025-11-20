import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { Collections } from '../models/index.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/reports
 * Crear nuevo reporte
 * Body: { clientId, technicianIds, diagnosticoInicial, causa, acciones }
 */
router.post('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { clientId, technicianIds, diagnosticoInicial, causa, acciones } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId es requerido' });
    }

    const db = getDB();
    const clientsCollection = db.collection(Collections.CLIENTS);
    const reportsCollection = db.collection(Collections.REPORTS);

    // Verificar que el cliente existe
    const client = await clientsCollection.findOne({ _id: new ObjectId(clientId) });
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const newReport = {
      clientId: new ObjectId(clientId),
      createdBy: new ObjectId(req.user.userId),
      technicianIds: technicianIds ? technicianIds.map((id) => new ObjectId(id)) : [],
      diagnosticoInicial: diagnosticoInicial || '',
      causa: causa || '',
      acciones: acciones || '',
      estado: 'PENDIENTE',
      materialsUsed: [],
      servicesBilled: [],
      billedStatus: 'NO_FACTURADO',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await reportsCollection.insertOne(newReport);

    // Crear entrada inicial en el historial
    const historyCollection = db.collection(Collections.REPORT_HISTORY);
    await historyCollection.insertOne({
      reportId: result.insertedId,
      userId: new ObjectId(req.user.userId),
      createdAt: new Date(),
      type: 'CAMBIO_ESTADO',
      newStatus: 'PENDIENTE',
      comment: 'Reporte creado',
    });

    res.status(201).json({
      message: 'Reporte creado exitosamente',
      reportId: result.insertedId.toString(),
      report: { ...newReport, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Error creando reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/reports
 * Listar reportes con filtros opcionales
 * Query params: ?clientId=...&estado=...&technicianId=...
 */
router.get('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { clientId, estado, technicianId } = req.query;

    const db = getDB();
    const reportsCollection = db.collection(Collections.REPORTS);

    // Construir filtro
    const filter = {};

    if (clientId) {
      filter.clientId = new ObjectId(clientId);
    }

    if (estado) {
      filter.estado = estado;
    }

    if (technicianId) {
      filter.technicianIds = new ObjectId(technicianId);
    }

    // Si es TECNICO, solo mostrar reportes asignados
    if (req.user.role === 'TECNICO') {
      filter.technicianIds = new ObjectId(req.user.userId);
    }

    // Hacer lookup para obtener datos del cliente y técnicos
    const reports = await reportsCollection
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: Collections.CLIENTS,
            localField: 'clientId',
            foreignField: '_id',
            as: 'client',
          },
        },
        {
          $lookup: {
            from: Collections.USERS,
            localField: 'technicianIds',
            foreignField: '_id',
            as: 'technicians',
          },
        },
        {
          $project: {
            'technicians.passwordHash': 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    // Aplanar el array de clientes
    reports.forEach((report) => {
      report.client = report.client[0] || null;
    });

    res.json(reports);
  } catch (error) {
    console.error('Error listando reportes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/reports/:id
 * Obtener un reporte completo con $lookup a clients, users, media, history
 */
router.get('/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const db = getDB();
    const reportsCollection = db.collection(Collections.REPORTS);

    const report = await reportsCollection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: Collections.CLIENTS,
            localField: 'clientId',
            foreignField: '_id',
            as: 'client',
          },
        },
        {
          $lookup: {
            from: Collections.USERS,
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdByUser',
          },
        },
        {
          $lookup: {
            from: Collections.USERS,
            localField: 'technicianIds',
            foreignField: '_id',
            as: 'technicians',
          },
        },
        {
          $lookup: {
            from: Collections.REPORT_MEDIA,
            localField: '_id',
            foreignField: 'reportId',
            as: 'media',
          },
        },
        {
          $lookup: {
            from: Collections.USERS,
            localField: 'media.uploadedBy',
            foreignField: '_id',
            as: 'mediaUploaders',
          },
        },
        {
          $lookup: {
            from: Collections.REPORT_HISTORY,
            localField: '_id',
            foreignField: 'reportId',
            as: 'history',
          },
        },
        {
          $project: {
            'client.passwordHash': 0,
            'createdByUser.passwordHash': 0,
            'technicians.passwordHash': 0,
          },
        },
      ])
      .toArray();

    if (!report || report.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    const reportData = report[0];
    reportData.client = reportData.client[0] || null;
    reportData.createdByUser = reportData.createdByUser[0] || null;

    // Ordenar historial por fecha
    reportData.history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(reportData);
  } catch (error) {
    console.error('Error obteniendo reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PATCH /api/reports/:id
 * Actualizar reporte (estado, diagnóstico, acciones, materiales, servicios)
 */
router.patch('/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      estado,
      diagnosticoInicial,
      causa,
      acciones,
      materialsUsed,
      servicesBilled,
      billedStatus,
      technicianIds,
    } = req.body;

    const db = getDB();
    const reportsCollection = db.collection(Collections.REPORTS);
    const historyCollection = db.collection(Collections.REPORT_HISTORY);

    // Obtener reporte actual para comparar cambios
    const currentReport = await reportsCollection.findOne({ _id: new ObjectId(id) });

    if (!currentReport) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Construir objeto de actualización
    const update = { updatedAt: new Date() };

    if (estado !== undefined) update.estado = estado;
    if (diagnosticoInicial !== undefined) update.diagnosticoInicial = diagnosticoInicial;
    if (causa !== undefined) update.causa = causa;
    if (acciones !== undefined) update.acciones = acciones;
    if (materialsUsed !== undefined) update.materialsUsed = materialsUsed;
    if (servicesBilled !== undefined) update.servicesBilled = servicesBilled;
    if (billedStatus !== undefined) update.billedStatus = billedStatus;
    if (technicianIds !== undefined) {
      update.technicianIds = technicianIds.map((tid) => new ObjectId(tid));
    }

    await reportsCollection.updateOne({ _id: new ObjectId(id) }, { $set: update });

    // Registrar cambios en el historial
    const historyEntries = [];

    if (estado && estado !== currentReport.estado) {
      historyEntries.push({
        reportId: new ObjectId(id),
        userId: new ObjectId(req.user.userId),
        createdAt: new Date(),
        type: 'CAMBIO_ESTADO',
        oldStatus: currentReport.estado,
        newStatus: estado,
        comment: `Estado cambiado de ${currentReport.estado} a ${estado}`,
      });
    }

    if (technicianIds && JSON.stringify(technicianIds) !== JSON.stringify(currentReport.technicianIds)) {
      historyEntries.push({
        reportId: new ObjectId(id),
        userId: new ObjectId(req.user.userId),
        createdAt: new Date(),
        type: 'ACTUALIZACION_TECNICO',
        comment: 'Técnicos actualizados',
      });
    }

    if (req.body.comment && req.user.role === 'ADMIN') {
      historyEntries.push({
        reportId: new ObjectId(id),
        userId: new ObjectId(req.user.userId),
        createdAt: new Date(),
        type: 'NOTA_ADMIN',
        comment: req.body.comment,
      });
    }

    if (historyEntries.length > 0) {
      await historyCollection.insertMany(historyEntries);
    }

    res.json({ message: 'Reporte actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

