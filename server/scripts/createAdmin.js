import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proyecto';

async function createAdmin() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('proyecto');
    const usersCollection = db.collection('users');

    // Verificar si ya existe un admin
    const existingAdmin = await usersCollection.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario admin');
      return;
    }

    // Crear usuario admin por defecto
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const admin = {
      fullName: 'Administrador',
      documentType: 'CC',
      documentNumber: '1234567890',
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(admin);
    console.log('✅ Usuario admin creado exitosamente');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   ID:', result.insertedId.toString());
  } catch (error) {
    console.error('❌ Error creando admin:', error);
  } finally {
    await client.close();
  }
}

createAdmin();

