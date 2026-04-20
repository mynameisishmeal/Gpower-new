import path from 'path';
import { exec, execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

export async function printFile(filePath: string, printerName?: string) {
  const ext = path.extname(filePath).toLowerCase();
  
  console.log('🖨️ Print Request:', { filePath, printerName, ext });
  
  if (ext === '.txt') {
    try {
      if (!printerName) {
        throw new Error('Printer name required');
      }
      
      // Read file content
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Create a PowerShell script to print
      const psScript = `
        $printerName = "${printerName}"
        $content = @"
${content.replace(/"/g, '`"')}
"@
        
        # Create print job
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
        $stream = New-Object System.IO.MemoryStream
        $stream.Write($bytes, 0, $bytes.Length)
        $stream.Position = 0
        
        # Send to printer using .NET
        Add-Type -AssemblyName System.Drawing
        Add-Type -AssemblyName System.Windows.Forms
        
        $printDoc = New-Object System.Drawing.Printing.PrintDocument
        $printDoc.PrinterSettings.PrinterName = $printerName
        
        $printDoc.add_PrintPage({
          param($sender, $ev)
          $font = New-Object System.Drawing.Font("Courier New", 8)
          $ev.Graphics.DrawString($content, $font, [System.Drawing.Brushes]::Black, 0, 0)
          $ev.HasMorePages = $false
        })
        
        $printDoc.Print()
      `;
      
      // Save script to temp file
      const tempScript = path.join(path.dirname(filePath), 'print_temp.ps1');
      fs.writeFileSync(tempScript, psScript);
      
      console.log('📄 Executing PowerShell print script');
      const result = await execAsync(`powershell -ExecutionPolicy Bypass -File "${tempScript}"`);
      console.log('✅ Print result:', result);
      
      // Clean up
      try { fs.unlinkSync(tempScript); } catch {}
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Print failed:', error);
      throw new Error(`Print failed: ${error.message}`);
    }
  }
  
  // For PDFs, use SumatraPDF
  const sumatraPath = path.join(
    process.cwd(),
    'node_modules',
    'pdf-to-printer',
    'dist',
    'SumatraPDF-3.4.6-32.exe'
  );

  const args = [
    '-print-to-default',
    '-silent',
    filePath
  ];

  if (printerName) {
    args[0] = '-print-to';
    args.splice(1, 0, printerName);
  }

  try {
    await execFileAsync(sumatraPath, args);
    return { success: true };
  } catch (error: any) {
    throw new Error(`Print failed: ${error.message}`);
  }
}
