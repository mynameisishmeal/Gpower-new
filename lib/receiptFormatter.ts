// ESC/POS commands for thermal printers
const ESC = '\x1B';
const GS = '\x1D';

// Convert size number to ESC/POS command
function getSizeCommand(size: number): string {
  switch(size) {
    case 0: return ESC + '!' + '\x00'; // Normal
    case 1: return ESC + '!' + '\x10'; // Double height
    case 2: return ESC + '!' + '\x20'; // Double width
    case 3: return ESC + '!' + '\x30'; // Double width + height
    default: return ESC + '!' + '\x00';
  }
}

interface ReceiptSettings {
  storeNameSize?: number;
  addressSize?: number;
  itemsSize?: number;
  priceSize?: number;
  totalSize?: number;
  footerSize?: number;
  autoCut?: boolean;
}

export function formatReceiptWithSettings(content: string, settings: ReceiptSettings = {}): string {
  let formatted = '';
  
  // Initialize printer
  formatted += ESC + '@'; // Initialize
  formatted += ESC + 'a' + '\x01'; // Center align
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect and format different sections
    if (line.includes('===')) {
      formatted += ESC + '!' + '\x00'; // Normal size
      formatted += line + '\n';
    } 
    else if (line.includes('GPOWER') || line.includes('CRM') || (i < 3 && line.trim().length > 0)) {
      // Store name - use custom size
      formatted += getSizeCommand(settings.storeNameSize ?? 3);
      formatted += ESC + 'E' + '\x01'; // Bold
      formatted += line + '\n';
      formatted += ESC + 'E' + '\x00'; // Bold off
      formatted += ESC + '!' + '\x00'; // Reset
    } 
    else if (line.includes('Date:') || line.includes('Time:') || line.includes('Seller:') || line.includes('Customer:')) {
      formatted += ESC + '!' + '\x00'; // Normal
      formatted += ESC + 'a' + '\x00'; // Left align
      formatted += line + '\n';
      formatted += ESC + 'a' + '\x01'; // Back to center
    } 
    else if (line.includes('TOTAL:')) {
      // Total - use custom size
      formatted += getSizeCommand(settings.totalSize ?? 2);
      formatted += ESC + 'E' + '\x01'; // Bold
      formatted += line + '\n';
      formatted += ESC + 'E' + '\x00'; // Bold off
      formatted += ESC + '!' + '\x00'; // Reset
    } 
    else if (line.includes('Subtotal:') || line.includes('Discount:')) {
      // Prices - use custom size
      formatted += getSizeCommand(settings.priceSize ?? 0);
      formatted += line + '\n';
      formatted += ESC + '!' + '\x00'; // Reset
    } 
    else if (line.includes('ITEMS:') || line.includes('PAYMENT:')) {
      // Section headers - use items size
      formatted += getSizeCommand(settings.itemsSize ?? 0);
      formatted += ESC + 'E' + '\x01'; // Bold
      formatted += line + '\n';
      formatted += ESC + 'E' + '\x00'; // Bold off
      formatted += ESC + '!' + '\x00'; // Reset
    } 
    else if (line.trim().startsWith('N') || line.trim().startsWith('₦') || line.includes(' x N') || line.includes(' x ₦')) {
      // Price lines - use price size
      formatted += getSizeCommand(settings.priceSize ?? 0);
      formatted += ESC + 'E' + '\x01'; // Bold
      formatted += line + '\n';
      formatted += ESC + 'E' + '\x00'; // Bold off
      formatted += ESC + '!' + '\x00'; // Reset
    } 
    else if (line.includes('Thank you') || line.includes('thank you') || (i > lines.length - 10 && line.trim().length > 0 && !line.includes('=') && !line.includes('-'))) {
      // Footer - use footer size
      formatted += getSizeCommand(settings.footerSize ?? 0);
      formatted += line + '\n';
      formatted += ESC + '!' + '\x00'; // Reset
    } 
    else if (line.trim().length > 0 && !line.includes('---')) {
      // Regular item lines - use items size
      formatted += getSizeCommand(settings.itemsSize ?? 0);
      formatted += line + '\n';
      formatted += ESC + '!' + '\x00'; // Reset
    } 
    else {
      // Separators and empty lines
      formatted += ESC + '!' + '\x00'; // Normal
      formatted += line + '\n';
    }
  }
  
  // Cut paper if enabled
  if (settings.autoCut !== false) {
    formatted += '\n\n\n';
    formatted += GS + 'V' + '\x41' + '\x03'; // Partial cut
  }
  
  return formatted;
}
