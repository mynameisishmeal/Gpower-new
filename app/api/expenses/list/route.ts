import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const category = searchParams.get('category');

    const filter: any = {};
    if (date) filter.expenseDate = date;
    if (category) filter.category = category;

    const expenses = await Expense.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, expenses });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
