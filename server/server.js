import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import clientsRoutes from './routes/clients.js';
import servicesRoutes from './routes/services.js';
import pricesRoutes from './routes/prices.js';
import reportsRoutes from './routes/reports.js';
import mediaRoutes from './routes/media.js';
import historyRoutes from './routes/history.js';
import agendasRoutes from './routes/agendas.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// IMPORTANTE: express.urlencoded debe estar ANTES de multer para que req.body.type esté disponible
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de media desde public/media (accesible desde el frontend)
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// El backend está en server/, así que subimos un nivel para llegar a public/media
const projectRoot = path.join(__dirname, '..');
const publicMediaDir = path.join(projectRoot, 'public', 'media');

// Crear las carpetas si no existen
[publicMediaDir, 
 path.join(publicMediaDir, 'images'),
 path.join(publicMediaDir, 'videos'),
 path.join(publicMediaDir, 'audios')].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Servir carpetas de media con tipos MIME correctos
app.use('/media/images', express.static(path.join(publicMediaDir, 'images'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    }
  }
}));
app.use('/media/videos', express.static(path.join(publicMediaDir, 'videos'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (filePath.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/webm');
    }
  }
}));
app.use('/media/audios', express.static(path.join(publicMediaDir, 'audios'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    } else if (filePath.endsWith('.webm')) {
      res.setHeader('Content-Type', 'audio/webm');
    } else if (filePath.endsWith('.wav')) {
      res.setHeader('Content-Type', 'audio/wav');
    }
  }
}));
app.use('/media', express.static(publicMediaDir));

// Conectar a MongoDB
connectDB().catch(console.error);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/clients', pricesRoutes); // /api/clients/:clientId/prices
app.use('/api/reports', reportsRoutes);
app.use('/api/reports', mediaRoutes); // /api/reports/:id/media
app.use('/api/reports', historyRoutes); // /api/reports/:id/history
app.use('/api/agendas', agendasRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TodoAk Backend funcionando' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/proyecto'}`);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  const { closeDB } = await import('./db.js');
  await closeDB();
  process.exit(0);
});

