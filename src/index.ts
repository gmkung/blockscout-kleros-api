import dotenv from 'dotenv';
import { createApp } from './app';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    const app = createApp();
    
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Blockscout API Server is running on http://${HOST}:${PORT}`);
      console.log(`📚 API Documentation available at http://${HOST}:${PORT}/`);
      console.log(`🏥 Health check available at http://${HOST}:${PORT}/api/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 