import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sales from '@/models/Sales';
import Stock from '@/models/Stock';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import Credit from '@/models/Credit';
import { ApiResponse, IPaymentMethod } from '@/types';

interface SaleItem {
  Column0: string; // productname
  Column1: string; // productprice
  Column2: string; // productquantity
  Column3: string; // producttotal
  saletype?: string;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { data, paymentDetails, seller, discount = 0, customerName } = body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'No sale data provided'
      }, { status: 400 });
    }

    if (!seller) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Seller information required'
      }, { status: 400 });
    }

    // Calculate totals
    const subtotal = data.reduce((sum: number, item: SaleItem) => 
      sum + parseFloat(item.Column3), 0
    );
    const discountAmount = parseFloat(discount.toString()) || 0;
    const finalTotal = subtotal - discountAmount;

    // Validate stock/products based on sale type
    for (const item of data) {
      const saleType = item.saletype || 'Cartons';
      
      if (saleType === 'Cartons') {
        // Validate against Stock collection
        const stock = await Stock.findOne({ stockname: item.Column0 });
        if (!stock) {
          return NextResponse.json<ApiResponse>({
            success: false,
            message: `Product ${item.Column0} not found in stock`
          }, { status: 400 });
        }
        if (parseFloat(item.Column2) > stock.stockquantity) {
          return NextResponse.json<ApiResponse>({
            success: false,
            message: `Insufficient stock for ${item.Column0}. Available: ${stock.stockquantity} cartons`
          }, { status: 400 });
        }
      } else if (saleType === 'Kilos') {
        // Validate against Product collection (no quantity check needed)
        const product = await Product.findOne({ productname: item.Column0 });
        if (!product) {
          return NextResponse.json<ApiResponse>({
            success: false,
            message: `Product ${item.Column0} not found in products`
          }, { status: 400 });
        }
      }
    }

    // Generate shared ID and sale number
    const sharedId = generateSharedId();
    const maxSaleDoc = await Sales.findOne().sort({ sale_no: -1 }).select('sale_no').lean();
    const nextSaleNo = maxSaleDoc?.sale_no ? maxSaleDoc.sale_no + 1 : 1;

    // Handle customer
    let customerId: string | undefined;
    if (customerName && customerName.trim()) {
      let customer = await Customer.findOne({ name: customerName.trim() });
      if (!customer) {
        customer = await Customer.create({
          name: customerName.trim(),
          totalPurchases: finalTotal,
          lastPurchaseDate: new Date()
        });
      } else {
        customer.totalPurchases = (customer.totalPurchases || 0) + finalTotal;
        customer.lastPurchaseDate = new Date();
        await customer.save();
      }
      customerId = customer._id?.toString();
    }

    // Create date strings
    const now = new Date();
    const saledate = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const saletime = `${displayHours}:${minutes} ${ampm}`;
    const datentime = now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });

    // Split sales by payment method
    const salesRecords = [];
    const payments: IPaymentMethod[] = paymentDetails || [{ method: 'cash', amount: finalTotal }];
    
    for (const payment of payments) {
      let runningTotal = 0;
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const productTotal = parseFloat(item.Column3);
        let splitAmount = Math.round((productTotal / subtotal) * parseFloat(payment.amount.toString()));
        
        if (i === data.length - 1) {
          splitAmount = parseFloat(payment.amount.toString()) - runningTotal;
        }
        runningTotal += splitAmount;

        salesRecords.push({
          productname: item.Column0,
          productprice: item.Column1,
          productquantity: item.Column2,
          producttotal: splitAmount,
          paymentmethod: payment.method,
          seller,
          sharedid: sharedId,
          saledate,
          saletime,
          saletype: item.saletype || 'Cartons',
          datentime,
          regtime: now,
          sale_no: nextSaleNo,
          discount: discountAmount,
          subtotal,
          customerName: customerName?.trim(),
          customerId
        });
      }
    }

    // Save sales
    await Sales.insertMany(salesRecords);

    // Create credit record if payment includes credit
    const creditPayment = payments.find(p => p.method === 'credit');
    if (creditPayment && creditPayment.amount > 0) {
      if (!customerName || !customerName.trim()) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'Customer name is required for credit sales'
        }, { status: 400 });
      }

      await Credit.create({
        customerId: customerId || '',
        customerName: customerName.trim(),
        saleId: sharedId,
        amount: creditPayment.amount,
        amountPaid: 0,
        amountRemaining: creditPayment.amount,
        status: 'pending',
        saleDate: saledate,
        payments: []
      });
    }

    // Update stock only for Carton sales
    for (const item of data) {
      const saleType = item.saletype || 'Cartons';
      if (saleType === 'Cartons') {
        await Stock.findOneAndUpdate(
          { stockname: item.Column0 },
          { $inc: { stockquantity: -parseFloat(item.Column2) } }
        );
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Sales created successfully',
      data: {
        sharedId,
        saleNo: nextSaleNo,
        subtotal,
        discount: discountAmount,
        total: finalTotal,
        customerName,
        datentime
      }
    });

  } catch (error: any) {
    console.error('Sales creation error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}

function generateSharedId(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 13; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
