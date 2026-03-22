export interface ApiInventoryItem {
  itemName: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface ApiDedicatedInventoryItem {
  _id: string;
  itemName: string;
  quantity: number;
  unit: string;
  price: number;
  lastUpdated: string;
}

export type EntityType = 'MANUFACTURER' | 'LOGISTICS' | 'WAREHOUSE' | 'AGRICULTURE' | 'DISTRIBUTOR' | 'SUPPLIER' | 'FARMER' | 'PROCESSOR';
export type BusinessStatus = 'PENDING' | 'VERIFIED' | 'FEATURED';

export interface ApiSupplier {
  _id: string;
  businessName: string;
  description?: string;
  location: string;
  isVerified: boolean;
  entityType: EntityType[];
  status: BusinessStatus;
  industry: string;
  productCategory?: string;
  contactEmail?: string;
  contactPhone?: string;
  inventory: ApiInventoryItem[];
  dedicatedInventory: ApiDedicatedInventoryItem[];
  specialties: string[];
  logoUrl?: string;
  latitude?: number;
  longitude?: number;
  markerEmoji?: string;
  createdAt?: string;
  updatedAt?: string;
  isExternal?: boolean;
}
