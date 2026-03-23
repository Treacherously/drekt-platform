import { readFileSync } from 'fs';
import { resolve } from 'path';
import mongoose from 'mongoose';
import Supplier, { EntityType } from '../models/Supplier';

// ── Load .env.local without requiring dotenv package ─────────────────────────
try {
  const envContent = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch {
  console.warn('⚠  Could not load .env.local — ensure MONGODB_URI is set in environment.');
}

// ── Outscraper record shape ───────────────────────────────────────────────────

interface OutscraperRecord {
  name?: string;
  type?: string;
  subtypes?: string;
  category?: string;
  city?: string;
  state?: string;
  full_address?: string;
  address?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  about?: unknown;
  description?: unknown;
  [key: string]: unknown;
}

// ── Classification helpers ────────────────────────────────────────────────────

function classify(text: string): { entityType: EntityType; industry: string } {
  const t = text.toLowerCase();

  let entityType: EntityType = 'SUPPLIER';
  if (/logistic|freight|deliver|courier|transport/.test(t))        entityType = 'LOGISTICS';
  else if (/warehouse|storage|cold.?chain|cold.?storage/.test(t)) entityType = 'WAREHOUSE';
  else if (/farm|agricultur|crop|fish|poultry|livestock/.test(t)) entityType = 'AGRICULTURE';
  else if (/manufactur|factory|production|processing/.test(t))    entityType = 'MANUFACTURER';
  else if (/distributor|distribution|wholesale/.test(t))          entityType = 'DISTRIBUTOR';

  let industry = 'Other';
  if (/food|beverage|restaurant|cater|baker|grocer/.test(t))      industry = 'Food & Beverage';
  else if (/farm|agricultur|crop|fish|poultry|livestock/.test(t)) industry = 'Agriculture & Farming';
  else if (/packag/.test(t))                                       industry = 'Packaging';
  else if (/chemic/.test(t))                                       industry = 'Chemicals';
  else if (/logistic|freight|deliver|courier|transport/.test(t))  industry = 'Logistics & Freight';
  else if (/warehouse|storage/.test(t))                           industry = 'Warehousing & Storage';
  else if (/textile|apparel|garment|cloth|fashion/.test(t))       industry = 'Textiles & Apparel';
  else if (/construct|building|cement|hardware/.test(t))          industry = 'Construction Materials';
  else if (/pharma|medical|medicine|health|drug/.test(t))         industry = 'Pharmaceuticals';
  else if (/electron|electric|technolog/.test(t))                 industry = 'Electronics';
  else if (/retail|distribution|wholesale|distributor/.test(t))   industry = 'Retail & Distribution';

  return { entityType, industry };
}

// ── Organic description templates ────────────────────────────────────────────

function generateOrganicDescription(name: string, industry: string, location: string): string {
  if (/\bwater\b|purified|distilled|drinking\s*water|hydration/i.test(name)) {
    const templates = [
      `${name} provides safe, purified, and high-quality hydration solutions from ${location}, supporting B2B requirements for consistent drinking water supply and distribution.`,
      `Based in ${location}, ${name} delivers safe, purified, and high-quality hydration solutions with dependable fulfillment for businesses, events, and institutional partners.`,
      `${name} is a verified water supplier in ${location}, offering safe, purified, and high-quality hydration solutions designed for scalable B2B supply needs.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  const templates = [
    `${name} is a trusted ${industry} provider strategically located in ${location}, offering reliable B2B solutions and scalable operations.`,
    `Serving the ${location} region, ${name} specializes in professional ${industry} services with a strong commitment to quality and supply chain efficiency.`,
    `Operating out of ${location}, this verified ${industry} facility provides comprehensive support for enterprise and MSME clients alike.`,
    `As a premier ${industry} entity in ${location}, ${name} focuses on delivering high-capacity, dependable services to meet growing market demands.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// ── Mock inventory pools (broad keyword-resolved categories) ─────────────────

type ProductSeed = { itemName: string; unit: string; basePrice: number };

const INVENTORY_POOLS: Record<string, ProductSeed[]> = {
  'water_beverage': [
    { itemName: 'Purified Drinking Water (350mL)', unit: 'bottle', basePrice: 10 },
    { itemName: 'Purified Drinking Water (500mL)', unit: 'bottle', basePrice: 15 },
    { itemName: 'Purified Drinking Water (1000mL)', unit: 'bottle', basePrice: 25 },
    { itemName: 'Distilled Water (6L Gallon)', unit: 'gallon', basePrice: 95 },
  ],
  'logistics_warehousing': [
    { itemName: 'Pallet Storage (per slot)',      unit: 'slot',  basePrice: 850   },
    { itemName: 'Cold Storage Bay',              unit: 'bay',   basePrice: 1200  },
    { itemName: 'Freight Forwarding (per kg)',   unit: 'kg',    basePrice: 14    },
    { itemName: '10-wheeler Truck Rental',       unit: 'trip',  basePrice: 8500  },
    { itemName: 'Container Hauling',          unit: 'trip',     basePrice: 15000 },
    { itemName: 'Racked Storage Tier',        unit: 'tier/mo',  basePrice: 600   },
    { itemName: 'Last-Mile Delivery',         unit: 'parcel',   basePrice: 85    },
  ],
  'packaging': [
    { itemName: 'Corrugated Carton 12x10x8', unit: 'piece',  basePrice: 28  },
    { itemName: 'Industrial Shrink Wrap',    unit: 'roll',   basePrice: 420 },
    { itemName: 'PET Bottle 500mL (x100)',   unit: 'bundle', basePrice: 650 },
    { itemName: 'Kraft Paper Bag (x100)',    unit: 'bundle', basePrice: 420 },
    { itemName: 'Bubble Wrap Roll (50m)',    unit: 'roll',   basePrice: 290 },
    { itemName: 'Plastic Strap (per kg)',    unit: 'kg',     basePrice: 95  },
  ],
  'manufacturing': [
    { itemName: 'Raw Steel Components',     unit: 'kg',    basePrice: 85   },
    { itemName: 'Industrial Fasteners',     unit: 'box',   basePrice: 350  },
    { itemName: 'Custom Machined Parts',    unit: 'piece', basePrice: 1200 },
    { itemName: 'Aluminium Extrusion (6m)', unit: 'length',basePrice: 950  },
    { itemName: 'Industrial Lubricant (1L)',unit: 'bottle',basePrice: 280  },
    { itemName: 'Sheet Metal Panel',        unit: 'sheet', basePrice: 480  },
  ],
  'food_agriculture': [
    { itemName: 'Bulk Raw Ingredients (50kg)', unit: 'sack',      basePrice: 2200 },
    { itemName: 'Processed Food Pallet',       unit: 'pallet',    basePrice: 12000},
    { itemName: 'Organic Fertilizer Sack',     unit: 'bag',       basePrice: 1100 },
    { itemName: 'Cooking Oil (18L)',            unit: 'container', basePrice: 1600 },
    { itemName: 'Hybrid Corn Seeds (5kg)',      unit: 'pack',      basePrice: 750  },
    { itemName: 'Bottled Water 500mL x24',     unit: 'case',      basePrice: 320  },
    { itemName: 'Pesticide Concentrate (1L)',  unit: 'bottle',    basePrice: 480  },
  ],
  'textile_garments': [
    { itemName: 'Bulk Cotton Rolls',           unit: 'roll',  basePrice: 1800 },
    { itemName: 'Synthetic Fabrics (per meter)',unit: 'meter', basePrice: 95   },
    { itemName: 'Wholesale Apparel Lot',       unit: 'lot',   basePrice: 8500 },
    { itemName: 'Polyester Thread (1000m)',    unit: 'spool', basePrice: 55   },
    { itemName: 'Denim Fabric (per meter)',    unit: 'meter', basePrice: 140  },
    { itemName: 'Non-woven Fabric (50m roll)',unit: 'roll',  basePrice: 950  },
  ],
  'construction_hardware': [
    { itemName: 'Lumber Pallet (Assorted)',       unit: 'pallet', basePrice: 5500 },
    { itemName: 'Portland Cement Bag (40kg)',     unit: 'bag',    basePrice: 280  },
    { itemName: 'Wholesale Plumbing Fixtures Set',unit: 'set',    basePrice: 3200 },
    { itemName: 'Deformed Bar 10mm (6m)',         unit: 'piece',  basePrice: 350  },
    { itemName: 'GI Roof Sheet (10ft)',           unit: 'sheet',  basePrice: 420  },
    { itemName: 'Hollow Block 4"',               unit: 'piece',  basePrice: 18   },
  ],
  'default': [
    { itemName: 'Standard B2B Wholesale Batch', unit: 'batch', basePrice: 4500 },
    { itemName: 'Premium Bulk Inventory Lot',   unit: 'lot',   basePrice: 8000 },
    { itemName: 'Custom Service Retainer',      unit: 'mo',    basePrice: 6000 },
    { itemName: 'General Supply Package',       unit: 'lot',   basePrice: 2000 },
    { itemName: 'Equipment Rental (daily)',     unit: 'day',   basePrice: 3500 },
  ],
};

function resolveInventoryPool(industry: string): ProductSeed[] {
  const t = industry.toLowerCase().trim();
  if (/\bwater\b|purified|distilled|drinking\s*water|hydration/.test(t))
    return INVENTORY_POOLS['water_beverage'];
  if (/logistic|freight|deliver|courier|transport|warehouse|storage|cold.?chain/.test(t))
    return INVENTORY_POOLS['logistics_warehousing'];
  if (/packag|carton|bottle|shrink|wrap|corrugat/.test(t))
    return INVENTORY_POOLS['packaging'];
  if (/manufactur|industrial|machined|metal|steel|fabricat|assembly|processing/.test(t))
    return INVENTORY_POOLS['manufacturing'];
  if (/food|beverage|agricultur|farm|crop|organic|ingredient|fish|poultry|livestock/.test(t))
    return INVENTORY_POOLS['food_agriculture'];
  if (/textile|garment|apparel|fabric|cloth|fashion|sewing/.test(t))
    return INVENTORY_POOLS['textile_garments'];
  if (/construct|hardware|lumber|cement|plumbing|building|material/.test(t))
    return INVENTORY_POOLS['construction_hardware'];
  return INVENTORY_POOLS['default'];
}

function generateMockInventory(poolHint: string) {
  const pool  = resolveInventoryPool(poolHint);
  const count = 2 + Math.floor(Math.random() * 4); // 2–5 items
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((p) => ({
    itemName: p.itemName,
    unit:     p.unit,
    price:    +(p.basePrice * (0.85 + Math.random() * 0.3)).toFixed(2),
    quantity: 10 + Math.floor(Math.random() * 990),
  }));
}

function generateMockProducts(poolHint: string) {
  const pool  = resolveInventoryPool(poolHint);
  const count = 2 + Math.floor(Math.random() * 4); // 2–5 items
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((p) => {
    const mockQuantity = 10 + Math.floor(Math.random() * 991); // 10–1000
    const stockStatus: 'High' | 'Medium' | 'Low' =
      mockQuantity >= 200 ? 'High' : mockQuantity >= 50 ? 'Medium' : 'Low';
    return {
      name:         p.itemName,
      price:        +(p.basePrice * (0.85 + Math.random() * 0.3)).toFixed(2),
      mockQuantity,
      stockStatus,
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeString = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val.trim();
  if (Array.isArray(val)) return val.map((v) => String(v)).join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val).trim();
};

function mapRecord(row: OutscraperRecord) {
  const typeStr   = [row.type, row.subtypes, row.category].map(safeString).filter(Boolean).join(' ');
  const { entityType, industry } = classify(typeStr || 'supplier');
  const businessName = safeString(row.name);
  const lat       = typeof row.latitude  === 'number' ? row.latitude  : undefined;
  const lng       = typeof row.longitude === 'number' ? row.longitude : undefined;
  const location  = [row.city, row.state].map(safeString).filter(Boolean).join(', ') || 'Philippines';
  const addressNote = safeString(row.full_address || row.address);
  const description = safeString(row.about)
    || safeString(row.description)
    || generateOrganicDescription(businessName, industry, location);

  // Include business name in pool resolution so Water suppliers don't get food staples.
  const poolHint = `${industry} ${businessName}`;

  return {
    businessName:        businessName,
    description:         description.trim(),
    location,
    industry,
    entityType:          [entityType],
    status:              'VERIFIED' as const,
    isVerified:          true,
    contactPhone:        safeString(row.phone),
    contactEmail:        safeString(row.email),
    latitude:            lat,
    longitude:           lng,
    geoLocation:
      lat !== undefined && lng !== undefined
        ? { type: 'Point' as const, coordinates: [lng, lat] as [number, number] }
        : undefined,
    markerEmoji:         '📍',
    inventory:           generateMockInventory(poolHint),
    products:            generateMockProducts(poolHint),
    dedicatedInventory:  [],
    specialties:         [],
    logoUrl:             '',
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌  MONGODB_URI is not defined. Aborting.');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(mongoUri, { bufferCommands: false, family: 4 });
  console.log('✅ Connected.\n');

  const filePath = resolve(
    process.cwd(),
    'src/data/Outscraper-20260323153146s5e_warehouse_+6.json'
  );
  console.log(`📂 Reading: ${filePath}`);
  const raw: OutscraperRecord[] = JSON.parse(readFileSync(filePath, 'utf-8'));
  console.log(`📦 Total records in file : ${raw.length}`);

  const valid = raw.filter((r) => r.name?.trim());
  console.log(`✔  Valid (named) records : ${valid.length}\n`);

  const ops = valid.map((row) => {
    const doc = mapRecord(row);
    return {
      updateOne: {
        filter: { businessName: doc.businessName },
        update: { $set: doc },
        upsert: true,
      },
    };
  });

  console.log('💾 Running bulkWrite...');
  const result = await Supplier.bulkWrite(ops, { ordered: false });

  const inserted = result.upsertedCount  ?? 0;
  const updated  = result.modifiedCount  ?? 0;
  const matched  = result.matchedCount   ?? 0;

  console.log('\n✅ Import complete!');
  console.log(`   🆕 New records inserted     : ${inserted}`);
  console.log(`   🔄 Existing records updated  : ${updated}`);
  console.log(`   ✔  Matched (no change)       : ${matched - updated}`);

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected. Done.');
}

main().catch((err) => {
  console.error('❌ Seeder failed:', err);
  process.exit(1);
});
