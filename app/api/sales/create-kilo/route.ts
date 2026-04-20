import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sales from '@/models/Sales';
import Product from '@/models/Product';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { data, paymentDetails } = await request.json();

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No sale data provided' }, { status: 400 });
    }

    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const saledate = `${day}-${month}-${year}`;
    const sharedId = Math.random().toString(36).substring(2, 15);

    const maxSaleNoDoc = await Sales.findOne().sort({ sale_no: -1 }).select('sale_no').lean();
    const nextSaleNo = maxSaleNoDoc?.sale_no ? maxSaleNoDoc.sale_no + 1 : 1;

    const totalSaleAmount = data.reduce((sum: number, row: any) => sum + parseFloat(row.Column3), 0);

    const salesRecords = [];
    for (const payment of paymentDetails) {
      let runningTotal = 0;
      for (let idx = 0; idx < data.length; idx++) {
        const row = data[idx];
        const productTotal = parseFloat(row.Column3);
        let splitAmount = Math.round((productTotal / totalSaleAmount) * parseFloat(payment.amount));
        if (idx === data.length - 1) {
          splitAmount = parseFloat(payment.amount) - runningTotal;
        }
        runningTotal += splitAmount;

        salesRecords.push({
          productname: row.Column0,
          productprice: row.Column1,
          productquantity: row.Column2,
          producttotal: splitAmount,
          paymentmethod: payment.method,
          seller: 'system',
          sharedid: sharedId,
          saledate,
          saletype: row.saletype || 'Kilos',
          datentime: now.toISOString(),
          regtime: now.getTime(),
          sale_no: nextSaleNo
        });
      }
    }

    await Sales.insertMany(salesRecords);

    for (const row of data) {
      const productName = row.Column0;
      const quantitySold = parseFloat(row.Column2);
      await Product.findOneAndUpdate(
        { productname: productName },
        { $inc: { productweight: -quantitySold } },
        { new: true }
      );
    }

    return NextResponse.json({ success: true, message: 'Sale completed' });
  } catch (error) {
    console.error('Error creating kilo sale:', error);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}
