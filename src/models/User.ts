import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'SUPPLIER';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  businessId?: mongoose.Types.ObjectId;
  isVerified: boolean;
  verificationToken?: string;
  tokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'SUPPLIER'],
      default: 'SUPPLIER',
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    tokenExpiry: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// ─── Pre-save: hash password if modified ─────────────────────────────────────

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance method: compare password ───────────────────────────────────────

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// ─── Model (guard against hot-reload re-registration) ────────────────────────

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema);

export default User;
