import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interface ────────────────────────────────────────────────────────────────

export type SurplusCondition = 'Overripe' | 'Surplus' | 'B-Grade' | 'Damaged Packaging' | 'Near Expiry' | 'Other';

export interface ISurplus extends Document {
  ownerId: mongoose.Types.ObjectId;
  ownerName: string;
  ownerLocation: string;
  productName: string;
  quantity: number;
  unit: string;
  condition: SurplusCondition;
  description?: string;
  price: number;
  isFree: boolean;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const SurplusSchema = new Schema<ISurplus>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerLocation: {
      type: String,
      required: true,
      trim: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    condition: {
      type: String,
      enum: ['Overripe', 'Surplus', 'B-Grade', 'Damaged Packaging', 'Near Expiry', 'Other'],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

SurplusSchema.index({ ownerId: 1, isAvailable: 1 });
SurplusSchema.index({ isAvailable: 1, createdAt: -1 });

// ─── Model guard ──────────────────────────────────────────────────────────────

const Surplus: Model<ISurplus> =
  mongoose.models.Surplus ?? mongoose.model<ISurplus>('Surplus', SurplusSchema);

export default Surplus;
