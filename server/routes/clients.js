import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { Collections } from '../models/index.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/clients
 * Listar todos los clientes
 */
router.get('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const clientsCollection = db.collection(Collections.CLIENTS);

    const clients = await clientsCollection.find({}).sort({ createdAt: -1 }).toArray();

    res.json(clients);
  } catch (error) {
    console.error('Error listando clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/clients
 * Crear nuevo cliente
 * Body: { type, name, codigoAsistencia?, codigoInterno, contacto, direccion }
 */
router.post('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { type, name, codigoAsistencia, codigoInterno, contacto, direccion } = req.body;

    if (!type || !name || !codigoInterno || !contacto || !direccion) {
      return res.status(400).json({ error: 'Campos requeridos: type, name, codigoInterno, contacto, direccion' });
    }

    if (type !== 'ASEGURADORA' && type !== 'PERSONA') {
      return res.status(400).json({ error: 'Type debe ser ASEGURADORA o PERSONA' });
    }

    if (type === 'ASEGURADORA' && !codigoAsistencia) {
      return res.status(400).json({ error: 'codigoAsistencia es requerido para ASEGURADORA' });
    }

    const db = getDB();
    const clientsCollection = db.collection(Collections.CLIENTS);

    // Verificar si el codigoInterno ya existe
    const existingClient = await clientsCollection.findOne({ codigoInterno });
    if (existingClient) {
      return res.status(400).json({ error: 'El código interno ya está en uso' });
    }

    const newClient = {
      type,
      name,
      codigoInterno,
      contacto,
      direccion,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (codigoAsistencia) {
      newClient.codigoAsistencia = codigoAsistencia;
    }

    const result = await clientsCollection.insertOne(newClient);

    res.status(201).json({
      message: 'Cliente creado exitosamente',
      clientId: result.insertedId.toString(),
      client: { ...newClient, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/clients/:id
 * Obtener un cliente por ID
 */
router.get('/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const db = getDB();
    const clientsCollection = db.collection(Collections.CLIENTS);

    const client = await clientsCollection.findOne({ _id: new ObjectId(id) });

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

