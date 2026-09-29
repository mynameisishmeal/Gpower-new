import mongoose, { Schema, Model } from 'mongoose';
import { IProduct } from '@/types';

const ProductSchema = new Schema<IProduct>({
  unique_id: { type: Number },
  email: { type: String },
  productname: { type: String, required: true, index: true },
  productprice: { type: Number, required: true },
  productquantity: { type: Number, default: 0 },
  productweight: { type: Number, required: true },
  regtime: { type: Date, default: Date.now, index: true }
});

// Create compound index
ProductSchema.index({ productname: 1, regtime: -1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
