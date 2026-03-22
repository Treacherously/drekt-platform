import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Interface ────────────────────────────────────────────────────────────────

export type InquiryStatus = 'PENDING' | 'READ';

export interface IInquiry extends Document {
  businessId: mongoose.Types.ObjectId;
  businessName: string;
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  message: string;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const InquirySchema = new Schema<IInquiry>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'businessId is required'],
    },
    businessName: {
      type: String,
      required: [true, 'businessName is required'],
      trim: true,
    },
    senderName: {
      type: String,
      required: [true, 'senderName is required'],
      trim: true,
    },
    senderEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    senderPhone: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'READ'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

InquirySchema.index({ businessId: 1, createdAt: -1 });
InquirySchema.index({ status: 1 });

// ─── Model (guard against hot-reload re-registration) ────────────────────────

const Inquiry: Model<IInquiry> =
  mongoose.models.Inquiry ?? mongoose.model<IInquiry>('Inquiry', InquirySchema);

export default Inquiry;
