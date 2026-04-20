import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Stock from '@/models/Stock';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { stockname, stockprice, stockquantity, stockweight } = await request.json();

    const stock = new Stock({
      stockname,
      stockprice: parseFloat(stockprice),
      stockquantity: parseInt(stockquantity),
      stockweight: parseFloat(stockweight),
      email: 'system'
    });

    await stock.save();
    return NextResponse.json({ success: true, stock });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create stock' }, { status: 500 });
  }
}
