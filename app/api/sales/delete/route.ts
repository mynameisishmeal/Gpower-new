import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sales from '@/models/Sales';

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const sharedid = searchParams.get('sharedid');
    const saledate = searchParams.get('saledate');

    if (id) {
      await Sales.findByIdAndDelete(id);
    } else if (sharedid) {
      await Sales.deleteMany({ sharedid });
    } else if (saledate) {
      await Sales.deleteMany({ saledate });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete sales' }, { status: 500 });
  }
}
