import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Printer from '@/models/Printer';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    const printers = await Printer.find({}).lean();

    return NextResponse.json({ 
      success: true, 
      printers: printers.map(p => ({
        _id: p._id,
        email: p.email,
        serviceUUID: p.serviceUUID,
        characteristicUUID: p.characteristicUUID,
        isOwned: p.email === userEmail
      }))
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch printers' }, { status: 500 });
  }
}
