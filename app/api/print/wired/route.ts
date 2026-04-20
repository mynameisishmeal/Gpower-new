import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { printFile } from '@/lib/printer';

export async function POST(request: NextRequest) {
  try {
    const { text, printerName: requestPrinterName } = await request.json();
    
    if (!text) {
      return NextResponse.json({ success: false, error: 'No text provided' }, { status: 400 });
    }

    // Use printer from request, or try to get from settings
    let printerName = requestPrinterName;
    
    const platform = os.platform();
    
    // For Windows, save raw text and print directly
    if (platform === 'win32') {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const txtPath = path.join(uploadsDir, 'receipt_print.txt');
        fs.writeFileSync(txtPath, text, 'utf8');

        // Print using custom printer utility
        try {
          await printFile(txtPath, printerName);
          
          return NextResponse.json({
            success: true,
            printed: true,
            message: 'Printed successfully'
          });
        } catch (printError: any) {
          return NextResponse.json({
            success: false,
            error: printError.message
          }, { status: 500 });
        }
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: 'File generation failed: ' + error.message
        }, { status: 500 });
      }
    } else {
      // For Linux/Mac, return formatted text for Web Serial API
      const lines = text.split(/\r?\n/);
      const formattedLines = lines.map((line: string) => {
        if (line.length > 32) {
          return line.substring(0, 32);
        }
        return line;
      });

      const thermalText = formattedLines.join('\n');

      return NextResponse.json({
        success: true,
        webSerial: true,
        formattedText: thermalText,
        message: 'Ready for direct thermal printing via Web Serial API',
        printed: false
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
