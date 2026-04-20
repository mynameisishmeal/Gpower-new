import mongoose, { Schema, Model } from 'mongoose';
import { IStock } from '@/types';

const StockSchema = new Schema<IStock>({
  stockname: { type: String, required: true },
  email: { type: String },
  stockprice: { type: Number, required: true },
  stockquantity: { type: Number, required: true },
  stockweight: { type: Number, required: true },
  regtime: { type: Date, default: Date.now }
});

const Stock: Model<IStock> = mongoose.models.Stock || mongoose.model<IStock>('Stock', StockSchema);

export default Stock;
