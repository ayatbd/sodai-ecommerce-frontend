import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export async function connectDB(): Promise<typeof mongoose | null> {
  if (isConnected) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database name: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error event:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Lost connection to database.');
      isConnected = false;
    });

    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Warning: Could not connect to MongoDB at ${env.MONGODB_URI}.`);
    console.warn('[MongoDB] Ensure MongoDB daemon is running (mongod or Mongo Atlas URI).');
    if (error instanceof Error) {
      console.warn(`[MongoDB] Details: ${error.message}`);
    }
    return null;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('[MongoDB] Disconnected from database.');
}
