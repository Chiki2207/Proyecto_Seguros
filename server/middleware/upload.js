import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear carpetas de media en public/media (accesible desde el frontend)
// __dirname es server/middleware/, así que subimos DOS niveles para llegar a la raíz del proyecto
const projectRoot = path.join(__dirname, '..', '..');
const mediaDir = path.join(projectRoot, 'public', 'media');
const imagesDir = path.join(mediaDir, 'images');
const videosDir = path.join(mediaDir, 'videos');
const audiosDir = path.join(mediaDir, 'audios');

[mediaDir, imagesDir, videosDir, audiosDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // El tipo puede venir del body (form-data) o del query string
    // Multer procesa antes que body-parser, así que usamos req.body directamente
    const type = req.body?.type || req.query?.type || '';
    
    // Determinar carpeta según el tipo
    let destinationDir;
    if (type === 'FOTO' || type === 'foto') {
      destinationDir = imagesDir;
    } else if (type === 'VIDEO' || type === 'video') {
      destinationDir = videosDir;
    } else if (type === 'AUDIO' || type === 'audio') {
      destinationDir = audiosDir;
    } else {
      // Si no hay tipo, intentar inferirlo del mimetype del archivo
      const mimetype = file.mimetype || '';
      if (mimetype.startsWith('image/')) {
        destinationDir = imagesDir;
      } else if (mimetype.startsWith('video/')) {
        destinationDir = videosDir;
      } else if (mimetype.startsWith('audio/')) {
        destinationDir = audiosDir;
      } else {
        // Por defecto, usar images
        destinationDir = imagesDir;
      }
    }
    
    // Asegurar que el directorio existe
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }
    
    console.log(`📁 Guardando archivo tipo "${type}" (mimetype: ${file.mimetype}) en: ${destinationDir}`);
    cb(null, destinationDir);
  },
  filename: (req, file, cb) => {
    const type = (req.body?.type || 'file').toLowerCase();
    // Generar nombre único con múltiples factores para evitar conflictos:
    // 1. Timestamp en milisegundos (Date.now()) - único por milisegundo
    // 2. Número aleatorio de 9 dígitos (1e9)
    // 3. Número aleatorio adicional de 6 dígitos para mayor seguridad
    // 4. El userId se agregará después de la autenticación en media.js
    const timestamp = Date.now();
    const random1 = Math.round(Math.random() * 1e9); // 0-999,999,999
    const random2 = Math.round(Math.random() * 1e6); // 0-999,999 (segunda capa de aleatoriedad)
    const uniqueSuffix = `${timestamp}-${random1}-${random2}`;
    const ext = path.extname(file.originalname);
    
    // Formato: tipo-timestamp-random1-random2.ext
    // Ejemplo: foto-1763543370428-463224350-123456.jpg
    // El userId se agregará después: foto-1763543370428-463224350-123456-userId.jpg
    const filename = `${type}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|mp3|wav|ogg|m4a/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo imágenes, videos y audios.'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter,
});

// Función stub para transcripción de audio
export async function transcribeAudio(filePath) {
  // TODO: Reemplazar con servicio real de speech-to-text
  // Por ahora retorna un texto de ejemplo
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Transcripción pendiente (demo). Este es un texto de ejemplo que será reemplazado por la transcripción real del audio.');
    }, 1000);
  });
}

