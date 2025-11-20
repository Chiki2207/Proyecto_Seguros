import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { Collections } from '../models/index.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/clients/:clientId/prices
 * Listar lista de precios de un cliente
 */
router.get('/:clientId/prices', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { clientId } = req.params;

    const db = getDB();
    const pricesCollection = db.collection(Collections.PRICE_LISTS);

    const prices = await pricesCollection
      .find({ clientId: new ObjectId(clientId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(prices);
  } catch (error) {
    console.error('Error listando precios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/clients/:clientId/prices
 * Crear ítem en la lista de precios
 * Body: { serviceId, description, price, accessories, notes }
 */
router.post('/:clientId/prices', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { serviceId, description, price, accessories, notes } = req.body;

    if (!serviceId || price === undefined) {
      return res.status(400).json({ error: 'serviceId y price son requeridos' });
    }

    const db = getDB();
    const clientsCollection = db.collection(Collections.CLIENTS);
    const servicesCollection = db.collection(Collections.SERVICES);
    const pricesCollection = db.collection(Collections.PRICE_LISTS);

    // Verificar que el cliente existe
    const client = await clientsCollection.findOne({ _id: new ObjectId(clientId) });
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Verificar que el servicio existe y obtener su información
    const service = await servicesCollection.findOne({ _id: new ObjectId(serviceId) });
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    if (!service.active) {
      return res.status(400).json({ error: 'El servicio seleccionado no está activo' });
    }

    const newPriceItem = {
      clientId: new ObjectId(clientId),
      serviceId: new ObjectId(serviceId),
      serviceName: service.name, // Denormalizado para búsqueda rápida
      description: description || service.description || '',
      price: Number(price),
      accessories: accessories || '',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await pricesCollection.insertOne(newPriceItem);

    res.status(201).json({
      message: 'Ítem de precio creado exitosamente',
      priceItemId: result.insertedId.toString(),
      priceItem: { ...newPriceItem, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Error creando ítem de precio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PATCH /api/clients/:clientId/prices/:priceId
 * Actualizar ítem de precio
 */
router.patch('/:clientId/prices/:priceId', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { clientId, priceId } = req.params;
    const { price, description, accessories, notes } = req.body;

    const db = getDB();
    const pricesCollection = db.collection(Collections.PRICE_LISTS);

    const updateData = {
      updatedAt: new Date(),
    };

    if (price !== undefined) updateData.price = Number(price);
    if (description !== undefined) updateData.description = description;
    if (accessories !== undefined) updateData.accessories = accessories;
    if (notes !== undefined) updateData.notes = notes;

    const result = await pricesCollection.updateOne(
      { _id: new ObjectId(priceId), clientId: new ObjectId(clientId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Ítem de precio no encontrado' });
    }

    const updatedPrice = await pricesCollection.findOne({ _id: new ObjectId(priceId) });

    res.json({
      message: 'Ítem de precio actualizado exitosamente',
      priceItem: updatedPrice,
    });
  } catch (error) {
    console.error('Error actualizando ítem de precio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/clients/:clientId/prices/:priceId
 * Eliminar ítem de precio
 */
router.delete('/:clientId/prices/:priceId', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { clientId, priceId } = req.params;

    const db = getDB();
    const pricesCollection = db.collection(Collections.PRICE_LISTS);

    const result = await pricesCollection.deleteOne({
      _id: new ObjectId(priceId),
      clientId: new ObjectId(clientId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Ítem de precio no encontrado' });
    }

    res.json({ message: 'Ítem de precio eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando ítem de precio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

