import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    const customer = new Customer(data);
    await customer.save();

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
