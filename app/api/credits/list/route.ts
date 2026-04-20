import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Credit from '@/models/Credit';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    const filter: any = {};
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;

    const credits = await Credit.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, credits });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
