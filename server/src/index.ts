import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';
import verificationRoutes from './routes/verification.js';
import analyticsRoutes from './routes/analytics.js';
import jurisdictionRoutes from './routes/jurisdictions.js';
import userRoutes from './routes/users.js';
import { errorHandler } from './middleware/errorHandler.js';
import { CONFIG } from './config.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Permissive for local development and demonstration
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    system: 'JeevikaSetu API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    competition: 'Hack for Social Cause (HSC 2027) - Viksit Bharat Young Leaders Dialogue',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/jurisdictions', jurisdictionRoutes);
app.use('/api/users', userRoutes);

// Central Error Handler
app.use(errorHandler);

// Start Server if not imported by tests
if (process.env.NODE_ENV !== 'test') {
  const PORT = CONFIG.PORT;
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🌊 JEEVIKASETU BACKEND SERVICE RUNNING ON PORT ${PORT}`);
    console.log(`   Voice-First Flood Livelihood Recovery Platform`);
    console.log(`   Hack for Social Cause - Viksit Bharat 2027`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

export default app;
