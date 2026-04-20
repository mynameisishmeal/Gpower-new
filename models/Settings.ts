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
}, { timestamps: true });

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
