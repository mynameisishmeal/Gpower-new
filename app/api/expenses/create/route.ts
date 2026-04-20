import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    const expense = await Expense.create({
      description: body.description,
      amount: body.amount,
      category: body.category,
      expenseDate: body.expenseDate,
      paymentMethod: body.paymentMethod,
      addedBy: body.addedBy,
      notes: body.notes
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
