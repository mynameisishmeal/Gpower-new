// User Types
export interface IUser {
  _id?: string;
  unique_id?: number;
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  phonenumber?: string;
  role: 'sadmin' | 'admin' | 'worker';
  city?: string;
  birthday?: number;
  birthmonth?: number;
  birthyear?: number;
  gender?: string;
  country?: string;
  countrycode?: string;
  regtime?: Date;
}

// Stock Types
export interface IStock {
  _id?: string;
  stockname: string;
  email?: string;
  stockprice: number;
  stockquantity: number;
  stockweight: number;
  regtime?: Date;
}

// Product Types (Kilo products)
export interface IProduct {
  _id?: string;
  unique_id?: number;
  email?: string;
  productname: string;
  productprice: number;
  productquantity?: number;
  productweight: number;
  regtime?: Date;
}

// Payment Method Types
export interface IPaymentMethod {
  method: 'cash' | 'transfer' | 'card' | 'credit';
  amount: number;
}

// Sale Types (NEW - with discount and customer)
export interface ISale {
  _id?: string;
  productname: string;
  productprice: string | number;
  productquantity: string | number;
  producttotal: string | number;
  paymentmethod: string;
  seller: string;
  sharedid: string;
  saledate: string;
  saletype: 'Kilos' | 'Cartons' | string;
  datentime: string;
  regtime?: Date;
  sale_no: number;
  
  // NEW FIELDS
  discount?: number;           // Discount amount
  subtotal?: number;           // Amount before discount
  customerName?: string;       // Customer name (optional)
  customerId?: string;         // For repeat customers
}

// Customer Types (NEW)
export interface ICustomer {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalPurchases?: number;
  lastPurchaseDate?: Date;
  createdAt?: Date;
}

// Printer Types
export interface IPrinter {
  _id?: string;
  email: string;
  serviceUUID?: string;
  characteristicUUID?: string;
  printerName?: string;
  printerType?: 'bluetooth' | 'wired' | 'network';
}

// Session Types
export interface ISession {
  user: {
    id: string;
    email: string;
    role: string;
    firstname?: string;
    lastname?: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Sales Summary Types
export interface ISalesSummary {
  totalSales: number;
  totalDiscount: number;
  netSales: number;
  transactionCount: number;
  averageTransaction: number;
  topProducts: Array<{
    productname: string;
    quantity: number;
    revenue: number;
  }>;
}
