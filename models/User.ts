import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '@/types';

const UserSchema = new Schema<IUser>({
  unique_id: { type: Number },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String },
  lastname: { type: String },
  phonenumber: { type: String },
  role: { type: String, enum: ['sadmin', 'admin', 'worker'], default: 'worker' },
  permissions: {
    canViewInventory: { type: Boolean, default: false },
    canManageInventory: { type: Boolean, default: false },
    canViewCustomers: { type: Boolean, default: false },
    canManageCustomers: { type: Boolean, default: false },
    canViewFinance: { type: Boolean, default: false },
    canManageFinance: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false }
  },
  city: { type: String },
  birthday: { type: Number },
  birthmonth: { type: Number },
  birthyear: { type: Number },
  gender: { type: String },
  country: { type: String },
  countrycode: { type: String },
  regtime: { type: Date, default: Date.now }
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
