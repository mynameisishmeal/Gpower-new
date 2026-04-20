import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { id, ...data } = await request.json();

    await Customer.findByIdAndUpdate(id, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
