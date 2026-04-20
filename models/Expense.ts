import mongoose, { Schema, Model } from 'mongoose';

export interface IExpense {
  _id?: string;
  description: string;
  amount: number;
  category: string;
  expenseDate: string;
  paymentMethod: string;
  addedBy: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  expenseDate: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  addedBy: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
