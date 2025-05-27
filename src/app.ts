import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createAddressTagRoutes } from './routes/addressTagRoutes';

/**
 * Creates and configures the Express application
 */
export function createApp(): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  
  // CORS middleware
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // API routes
  app.use('/api', createAddressTagRoutes());

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      data: {
        message: 'Blockscout API Service',
        version: '1.0.0',
        endpoints: {
          'POST /api/address-tags': 'Get address tags for given chains and addresses',
          'GET /api/health': 'Health check endpoint'
        }
      }
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        error: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
        statusCode: 404
      }
    });
  });

  // Global error handler
  app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        statusCode: 500
      }
    });
  });

  return app;
} 