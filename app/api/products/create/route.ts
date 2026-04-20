import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { productname, productprice, productweight } = await request.json();

    const product = new Product({
      productname,
      productprice: parseFloat(productprice),
      productweight: parseFloat(productweight),
      email: 'system'
    });

    await product.save();
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
