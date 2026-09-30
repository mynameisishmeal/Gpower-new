import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Stock from '@/models/Stock';
import { checkServerPermission } from '@/lib/auth/serverAuth';

export async function POST(request: Request) {
  try {
    const auth = await checkServerPermission(request, 'canManageInventory');
    if (!auth.authorized) {
      return auth.response!;
    }

    await dbConnect();
    const { stockname, stockprice, stockquantity, stockweight } = await request.json();

    const stock = new Stock({
      stockname,
      stockprice: parseFloat(stockprice),
      stockquantity: parseInt(stockquantity),
      stockweight: parseFloat(stockweight),
      email: auth.user?.email || 'system'
    });

    await stock.save();
    return NextResponse.json({ success: true, stock });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create stock' }, { status: 500 });
  }
}
