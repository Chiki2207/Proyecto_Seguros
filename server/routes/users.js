import express from 'express';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';
import { Collections } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/users
 * Crear nuevo usuario (solo ADMIN)
 * Body: { fullName, documentType, documentNumber, username, password, role }
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fullName, documentType, documentNumber, username, password, role } = req.body;

    if (!fullName || !documentType || !documentNumber || !username || !password || !role) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (role !== 'ADMIN' && role !== 'TECNICO') {
      return res.status(400).json({ error: 'Role debe ser ADMIN o TECNICO' });
    }

    const db = getDB();
    const usersCollection = db.collection(Collections.USERS);

    // Verificar si el username ya existe
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'El username ya está en uso' });
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      fullName,
      documentType,
      documentNumber,
      username,
      passwordHash,
      role,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      userId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/users
 * Listar todos los usuarios (solo ADMIN)
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection(Collections.USERS);

    const users = await usersCollection
      .find({}, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(users);
  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/users/:id
 * Obtener datos de un usuario
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Si no es ADMIN, solo puede ver su propio perfil
    if (req.user.role !== 'ADMIN' && req.user.userId !== id) {
      return res.status(403).json({ error: 'No tienes permiso para ver este usuario' });
    }

    const db = getDB();
    const usersCollection = db.collection(Collections.USERS);

    const user = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { passwordHash: 0 } } // Excluir passwordHash
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PATCH /api/users/:id
 * Actualizar usuario (solo ADMIN o el propio usuario para perfil)
 */
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, documentType, documentNumber, username, role, active, newPassword } = req.body;

    // Si no es ADMIN, solo puede editar su propio perfil y no puede cambiar rol/estado
    if (req.user.role !== 'ADMIN' && req.user.userId !== id) {
      return res.status(403).json({ error: 'No tienes permiso para editar este usuario' });
    }

    const db = getDB();
    const usersCollection = db.collection(Collections.USERS);

    // Verificar que el usuario existe
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si no es ADMIN, no puede cambiar rol ni estado
    if (req.user.role !== 'ADMIN') {
      if (role !== undefined || active !== undefined) {
        return res.status(403).json({ error: 'No tienes permiso para cambiar rol o estado' });
      }
    }

    // Construir objeto de actualización
    const update = { updatedAt: new Date() };

    if (fullName !== undefined) update.fullName = fullName;
    if (documentType !== undefined) update.documentType = documentType;
    if (documentNumber !== undefined) update.documentNumber = documentNumber;
    if (username !== undefined) {
      // Verificar que el username no esté en uso por otro usuario
      const usernameExists = await usersCollection.findOne({
        username,
        _id: { $ne: new ObjectId(id) },
      });
      if (usernameExists) {
        return res.status(400).json({ error: 'El username ya está en uso' });
      }
      update.username = username;
    }
    if (role !== undefined && req.user.role === 'ADMIN') {
      if (role !== 'ADMIN' && role !== 'TECNICO') {
        return res.status(400).json({ error: 'Role debe ser ADMIN o TECNICO' });
      }
      update.role = role;
    }
    if (active !== undefined && req.user.role === 'ADMIN') {
      update.active = active;
    }

    // Si se envía newPassword, actualizar passwordHash
    if (newPassword) {
      const passwordHash = await bcrypt.hash(newPassword, 10);
      update.passwordHash = passwordHash;
    }

    await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: update });

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

