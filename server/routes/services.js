import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { Collections } from '../models/index.js';
import { authenticateToken, requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/services
 * Listar todos los servicios (solo ADMIN)
 */
router.get('/', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const servicesCollection = db.collection(Collections.SERVICES);

    const services = await servicesCollection
      .find({})
      .sort({ name: 1 })
      .toArray();

    res.json(services);
  } catch (error) {
    console.error('Error listando servicios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/services/active
 * Listar solo servicios activos (para usar en selectores)
 */
router.get('/active', authenticateToken, requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const servicesCollection = db.collection(Collections.SERVICES);

    const services = await servicesCollection
      .find({ active: true })
      .sort({ name: 1 })
      .toArray();

    res.json(services);
  } catch (error) {
    console.error('Error listando servicios activos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/services/:id
 * Obtener un servicio por ID
 */
router.get('/:id', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const db = getDB();
    const servicesCollection = db.collection(Collections.SERVICES);

    const service = await servicesCollection.findOne({ _id: new ObjectId(id) });

    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json(service);
  } catch (error) {
    console.error('Error obteniendo servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/services
 * Crear nuevo servicio (solo ADMIN)
 */
router.post('/', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name es requerido' });
    }

    const db = getDB();
    const servicesCollection = db.collection(Collections.SERVICES);

    // Verificar que no exista un servicio con el mismo nombre
    const existing = await servicesCollection.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un servicio con ese nombre' });
    }

    const newService = {
      name: name.trim(),
      description: description || '',
      category: category || 'GENERAL',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await servicesCollection.insertOne(newService);

    res.status(201).json({
      message: 'Servicio creado exitosamente',
      serviceId: result.insertedId.toString(),
      service: { ...newService, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Error creando servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PATCH /api/services/:id
 * Actualizar servicio (solo ADMIN)
 */
router.patch('/:id', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, active } = req.body;

    const db = getDB();
    const servicesCollection = db.collection(Collections.SERVICES);

    // Verificar que el servicio existe
    const service = await servicesCollection.findOne({ _id: new ObjectId(id) });
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
    if (name && name.trim() !== service.name) {
      const existing = await servicesCollection.findOne({ 
        name: name.trim(),
        _id: { $ne: new ObjectId(id) }
      });
      if (existing) {
        return res.status(400).json({ error: 'Ya existe un servicio con ese nombre' });
      }
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (active !== undefined) updateData.active = active;

    await servicesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedService = await servicesCollection.findOne({ _id: new ObjectId(id) });

    res.json({
      message: 'Servicio actualizado exitosamente',
      service: updatedService,
    });
  } catch (error) {
    console.error('Error actualizando servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/services/:id
 * Eliminar servicio (solo ADMIN)
 * Nota: No se puede eliminar si está siendo usado en listas de precios
 */
router.delete('/:id', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const db = getDB();
    const servicesCollection = db.collection(Collections.SERVICES);
    const pricesCollection = db.collection(Collections.PRICE_LISTS);

    // Verificar que el servicio existe
    const service = await servicesCollection.findOne({ _id: new ObjectId(id) });
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Verificar si está siendo usado en listas de precios
    const pricesUsingService = await pricesCollection.countDocuments({
      serviceId: new ObjectId(id),
    });

    if (pricesUsingService > 0) {
      return res.status(400).json({
        error: `No se puede eliminar el servicio porque está siendo usado en ${pricesUsingService} lista(s) de precios`,
      });
    }

    await servicesCollection.deleteOne({ _id: new ObjectId(id) });

    res.json({ message: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

