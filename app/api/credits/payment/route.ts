import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Credit from '@/models/Credit';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    const credit = await Credit.findById(body.creditId);
    if (!credit) {
      return NextResponse.json({ success: false, message: 'Credit not found' }, { status: 404 });
    }

    const paymentAmount = Number(body.amount);
    const newAmountPaid = credit.amountPaid + paymentAmount;
    const newAmountRemaining = credit.amount - newAmountPaid;

    credit.payments.push({
      amount: paymentAmount,
      paymentDate: body.paymentDate,
      paymentMethod: body.paymentMethod
    });

    credit.amountPaid = newAmountPaid;
    credit.amountRemaining = newAmountRemaining;
    credit.status = newAmountRemaining === 0 ? 'paid' : 'partial';

    await credit.save();

    return NextResponse.json({ success: true, credit });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
