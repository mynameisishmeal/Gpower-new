import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { checkServerPermission } from '@/lib/auth/serverAuth';

export async function POST(request: Request) {
  try {
    const auth = await checkServerPermission(request, 'canManageInventory');
    if (!auth.authorized) {
      return auth.response!;
    }

    await dbConnect();
    const { productname, productprice, productweight } = await request.json();

    const product = new Product({
      productname,
      productprice: parseFloat(productprice),
      productweight: parseFloat(productweight),
      email: auth.user?.email || 'system'
    });

    await product.save();
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
