import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDB } from '../db.js';
import { Collections } from '../models/index.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_muy_seguro_aqui_cambiar_en_produccion';

/**
 * POST /api/auth/login
 * Recibe: { username, password }
 * Devuelve: { token, user: { userId, username, role, fullName } }
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    const db = getDB();
    const usersCollection = db.collection(Collections.USERS);

    // Buscar usuario por username
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Devolver token y datos del usuario (sin passwordHash)
    res.json({
      token,
      user: {
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

