import mongoose, { Schema, Model } from 'mongoose';
import { ISale } from '@/types';

const SalesSchema = new Schema<ISale>({
  productname: { type: String, required: true, index: true },
  productprice: { type: Schema.Types.Mixed, required: true },
  productquantity: { type: Schema.Types.Mixed, required: true },
  producttotal: { type: Schema.Types.Mixed, required: true },
  paymentmethod: { type: String, required: true, index: true },
  seller: { type: String, required: true, index: true },
  sharedid: { type: String, required: true, index: true },
  saledate: { type: String, required: true, index: true },
  saletype: { type: String, index: true },
  datentime: { type: String },
  regtime: { type: Date, default: Date.now, index: true },
  sale_no: { type: Number, required: true, unique: true },
  
  // NEW FIELDS for discount and customer
  discount: { type: Number, default: 0 },
  subtotal: { type: Number },
  customerName: { type: String, index: true },
  customerId: { type: String, index: true }
});

// Compound indexes for common queries
SalesSchema.index({ saledate: -1, seller: 1 });
SalesSchema.index({ seller: 1, saledate: -1 });
SalesSchema.index({ sharedid: 1, saledate: -1 });
SalesSchema.index({ sale_no: -1 });

const Sales: Model<ISale> = mongoose.models.Sales || mongoose.model<ISale>('Sales', SalesSchema);

export default Sales;
