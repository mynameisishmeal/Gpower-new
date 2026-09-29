import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const startTime = Date.now();
  try {
    await dbConnect();
    const isConnected = mongoose.connection.readyState === 1;

    let userCount = 0;
    let collections: string[] = [];

    if (isConnected && mongoose.connection.db) {
      userCount = await mongoose.connection.db.collection('users').countDocuments();
      const collList = await mongoose.connection.db.listCollections().toArray();
      collections = collList.map(c => c.name);
    }

    return NextResponse.json({
      success: true,
      connected: isConnected,
      host: mongoose.connection.host || 'MongoDB Atlas',
      database: mongoose.connection.name || 'mfvpos',
      userCount,
      collectionsCount: collections.length,
      latencyMs: Date.now() - startTime
    });
  } catch (err: any) {
    console.error('[Health API] Database check failed:', err?.stack || err?.message || err);
    return NextResponse.json({
      success: false,
      connected: false,
      error: err?.message || String(err),
      latencyMs: Date.now() - startTime
    }, { status: 200 });
  }
}
