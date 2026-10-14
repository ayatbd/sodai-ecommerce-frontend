import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  logger.info('Initializing SODAI Backend Server...');

  // 1. Establish MongoDB connection
  await connectDB();

  // 2. Instantiate Express application
  const app = createApp();

  // 3. Start listening
  const server = app.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`Server listening on http://0.0.0.0:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`API Prefix: ${env.API_PREFIX}`);
    logger.info(`Health check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  });

  // 4. Graceful Shutdown
  const handleShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down HTTP server and database connections...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      logger.info('Process terminated gracefully.');
      process.exit(0);
    });

    // Force exit after 10 seconds if hanging
    setTimeout(() => {
      logger.error('Shutdown timeout reached. Forcing immediate termination.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});
