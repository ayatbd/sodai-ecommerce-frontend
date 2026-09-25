import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/db';
import { paymentsRouter } from './server/routes/payments';
import { authRouter } from './server/routes/auth';
import { accountRouter } from './server/routes/account';
import { wishlistRouter } from './server/routes/wishlist';
import { couponsRouter } from './server/routes/coupons';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parsing
  app.use(express.json());

  // Connect MongoDB (optional in test dev mode, connects when MONGODB_URI is provided)
  await connectDB();

  // API Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'aura-ecommerce',
      timestamp: new Date().toISOString(),
      stripeTestMode: true,
    });
  });

  // Mount Payment API Routes
  app.use('/api/v1/payments', paymentsRouter);

  // Mount Auth API Routes
  app.use('/api/v1/auth', authRouter);

  // Mount Account API Routes
  app.use('/api/v1/account', accountRouter);

  // Mount Wishlist API Routes
  app.use('/api/v1/wishlist', wishlistRouter);

  // Mount Coupons API Routes
  app.use('/api/v1/coupons', couponsRouter);

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AURA Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[AURA Server] Stripe Payment Flow available at /api/v1/payments`);
  });
}

startServer().catch((err) => {
  console.error('[AURA Server] Fatal error starting server:', err);
});
