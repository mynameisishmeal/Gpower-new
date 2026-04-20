import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sales from '@/models/Sales';
import Stock from '@/models/Stock';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const todayString = `${day}-${month}-${year}`;

    const todaySales = await Sales.find({ saledate: todayString });
    const todayRevenue = todaySales.reduce((sum, sale) => {
      const total = parseFloat(String(sale.producttotal)) || 0;
      return sum + total;
    }, 0);
    const productsSold = todaySales.length;

    const activeUsers = await User.countDocuments();
    const lowStock = await Stock.countDocuments({ stockquantity: { $lt: 10 } });

    return NextResponse.json({
      success: true,
      data: {
        todayRevenue,
        productsSold,
        activeUsers,
        lowStock
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
