import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

function resolveMongoUri(): string {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  if (process.env.ONLINE_URI) return process.env.ONLINE_URI;

  try {
    const candidates = [
      typeof process !== 'undefined' && (process as any).resourcesPath
        ? path.join((process as any).resourcesPath, '.env.local')
        : null,
      path.join(process.cwd(), 'resources', '.env.local'),
      path.join(process.cwd(), '.env.local'),
      path.join(__dirname, '..', '.env.local'),
    ].filter(Boolean) as string[];

    for (const envPath of candidates) {
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        const uri = process.env.MONGODB_URI || process.env.ONLINE_URI;
        if (uri) {
          console.log(`[MongoDB] Loaded connection string from: ${envPath}`);
          return uri;
        }
      }
    }
  } catch (e) {
    // fallback
  }

  return process.env.MONGODB_URI || process.env.ONLINE_URI || '';
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUri = resolveMongoUri();
    if (!mongoUri) {
      throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }

    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      family: 4,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
      console.log('✅ MongoDB Connected Successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB Connection Error:', error.message);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
