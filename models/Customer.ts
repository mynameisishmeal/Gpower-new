import mongoose, { Schema, Model } from 'mongoose';
import { ICustomer } from '@/types';

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  totalPurchases: { type: Number, default: 0 },
  lastPurchaseDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Index for fast search
CustomerSchema.index({ name: 'text' });

const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
