import mongoose, { Schema, Model } from 'mongoose';
import { ISale } from '@/types';

const SalesSchema = new Schema<ISale>({
  productname: { type: String, required: true },
  productprice: { type: Schema.Types.Mixed, required: true },
  productquantity: { type: Schema.Types.Mixed, required: true },
  producttotal: { type: Schema.Types.Mixed, required: true },
  paymentmethod: { type: String, required: true },
  seller: { type: String, required: true },
  sharedid: { type: String, required: true },
  saledate: { type: String, required: true },
  saletype: { type: String },
  datentime: { type: String },
  regtime: { type: Date, default: Date.now },
  sale_no: { type: Number, required: true },
  
  // NEW FIELDS for discount and customer
  discount: { type: Number, default: 0 },
  subtotal: { type: Number },
  customerName: { type: String },
  customerId: { type: String }
});

const Sales: Model<ISale> = mongoose.models.Sales || mongoose.model<ISale>('Sales', SalesSchema);

export default Sales;
