import { readFileSync } from 'fs';
import { resolve } from 'path';
import mongoose from 'mongoose';
import Supplier from '../models/Supplier';

// ── Load .env.local without requiring dotenv ──────────────────────────────────
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
    `${name} is a verified ${industry} provider located in ${location}, offering scalable B2B solutions to enterprises and MSMEs across the Philippines.`,
    `Based in ${location}, ${name} delivers professional ${industry} services with a focus on reliability, capacity, and supply chain excellence.`,
    `${name} operates as a leading ${industry} entity in ${location}, providing end-to-end logistics and procurement support for growing businesses.`,
    `Trusted by local and regional partners, ${name} in ${location} specializes in ${industry} operations backed by years of industry expertise.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// ── Dirty description detector ────────────────────────────────────────────────

function isDescriptionDirty(desc: string | undefined | null): boolean {
  if (!desc || desc.trim().length < 20) return true;
  if (desc.includes('{"') || desc.includes('["')) return true;
  if (/^\s*[\[{]/.test(desc)) return true;
  return false;
}

// ── Mock product pool keyed by industry ──────────────────────────────────────

type ProductSeed = { name: string; basePrice: number };

const PRODUCT_POOLS: Record<string, ProductSeed[]> = {
  'water_beverage': [
    { name: 'Purified Drinking Water (350mL)', basePrice: 10 },
    { name: 'Purified Drinking Water (500mL)', basePrice: 15 },
    { name: 'Purified Drinking Water (1000mL)', basePrice: 25 },
    { name: 'Distilled Water (6L Gallon)', basePrice: 95 },
  ],
  'logistics_warehousing': [
    { name: 'Pallet Storage (per slot)',   basePrice: 850   },
    { name: 'Cold Storage Bay',            basePrice: 1200  },
    { name: 'Freight Forwarding (per kg)', basePrice: 14    },
    { name: '10-wheeler Truck Rental',     basePrice: 8500  },
    { name: 'Container Hauling',           basePrice: 15000 },
    { name: 'Racked Storage Tier',         basePrice: 600   },
    { name: 'Last-Mile Delivery',          basePrice: 85    },
  ],
  'packaging': [
    { name: 'Corrugated Cartons',          basePrice: 28  },
    { name: 'Industrial Shrink Wrap',      basePrice: 420 },
    { name: 'PET Bottles 500mL (x100)',    basePrice: 650 },
    { name: 'Kraft Paper Bags (x100)',     basePrice: 420 },
    { name: 'Bubble Wrap Roll (50m)',      basePrice: 290 },
    { name: 'Plastic Strap (per kg)',      basePrice: 95  },
  ],
  'manufacturing': [
    { name: 'Raw Steel Components',        basePrice: 85   },
    { name: 'Industrial Fasteners',        basePrice: 350  },
    { name: 'Custom Machined Parts',       basePrice: 1200 },
    { name: 'Aluminium Extrusion (6m)',    basePrice: 950  },
    { name: 'Industrial Lubricant (1L)',   basePrice: 280  },
    { name: 'Sheet Metal Panel',           basePrice: 480  },
  ],
  'food_agriculture': [
    { name: 'Bulk Raw Ingredients (50kg)', basePrice: 2200  },
    { name: 'Processed Food Pallet',       basePrice: 12000 },
    { name: 'Organic Fertilizer Sacks',    basePrice: 1100  },
    { name: 'Cooking Oil (18L)',           basePrice: 1600  },
    { name: 'Hybrid Corn Seeds (5kg)',     basePrice: 750   },
    { name: 'Pesticide Concentrate (1L)', basePrice: 480   },
  ],
  'textile_garments': [
    { name: 'Bulk Cotton Rolls',            basePrice: 1800 },
    { name: 'Synthetic Fabrics (per meter)',basePrice: 95   },
    { name: 'Wholesale Apparel Lot',        basePrice: 8500 },
    { name: 'Polyester Thread (1000m)',     basePrice: 55   },
    { name: 'Denim Fabric (per meter)',     basePrice: 140  },
    { name: 'Non-woven Fabric (50m roll)', basePrice: 950  },
  ],
  'construction_hardware': [
    { name: 'Lumber Pallets (Assorted)',        basePrice: 5500 },
    { name: 'Portland Cement Bags (40kg)',      basePrice: 280  },
    { name: 'Wholesale Plumbing Fixtures Set',  basePrice: 3200 },
    { name: 'Deformed Bar 10mm (6m)',           basePrice: 350  },
    { name: 'GI Roof Sheet (10ft)',             basePrice: 420  },
    { name: 'Hollow Block 4"',                 basePrice: 18   },
  ],
  'default': [
    { name: 'Standard B2B Wholesale Batch', basePrice: 4500 },
    { name: 'Premium Bulk Inventory Lot',   basePrice: 8000 },
    { name: 'Custom Service Retainer',      basePrice: 6000 },
    { name: 'General Supply Package',       basePrice: 2000 },
    { name: 'Equipment Rental (daily)',     basePrice: 3500 },
  ],
};

function resolveProductPool(industry: string): ProductSeed[] {
  const t = industry.toLowerCase().trim();
  if (/\bwater\b|purified|distilled|drinking\s*water|hydration/.test(t))
    return PRODUCT_POOLS['water_beverage'];
  if (/logistic|freight|deliver|courier|transport|warehouse|storage|cold.?chain/.test(t))
    return PRODUCT_POOLS['logistics_warehousing'];
  if (/packag|carton|bottle|shrink|wrap|corrugat/.test(t))
    return PRODUCT_POOLS['packaging'];
  if (/manufactur|industrial|machined|metal|steel|fabricat|assembly|processing/.test(t))
    return PRODUCT_POOLS['manufacturing'];
  if (/food|beverage|agricultur|farm|crop|organic|ingredient|fish|poultry|livestock/.test(t))
    return PRODUCT_POOLS['food_agriculture'];
  if (/textile|garment|apparel|fabric|cloth|fashion|sewing/.test(t))
    return PRODUCT_POOLS['textile_garments'];
  if (/construct|hardware|lumber|cement|plumbing|building|material/.test(t))
    return PRODUCT_POOLS['construction_hardware'];
  return PRODUCT_POOLS['default'];
}

function generateMockProducts(industry: string) {
  const pool  = resolveProductPool(industry);
  const count = 2 + Math.floor(Math.random() * 4); // 2–5 items
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((p) => {
    const mockQuantity = 10 + Math.floor(Math.random() * 991); // 10–1000
    const stockStatus: 'High' | 'Medium' | 'Low' =
      mockQuantity >= 200 ? 'High' : mockQuantity >= 50 ? 'Medium' : 'Low';
    return {
      name:         p.name,
      price:        +(p.basePrice * (0.85 + Math.random() * 0.3)).toFixed(2),
      mockQuantity,
      stockStatus,
    };
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌  MONGODB_URI is not set. Aborting.');
    process.exit(1);
  }

  console.log('🔌  Connecting to MongoDB…');
  await mongoose.connect(mongoUri);
  console.log('✅  Connected.\n');

  const suppliers = await Supplier.find(
    {},
    { _id: 1, businessName: 1, description: 1, industry: 1, location: 1, products: 1 }
  ).lean();
  console.log(`📦  Found ${suppliers.length} supplier records to evaluate.\n`);

  let descCount = 0;
  let prodCount = 0;

  const ops = suppliers
    .map((s) => {
      const name     = (s.businessName ?? 'This supplier').trim();
      const industry = (s.industry     ?? 'Logistics/Manufacturing').trim();
      const location = (s.location     ?? 'Philippines').trim();

      const isWaterSupplier = /\bwater\b/i.test(name);

      const needsDescription = isDescriptionDirty(s.description);
      // Explicitly guard against undefined (pre-schema docs) AND empty arrays
      const needsProducts    = isWaterSupplier || !Array.isArray(s.products) || s.products.length === 0;

      if (!needsDescription && !needsProducts) return null;

      const patch: Record<string, unknown> = {};

      if (needsDescription) {
        patch.description = generateOrganicDescription(name, industry, location);
        descCount++;
      }
      if (needsProducts) {
        // Force re-patch for Water suppliers so they receive the corrected pool.
        patch.products = generateMockProducts(isWaterSupplier ? 'Water' : industry);
        prodCount++;
      }

      return {
        updateOne: {
          filter: { _id: s._id },
          update: { $set: patch },
        },
      };
    })
    .filter((op): op is NonNullable<typeof op> => op !== null);

  if (ops.length === 0) {
    console.log('✨  All records are already clean. Nothing to patch.');
    await mongoose.disconnect();
    return;
  }

  console.log(`🔧  Patching ${ops.length} suppliers…`);
  console.log(`   → ${descCount} need description fix`);
  console.log(`   → ${prodCount} need products injection\n`);

  const result = await Supplier.bulkWrite(ops, { ordered: false });

  console.log(`\n✅  Successfully patched ${result.modifiedCount} suppliers.`);
  console.log(`   Modified: ${result.modifiedCount}  |  Matched: ${result.matchedCount}  |  Write errors: ${result.hasWriteErrors() ? result.getWriteErrors().length : 0}\n`);

  // Post-checks: prove coverage across the collection
  const missingProducts = await Supplier.countDocuments({
    $or: [{ products: { $exists: false } }, { products: { $eq: [] } }],
  });
  const missingInventory = await Supplier.countDocuments({
    $or: [{ inventory: { $exists: false } }, { inventory: { $eq: [] } }],
  });
  const missingBoth = await Supplier.countDocuments({
    $and: [
      { $or: [{ products: { $exists: false } }, { products: { $eq: [] } }] },
      { $or: [{ inventory: { $exists: false } }, { inventory: { $eq: [] } }] },
    ],
  });
  const dirtyDescriptions = await Supplier.countDocuments({
    $or: [
      { description: { $exists: false } },
      { description: { $regex: /^\s*[\[{]/ } },
      { description: { $regex: /\{"/ } },
      { description: { $regex: /\["/ } },
    ],
  });

  console.log('📊  Post-patch verification:');
  console.log(`   → Missing products:  ${missingProducts}`);
  console.log(`   → Missing inventory: ${missingInventory}`);
  console.log(`   → Missing BOTH:      ${missingBoth}`);
  console.log(`   → Dirty descriptions:${dirtyDescriptions}\n`);

  await mongoose.disconnect();
  console.log('🔌  Disconnected. Done.');
}

main().catch((err) => {
  console.error('❌  Fatal error:', err);
  process.exit(1);
});
