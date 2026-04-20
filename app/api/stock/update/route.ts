import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Stock from '@/models/Stock';

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { id, stockname, stockprice, stockquantity, stockweight } = await request.json();

    await Stock.findByIdAndUpdate(id, {
      stockname,
      stockprice: parseFloat(stockprice),
      stockquantity: parseInt(stockquantity),
      stockweight: parseFloat(stockweight)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
