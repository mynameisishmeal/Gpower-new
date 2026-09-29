import path from 'path';
import { exec, execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import { formatReceiptWithSettings } from './receiptFormatter';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

export async function printFile(filePath: string, printerName?: string, receiptSettings?: any) {
  const ext = path.extname(filePath).toLowerCase();
  
  console.log('🖨️ Print Request:', { filePath, printerName, ext });
  
  if (ext === '.txt') {
    try {
      if (!printerName) {
        throw new Error('Printer name required');
      }
      
      // Read file content
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Format for thermal printer with ESC/POS commands using settings
      const formattedContent = formatReceiptWithSettings(content, receiptSettings || {});
      
      // Save formatted content to a new file
      const formattedPath = filePath.replace('.txt', '_formatted.txt');
      fs.writeFileSync(formattedPath, formattedContent, 'binary');
      
      // Print using raw mode (bypass Windows print spooler formatting)
      const psScript = `
        $printerName = "${printerName}"
        $filePath = "${formattedPath.replace(/\\/g, '\\\\')}"
        
        # Read file as bytes
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        
        # Send raw bytes directly to printer
        Add-Type -TypeDefinition @"
        using System;
        using System.Runtime.InteropServices;
        
        public class RawPrinter {
            [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
            public class DOCINFOA {
                [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
                [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
                [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
            }
            
            [DllImport("winspool.Drv", EntryPoint="OpenPrinterA", SetLastError=true, CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
            public static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter, out IntPtr hPrinter, IntPtr pd);
            
            [DllImport("winspool.Drv", EntryPoint="ClosePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
            public static extern bool ClosePrinter(IntPtr hPrinter);
            
            [DllImport("winspool.Drv", EntryPoint="StartDocPrinterA", SetLastError=true, CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
            public static extern bool StartDocPrinter(IntPtr hPrinter, Int32 level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);
            
            [DllImport("winspool.Drv", EntryPoint="EndDocPrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
            public static extern bool EndDocPrinter(IntPtr hPrinter);
            
            [DllImport("winspool.Drv", EntryPoint="StartPagePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
            public static extern bool StartPagePrinter(IntPtr hPrinter);
            
            [DllImport("winspool.Drv", EntryPoint="EndPagePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
            public static extern bool EndPagePrinter(IntPtr hPrinter);
            
            [DllImport("winspool.Drv", EntryPoint="WritePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
            public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, Int32 dwCount, out Int32 dwWritten);
            
            public static bool SendBytesToPrinter(string szPrinterName, byte[] pBytes) {
                IntPtr hPrinter = IntPtr.Zero;
                DOCINFOA di = new DOCINFOA();
                di.pDocName = "Receipt";
                di.pDataType = "RAW";
                
                bool bSuccess = false;
                
                if (OpenPrinter(szPrinterName, out hPrinter, IntPtr.Zero)) {
                    if (StartDocPrinter(hPrinter, 1, di)) {
                        if (StartPagePrinter(hPrinter)) {
                            IntPtr pUnmanagedBytes = Marshal.AllocCoTaskMem(pBytes.Length);
                            Marshal.Copy(pBytes, 0, pUnmanagedBytes, pBytes.Length);
                            int dwWritten;
                            bSuccess = WritePrinter(hPrinter, pUnmanagedBytes, pBytes.Length, out dwWritten);
                            Marshal.FreeCoTaskMem(pUnmanagedBytes);
                            EndPagePrinter(hPrinter);
                        }
                        EndDocPrinter(hPrinter);
                    }
                    ClosePrinter(hPrinter);
                }
                return bSuccess;
            }
        }
"@
        
        # Send to printer
        $result = [RawPrinter]::SendBytesToPrinter($printerName, $bytes)
        
        if (-not $result) {
            throw "Failed to send data to printer"
        }
      `;
      
      // Save script to temp file
      const tempScript = path.join(path.dirname(filePath), 'print_raw.ps1');
      fs.writeFileSync(tempScript, psScript);
      
      console.log('📄 Executing PowerShell RAW print script');
      const result = await execAsync(`powershell -ExecutionPolicy Bypass -File "${tempScript}"`);
      console.log('✅ Print result:', result);
      
      // Clean up
      try { 
        fs.unlinkSync(tempScript); 
        fs.unlinkSync(formattedPath);
      } catch {}
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Print failed:', error);
      throw new Error(`Print failed: ${error.message}`);
    }
  }
  
  // For PDFs, locate SumatraPDF across standard Node and Electron unpacked environments
  function getSumatraPath(): string {
    const standardPath = path.join(
      process.cwd(),
      'node_modules',
      'pdf-to-printer',
      'dist',
      'SumatraPDF-3.4.6-32.exe'
    );
    if (fs.existsSync(standardPath)) return standardPath;

    const resourcesPath = (process as any).resourcesPath;
    if (resourcesPath) {
      const unpackedPath = path.join(
        resourcesPath,
        'app.asar.unpacked',
        'node_modules',
        'pdf-to-printer',
        'dist',
        'SumatraPDF-3.4.6-32.exe'
      );
      if (fs.existsSync(unpackedPath)) return unpackedPath;
    }
    return standardPath;
  }

  const sumatraPath = getSumatraPath();

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
