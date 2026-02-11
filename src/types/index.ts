// Business Entity Types

export type BusinessCategory = 'Farmer' | 'Distributor' | 'Supplier';
export type SourceType = 'REGISTERED' | 'WEB_SCRAPE';
export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export interface BusinessEntity {
  id: string;
  name: string;
  category: BusinessCategory;
  products: string[];
  city: string;
  coordinates: Coordinates;
  contactInfo: ContactInfo;
  source: SourceType;
  verificationStatus: VerificationStatus;
  // Optional fields for additional metadata
  description?: string;
  registeredDate?: string;
  scrapedDate?: string;
  scrapedFrom?: string; // URL or source name for web-scraped entities
}

// Mock data for testing - 5 Registered + 5 Web Scraped businesses in Quezon City for Rice
export const mockBusinessEntities: BusinessEntity[] = [
  // REGISTERED BUSINESSES
  {
    id: 'BE-REG-001',
    name: 'Quezon City Rice Farmers Cooperative',
    category: 'Farmer',
    products: ['Rice', 'Organic Rice', 'Brown Rice'],
    city: 'Quezon City',
    coordinates: {
      lat: 14.6760,
      lng: 121.0437,
    },
    contactInfo: {
      email: 'info@qcricecoop.ph',
      phone: '+63 2 8234 5678',
      address: '123 Commonwealth Ave, Quezon City',
      website: 'https://qcricecoop.ph',
    },
    source: 'REGISTERED',
    verificationStatus: 'VERIFIED',
    description: 'Certified organic rice farmers cooperative serving Metro Manila',
    registeredDate: '2024-03-15',
  },
  {
    id: 'BE-REG-002',
    name: 'Metro Rice Distributors Inc.',
    category: 'Distributor',
    products: ['Rice', 'Jasmine Rice', 'Basmati Rice'],
    city: 'Quezon City',
    coordinates: {
      lat: 14.6500,
      lng: 121.0300,
    },
    contactInfo: {
      email: 'sales@metrorice.com.ph',
      phone: '+63 2 8345 6789',
      address: '456 Quezon Ave, Quezon City',
      website: 'https://metrorice.com.ph',
    },
    source: 'REGISTERED',
    verificationStatus: 'VERIFIED',
    description: 'Leading rice distributor in Metro Manila with 20+ years experience',
    registeredDate: '2024-01-20',
  },
  {
    id: 'BE-REG-003',
    name: 'QC Premium Rice Suppliers',
    category: 'Supplier',
    products: ['Rice', 'Premium Rice', 'Glutinous Rice'],
    city: 'Quezon City',
    coordinates: {
      lat: 14.6800,
      lng: 121.0500,
    },
    contactInfo: {
      email: 'orders@qcpremiumrice.ph',
      phone: '+63 2 8456 7890',
      address: '789 East Ave, Quezon City',
      website: 'https://qcpremiumrice.ph',
    },
    source: 'REGISTERED',
    verificationStatus: 'VERIFIED',
    description: 'Wholesale supplier of premium rice varieties',
    registeredDate: '2024-02-10',
  },
  {
    id: 'BE-REG-004',
    name: 'Golden Harvest Rice Farm',
    category: 'Farmer',
    products: ['Rice', 'White Rice', 'Red Rice'],
    city: 'Quezon City',
    coordinates: {
      lat: 14.6650,
      lng: 121.0600,
    },
    contactInfo: {
      email: 'contact@goldenharvestqc.ph',
      phone: '+63 2 8567 8901',
      address: '321 Mindanao Ave, Quezon City',
    },
    source: 'REGISTERED',
    verificationStatus: 'VERIFIED',
    description: 'Family-owned rice farm with sustainable farming practices',
    registeredDate: '2024-04-05',
  },
  {
    id: 'BE-REG-005',
    name: 'QC Rice Trading Hub',
    category: 'Distributor',
    products: ['Rice', 'Milled Rice', 'Parboiled Rice'],
    city: 'Quezon City',
    coordinates: {
      lat: 14.6400,
      lng: 121.0250,
    },
    contactInfo: {
      email: 'info@qcricehub.ph',
      phone: '+63 2 8678 9012',
      address: '555 Araneta Ave, Quezon City',
      website: 'https://qcricehub.ph',
    },
    source: 'REGISTERED',
    verificationStatus: 'VERIFIED',
    description: 'Central rice trading hub for bulk orders',
    registeredDate: '2024-05-12',
  },

  // WEB SCRAPED BUSINESSES
  {
    id: 'BE-WEB-001',
    name: 'Farmers Market Rice Stall - QC',
    category: 'Farmer',
    products: ['Rice', 'Local Rice'],
    city: 'Quezon City',
    coordinates: {
      lat: 14.6550,
      lng: 121.0350,
    },
    contactInfo: {
      phone: '+63 917 123 4567',
      address: 'Farmers Market, Cubao, Quezon City',
    },
    source: 'WEB_SCRAPE',
    verificationStatus: 'UNVERIFIED',
    description: 'Rice vendor at Farmers Market selling locally sourced rice',
    scrapedDate: '2026-02-08',
    scrapedFrom: 'https://farmersmarket-qc.com/vendors',
  },
  {
    id: 'BE-WEB-002',
    name: 'Rice Wholesale Center QC',
    category: 'Supplier',
    products: ['Rice', 'Bulk Rice'],
    city: 'Quezon City',
    coordinates: {
      lat: 14.6700,
      lng: 121.0450,
    },
    contactInfo: {
      phone: '+63 918 234 5678',
      address: 'Commonwealth Market, Quezon City',
    },
    source: 'WEB_SCRAPE',
    verificationStatus: 'UNVERIFIED',
    description: 'Wholesale rice supplier found in online directory',
    scrapedDate: '2026-02-09',
    scrapedFrom: 'https://yellowpages.ph/rice-suppliers',
  },
  {
    id: 'BE-WEB-003',
    name: 'QC Rice Merchant',
    category: 'Distributor',
    products: ['Rice', 'Thai Rice'],
    city: 'Quezon City',
    coordinates: {
      lat: 14.6600,
      lng: 121.0400,
    },
    contactInfo: {
      phone: '+63 919 345 6789',
    },
    source: 'WEB_SCRAPE',
    verificationStatus: 'UNVERIFIED',
    description: 'Rice merchant listed in local business directory',
    scrapedDate: '2026-02-07',
    scrapedFrom: 'https://localbusiness.ph/quezon-city/rice',
  },
  {
    id: 'BE-WEB-004',
    name: 'Balintawak Rice Dealer',
    category: 'Supplier',
    products: ['Rice', 'Commercial Rice'],
    city: 'Quezon City',
    coordinates: {
      lat: 14.6750,
      lng: 121.0380,
    },
    contactInfo: {
      address: 'Balintawak Market, Quezon City',
    },
    source: 'WEB_SCRAPE',
    verificationStatus: 'UNVERIFIED',
    description: 'Rice dealer found through market listings',
    scrapedDate: '2026-02-10',
    scrapedFrom: 'https://marketlistings.ph/balintawak',
  },
  {
    id: 'BE-WEB-005',
    name: 'North QC Rice Supply',
    category: 'Distributor',
    products: ['Rice', 'Imported Rice'],
    city: 'Quezon City',
    coordinates: {
      lat: 14.6850,
      lng: 121.0550,
    },
    contactInfo: {
      phone: '+63 920 456 7890',
      address: 'North Ave, Quezon City',
    },
    source: 'WEB_SCRAPE',
    verificationStatus: 'UNVERIFIED',
    description: 'Rice supplier discovered via web scraping',
    scrapedDate: '2026-02-06',
    scrapedFrom: 'https://suppliers-directory.ph',
  },
];

