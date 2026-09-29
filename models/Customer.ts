import mongoose, { Schema, Model } from 'mongoose';
import { ICustomer } from '@/types';

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true, index: true },
  email: { type: String, index: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  address: { type: String },
  totalPurchases: { type: Number, default: 0 },
  lastPurchaseDate: { type: Date, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Text index for fast search
CustomerSchema.index({ name: 'text', email: 'text' });
// Compound index for common queries
CustomerSchema.index({ name: 1, createdAt: -1 });
// Case-insensitive unique index for name
CustomerSchema.index({ name: 1 }, { 
  unique: true, 
  collation: { locale: 'en', strength: 2 } 
});

const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
