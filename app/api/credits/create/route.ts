import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Credit from '@/models/Credit';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    const credit = await Credit.create({
      customerId: body.customerId,
      customerName: body.customerName,
      saleId: body.saleId,
      amount: body.amount,
      amountPaid: 0,
      amountRemaining: body.amount,
      status: 'pending',
      saleDate: body.saleDate,
      dueDate: body.dueDate,
      payments: []
    });

    return NextResponse.json({ success: true, credit });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
