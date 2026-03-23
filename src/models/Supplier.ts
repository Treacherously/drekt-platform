import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── Sub-document interfaces ──────────────────────────────────────────────────

export interface IInventoryItem {
  itemName: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface IProductItem {
  name: string;
  price: number;
  mockQuantity: number;
  stockStatus: 'High' | 'Medium' | 'Low';
}

export interface IDedicatedInventoryItem {
  _id: mongoose.Types.ObjectId;
  itemName: string;
  quantity: number;
  unit: string;
  price: number;
  lastUpdated: Date;
}

export interface IGeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// ─── Main interface ───────────────────────────────────────────────────────────

export type EntityType = 'MANUFACTURER' | 'LOGISTICS' | 'WAREHOUSE' | 'AGRICULTURE' | 'DISTRIBUTOR' | 'SUPPLIER' | 'FARMER' | 'PROCESSOR';
export type BusinessStatus = 'PENDING' | 'VERIFIED' | 'FEATURED';

export interface ISupplier extends Document {
  businessName: string;
  description?: string;
  location: string;
  geoLocation?: IGeoLocation;
  isVerified: boolean;
  entityType: EntityType[];
  status: BusinessStatus;
  industry: string;
  productCategory?: string;
  contactEmail?: string;
  contactPhone?: string;
  inventory: IInventoryItem[];
  dedicatedInventory: IDedicatedInventoryItem[];
  products: IProductItem[];
  specialties: string[];
  logoUrl: string;
  latitude?: number;
  longitude?: number;
  markerEmoji?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const InventoryItemSchema = new Schema<IInventoryItem>(
  {
    itemName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const DedicatedInventoryItemSchema = new Schema<IDedicatedInventoryItem>(
  {
    itemName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    lastUpdated: { type: Date, default: Date.now },
  }
);

const ProductItemSchema = new Schema<IProductItem>(
  {
    name:          { type: String, required: true, trim: true },
    price:         { type: Number, required: true, min: 0 },
    mockQuantity:  { type: Number, required: true, min: 0 },
    stockStatus:   { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  },
  { _id: false }
);

const GeoLocationSchema = new Schema<IGeoLocation>(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

// ─── Main schema ──────────────────────────────────────────────────────────────

const SupplierSchema = new Schema<ISupplier>(
  {
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    geoLocation: {
      type: GeoLocationSchema,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    entityType: {
      type: [String],
      enum: ['MANUFACTURER', 'LOGISTICS', 'WAREHOUSE', 'AGRICULTURE', 'DISTRIBUTOR', 'SUPPLIER', 'FARMER', 'PROCESSOR'],
      default: [],
    },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'FEATURED'],
      default: 'PENDING',
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    productCategory: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    inventory: {
      type: [InventoryItemSchema],
      default: [],
    },
    products: {
      type: [ProductItemSchema],
      default: [],
    },
    dedicatedInventory: {
      type: [DedicatedInventoryItemSchema],
      default: [],
    },
    specialties: {
      type: [String],
      default: [],
    },
    logoUrl: {
      type: String,
      default: '',
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    markerEmoji: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

SupplierSchema.index({ geoLocation: '2dsphere' });
SupplierSchema.index({ industry: 1, isVerified: 1 });
SupplierSchema.index({ status: 1, entityType: 1 });
SupplierSchema.index({ businessName: 'text', description: 'text' });

// ─── Model (guard against hot-reload re-registration) ────────────────────────

const Supplier: Model<ISupplier> =
  mongoose.models.Supplier ?? mongoose.model<ISupplier>('Supplier', SupplierSchema);

export default Supplier;
