import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Importar rutas
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import clientRoutes from './routes/clients';
import employeeRoutes from './routes/employees';
import appointmentRoutes from './routes/appointments';
import treatmentRoutes from './routes/treatments';
import supplyRoutes from './routes/supplies';
import paymentRoutes from './routes/payments';
import dashboardRoutes from './routes/dashboard';
import medicalHistoryRoutes from './routes/medicalHistory';

// Importar middlewares
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Configurar variables de entorno
dotenv.config();

// Inicializar Prisma
export const prisma = new PrismaClient();

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // límite de 1000 requests por ventana por IP (aumentado para desarrollo)
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
});

// Middlewares globales
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "blob:", "http://localhost:5000", "http://localhost:3000"],
    },
  },
})); // Seguridad
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// app.use(limiter); // Deshabilitado temporalmente para desarrollo

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Ruta de prueba para verificar archivos estáticos
app.get('/test-uploads', (req, res) => {
  const fs = require('fs');
  const uploadsPath = path.join(__dirname, '../uploads/medical-history');
  
  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({
      status: 'OK',
      message: 'Archivos en uploads/medical-history',
      files: files,
      path: uploadsPath
    });
  } catch (error) {
    res.json({
      status: 'ERROR',
      message: 'No se pudo leer el directorio',
      error: error instanceof Error ? error.message : 'Error desconocido',
      path: uploadsPath
    });
  }
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/supplies', supplyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/medical-history', medicalHistoryRoutes);

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(process.env.UPLOAD_PATH || './uploads'));

// Middlewares de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Función para inicializar el servidor
async function startServer() {
  try {
    // Conectar a la base de datos
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

// Iniciar servidor
startServer();
