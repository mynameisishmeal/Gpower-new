import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Check for duplicate by name (case-insensitive)
    const existingCustomer = await Customer.findOne({ 
      name: { $regex: new RegExp(`^${data.name}$`, 'i') } 
    });

    if (existingCustomer) {
      return NextResponse.json({ 
        success: false,
        error: 'Customer already exists',
        message: `Customer "${existingCustomer.name}" already exists`,
        existingCustomer: {
          _id: existingCustomer._id,
          name: existingCustomer.name,
          phone: existingCustomer.phone,
          email: existingCustomer.email,
          address: existingCustomer.address
        }
      }, { status: 409 });
    }

    // Check for duplicate phone if provided
    if (data.phone) {
      const existingPhone = await Customer.findOne({ phone: data.phone });
      if (existingPhone) {
        return NextResponse.json({ 
          success: false,
          error: 'Phone number already exists',
          message: `Phone number already registered to "${existingPhone.name}"`,
          existingCustomer: {
            _id: existingPhone._id,
            name: existingPhone.name,
            phone: existingPhone.phone,
            email: existingPhone.email,
            address: existingPhone.address
          }
        }, { status: 409 });
      }
    }

    const customer = new Customer(data);
    await customer.save();

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create customer',
      message: error.message 
    }, { status: 500 });
  }
}
