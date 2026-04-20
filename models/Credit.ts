import mongoose, { Schema, Model } from 'mongoose';

export interface ICredit {
  _id?: string;
  customerId: string;
  customerName: string;
  saleId: string;
  amount: number;
  amountPaid: number;
  amountRemaining: number;
  status: 'pending' | 'partial' | 'paid';
  saleDate: string;
  dueDate?: string;
  payments: {
    amount: number;
    paymentDate: string;
    paymentMethod: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const CreditSchema = new Schema<ICredit>({
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  saleId: { type: String, required: true },
  amount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  amountRemaining: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  saleDate: { type: String, required: true },
  dueDate: { type: String },
  payments: [{
    amount: { type: Number, required: true },
    paymentDate: { type: String, required: true },
    paymentMethod: { type: String, required: true }
  }]
}, { timestamps: true });

const Credit: Model<ICredit> = mongoose.models.Credit || mongoose.model<ICredit>('Credit', CreditSchema);

export default Credit;
