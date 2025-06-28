import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino-http';
import { createAddressTagRoutes } from './routes/addressTagRoutes';

/**
 * Creates and configures the Express application
 */
export function createApp(): express.Application {
  const app = express();
  const logger = pino({
    autoLogging: false,
    transport: {
      targets: [
        {
          level: process.env.LOG_LEVEL || 'debug',
          target: 'pino/file',
          options: {
            destination: process.env.LOG_FILE || 1, // 1 means stdout
            mkdir: true,
            append: true,
            colorize: true
          }
        },
        ...(process.env.NODE_ENV === 'development' ? [
          {
            // Use console logging in development
            level: process.env.LOG_LEVEL || 'debug',
            target: 'pino/file',
          }
        ] : [])
      ]
    },
  });

  // Use Pino logger
  app.use(logger);

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
    req.log.info(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // API routes
  app.use('/api', createAddressTagRoutes(logger.logger));

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
    req.log.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
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
    req.log.error('Unhandled error:', error);
    
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