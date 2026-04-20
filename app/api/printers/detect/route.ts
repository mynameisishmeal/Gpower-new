import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync('powershell -Command "Get-Printer | Select-Object Name, Default | ConvertTo-Json"');
    
    const printers = JSON.parse(stdout);
    const printerList = Array.isArray(printers) ? printers : [printers];
    
    return NextResponse.json({
      success: true,
      printers: printerList.map((p: any) => ({
        name: p.Name,
        isDefault: p.Default === true
      }))
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      printers: []
    }, { status: 500 });
  }
}
