import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).lean();
    
    // Ensure productweight exists, default to 0 if missing
    const productsWithDefaults = products.map(p => ({
      ...p,
      productweight: p.productweight || 0,
      productquantity: p.productquantity || 0
    }));
    
    return NextResponse.json({ products: productsWithDefaults });
  } catch (error) {
    console.error('Products list error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
