import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proyecto';
let client = null;
let db = null;

export async function connectDB() {
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db('proyecto');
      console.log('✅ Conectado a MongoDB:', MONGODB_URI);
    }
    return db;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
}

export function getDB() {
  if (!db) {
    throw new Error('Database no inicializada. Llama a connectDB() primero.');
  }
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 Desconectado de MongoDB');
  }
}

