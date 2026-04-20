import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Stock from '@/models/Stock';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const stocks = await Stock.find({})
      .select('stockname stockprice stockquantity stockweight')
      .lean();

    return NextResponse.json({
      success: true,
      stocks: stocks
    });

  } catch (error: any) {
    console.error('Stock list error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}
