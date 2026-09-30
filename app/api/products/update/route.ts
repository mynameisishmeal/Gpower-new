import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { checkServerPermission } from '@/lib/auth/serverAuth';

export async function PUT(request: Request) {
  try {
    const auth = await checkServerPermission(request, 'canManageInventory');
    if (!auth.authorized) {
      return auth.response!;
    }

    await dbConnect();
    const { id, productname, productprice, productweight } = await request.json();

    await Product.findByIdAndUpdate(id, {
      productname,
      productprice: parseFloat(productprice),
      productweight: parseFloat(productweight)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
