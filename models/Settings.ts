import mongoose, { Schema, Model } from 'mongoose';

export interface ISettings {
  _id?: string;
  storeName: string;
  storeLogo?: string;
  storeAddress?: string;
  receiptFooter?: string;
  receiptDisclaimer?: string;
  lowStockThreshold: number;
  inventoryAlertsEnabled: boolean;
  saleAlertsEnabled: boolean;
  alertEmail?: string;
  alertTelegram?: string;
  // Receipt text sizes (0=normal, 1=double width, 2=double height, 3=double both)
  headerTextSize?: number;
  storeNameSize?: number;
  addressSize?: number;
  itemsSize?: number;
  priceSize?: number;
  totalSize?: number;
  footerSize?: number;
  // Receipt formatting
  paperWidth?: number; // 58mm or 80mm
  showLogo?: boolean;
  showDateTime?: boolean;
  showSeller?: boolean;
  showCustomer?: boolean;
  showDiscount?: boolean;
  showPaymentMethod?: boolean;
  autoCut?: boolean;
  lineSpacing?: number; // 0=tight, 1=normal, 2=loose
  createdAt?: Date;
  updatedAt?: Date;
}

const SettingsSchema = new Schema<ISettings>({
  storeName: { type: String, required: true, default: 'GPOWER CRM' },
  storeLogo: { type: String },
  storeAddress: { type: String },
  receiptFooter: { type: String, default: 'Thank you!' },
  receiptDisclaimer: { type: String },
  lowStockThreshold: { type: Number, default: 10 },
  inventoryAlertsEnabled: { type: Boolean, default: false },
  saleAlertsEnabled: { type: Boolean, default: false },
  alertEmail: { type: String },
  alertTelegram: { type: String },
  // Receipt customization
  headerTextSize: { type: Number, default: 1 },
  storeNameSize: { type: Number, default: 3 },
  addressSize: { type: Number, default: 0 },
  itemsSize: { type: Number, default: 0 },
  priceSize: { type: Number, default: 0 },
  totalSize: { type: Number, default: 2 },
  footerSize: { type: Number, default: 0 },
  paperWidth: { type: Number, default: 58 },
  showLogo: { type: Boolean, default: false },
  showDateTime: { type: Boolean, default: true },
  showSeller: { type: Boolean, default: true },
  showCustomer: { type: Boolean, default: true },
  showDiscount: { type: Boolean, default: true },
  showPaymentMethod: { type: Boolean, default: true },
  autoCut: { type: Boolean, default: true },
  lineSpacing: { type: Number, default: 1 },
}, { timestamps: true });

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
