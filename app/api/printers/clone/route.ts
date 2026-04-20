import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Printer from '@/models/Printer';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { printerId, userEmail } = await request.json();

    const sourcePrinter = await Printer.findById(printerId);
    if (!sourcePrinter) {
      return NextResponse.json({ success: false, error: 'Printer not found' }, { status: 404 });
    }

    const existingPrinter = await Printer.findOne({ email: userEmail });
    if (existingPrinter) {
      existingPrinter.serviceUUID = sourcePrinter.serviceUUID;
      existingPrinter.characteristicUUID = sourcePrinter.characteristicUUID;
      await existingPrinter.save();
      return NextResponse.json({ success: true, printer: existingPrinter });
    }

    const newPrinter = await Printer.create({
      email: userEmail,
      serviceUUID: sourcePrinter.serviceUUID,
      characteristicUUID: sourcePrinter.characteristicUUID
    });

    return NextResponse.json({ success: true, printer: newPrinter });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to clone printer' }, { status: 500 });
  }
}
