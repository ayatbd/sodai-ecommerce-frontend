import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

export function createApp(): Application {
  const app = express();

  // 1. Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  // 2. CORS configuration
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. HTTP Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // 4. Rate Limiting
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP address. Please try again later.',
      timestamp: new Date().toISOString(),
    },
  });
  app.use('/api', limiter);

  // 5. Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 6. Base Root Welcome Endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'SODAI E-Commerce REST API',
      version: '1.0.0',
      architecture: 'MVC (Model-View-Controller)',
      documentation: `${env.API_PREFIX}/health`,
      endpoints: {
        auth: `${env.API_PREFIX}/auth`,
        products: `${env.API_PREFIX}/products`,
        categories: `${env.API_PREFIX}/categories`,
        orders: `${env.API_PREFIX}/orders`,
        coupons: `${env.API_PREFIX}/coupons`,
        reviews: `${env.API_PREFIX}/reviews`,
        admin: `${env.API_PREFIX}/admin`,
      },
    });
  });

  // 7. Mount Main API Router
  app.use(env.API_PREFIX, apiRouter);

  // 8. 404 Route Handler
  app.use(notFoundHandler);

  // 9. Central Error Handler
  app.use(errorHandler);

  return app;
}
