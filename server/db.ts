import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[MongoDB] MONGODB_URI not provided; using memory fallback for test mode.');
    return false;
  }

  if (isConnected) {
    return true;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = conn.connection.readyState === 1;
    console.log(`[MongoDB] Connected to database: ${conn.connection.name || 'default'}`);
    return isConnected;
  } catch (err) {
    console.warn('[MongoDB] Connection failed, continuing with in-memory persistence fallback:', (err as Error).message);
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
