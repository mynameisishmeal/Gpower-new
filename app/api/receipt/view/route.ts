import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sales from '@/models/Sales';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const sales = await Sales.find({ sharedid: id });
    return NextResponse.json({ sales });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch receipt' }, { status: 500 });
  }
}