// Helper functions for filtering
export const getBusinessEntitiesBySource = (source: SourceType): BusinessEntity[] => {
  return mockBusinessEntities.filter(entity => entity.source === source);
};

export const getBusinessEntitiesByCity = (city: string): BusinessEntity[] => {
  return mockBusinessEntities.filter(entity => entity.city === city);
};

export const getBusinessEntitiesByProduct = (product: string): BusinessEntity[] => {
  return mockBusinessEntities.filter(entity => 
    entity.products.some(p => p.toLowerCase().includes(product.toLowerCase()))
  );
};

export const getBusinessEntitiesByCategory = (category: BusinessCategory): BusinessEntity[] => {
  return mockBusinessEntities.filter(entity => entity.category === category);
};

export const getVerifiedBusinessEntities = (): BusinessEntity[] => {
  return mockBusinessEntities.filter(entity => entity.verificationStatus === 'VERIFIED');
};

export const getUnverifiedBusinessEntities = (): BusinessEntity[] => {
  return mockBusinessEntities.filter(entity => entity.verificationStatus === 'UNVERIFIED');
};

// Complex filter function
export const filterBusinessEntities = (filters: {
  city?: string;
  product?: string;
  category?: BusinessCategory;
  source?: SourceType;
  verificationStatus?: VerificationStatus;
}): BusinessEntity[] => {
  return mockBusinessEntities.filter(entity => {
    if (filters.city && entity.city !== filters.city) return false;
    if (filters.product && !entity.products.some(p => p.toLowerCase().includes(filters.product!.toLowerCase()))) return false;
    if (filters.category && entity.category !== filters.category) return false;
    if (filters.source && entity.source !== filters.source) return false;
    if (filters.verificationStatus && entity.verificationStatus !== filters.verificationStatus) return false;
    return true;
  });
};
