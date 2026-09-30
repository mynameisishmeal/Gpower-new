import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { checkServerPermission } from '@/lib/auth/serverAuth';

export async function DELETE(request: Request) {
  try {
    const auth = await checkServerPermission(request, 'canManageInventory');
    if (!auth.authorized) {
      return auth.response!;
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
