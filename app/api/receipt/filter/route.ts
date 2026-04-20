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
    const sharedid = searchParams.get('sharedid');

    const query: any = {};
    if (date) query.saledate = date;
    if (seller) query.seller = seller;
    if (saletype && saletype !== 'all') query.saletype = saletype;
    if (paymentmethod) query.paymentmethod = paymentmethod;
    if (sharedid) query.sharedid = sharedid;

    const sales = await Sales.find(query).sort({ datentime: -1 });
    
    const grouped = sales.reduce((acc: any, sale: any) => {
      if (!acc[sale.sharedid]) {
        acc[sale.sharedid] = [];
      }
      acc[sale.sharedid].push(sale);
      return acc;
    }, {});

    return NextResponse.json({ success: true, sales, grouped });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const sharedid = searchParams.get('sharedid');
    const date = searchParams.get('date');

    if (sharedid) {
      await Sales.deleteMany({ sharedid });
      return NextResponse.json({ success: true, message: 'Receipt deleted' });
    }

    if (date) {
      await Sales.deleteMany({ saledate: date });
      return NextResponse.json({ success: true, message: 'Sales deleted by date' });
    }

    return NextResponse.json({ success: false, message: 'No filter provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
