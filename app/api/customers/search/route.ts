import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: []
      });
    }

    const customers = await Customer.find({
      name: { $regex: query, $options: 'i' }
    })
    .select('name email phone totalPurchases lastPurchaseDate')
    .sort({ lastPurchaseDate: -1 })
    .limit(10)
    .lean();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: customers
    });

  } catch (error: any) {
    console.error('Customer search error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}
