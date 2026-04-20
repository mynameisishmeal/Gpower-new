import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sales from '@/models/Sales';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const seller = searchParams.get('seller');
    const saletype = searchParams.get('saletype');
    const paymentmethod = searchParams.get('paymentmethod');
    const customerId = searchParams.get('customerId');
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = (page - 1) * limit;

    const query: any = {};
    if (date) {
      const parts = date.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const day = parseInt(parts[2]);
      query.saledate = `${day}-${month}-${year}`;
    }
    if (seller) query.seller = seller;
    if (saletype && saletype !== 'all') query.saletype = saletype;
    if (paymentmethod) query.paymentmethod = paymentmethod;
    if (customerId) query.customerId = customerId;

    // Get total count for pagination
    const total = await Sales.countDocuments(query);
    
    // Calculate total amount for all matching sales (not just current page)
    const totalAmountResult = await Sales.aggregate([
      { $match: query },
      { $group: { _id: null, totalAmount: { $sum: { $toDouble: "$producttotal" } } } }
    ]);
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;
    
    // Fetch paginated sales with sorting
    const sales = await Sales.find(query)
      .sort({ sale_no: -1 }) // Sort by sale number descending (latest first)
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance
    
    return NextResponse.json({ 
      sales,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalAmount
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}
