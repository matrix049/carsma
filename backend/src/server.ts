import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import DatabaseConnection from './config/database';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import customOrderRoutes from './routes/customOrders';
import contactRoutes from './routes/contact';
import seedRoutes from './routes/seed';
import healthRoutes from './routes/health';
import uploadRoutes from './routes/upload';
import adminToolsRoutes from './routes/admin-tools';
import testRoutes from './routes/testRoutes';
import analyticsRoutes from './routes/analytics';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware stack (order matters!)
// 1. Security headers
app.use(helmet());

// 2. CORS configuration - Allow frontend to communicate with backend
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000', // Local development
  'http://localhost:3001'  // Alternative local port
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. JSON body parser
app.use(express.json());

// 4. Request logging
app.use(requestLogger);

// 5. Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root route - API is alive check
app.get('/', (_req, res) => {
  res.status(200).send('Art Store API is Live');
});

// Health check route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.use('/api/admin', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom-orders', customOrderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin-tools', adminToolsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/test', testRoutes);
app.use('/api', seedRoutes);
app.use('/api', healthRoutes);

// 404 handler for undefined routes (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  // Start server FIRST - don't wait for MongoDB
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server is running on port ${PORT}`);
    console.log(`✓ Listening on 0.0.0.0:${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Connect to MongoDB in the background (non-blocking)
  const db = new DatabaseConnection();
  db.connect()
    .then(async () => {
      console.log('✓ MongoDB connected successfully');
      // Sync admin credentials from env vars on every startup
      try {
        const Admin = (await import('./models/Admin')).default;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (adminEmail && adminPassword) {
          await Admin.deleteMany({});
          await Admin.create({ email: adminEmail, password: adminPassword });
          console.log(`✓ Admin synced: ${adminEmail}`);
        }
      } catch (e) {
        console.error('⚠ Admin sync failed:', e);
      }
    })
    .catch((error) => {
      console.error('✗ MongoDB connection failed:', error.message);
      console.error('⚠ Server is running but database operations will fail');
      // Don't exit - let the server stay up for debugging
    });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
};

startServer();

export default app;
