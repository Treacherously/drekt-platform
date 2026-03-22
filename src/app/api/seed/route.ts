import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import SupplierModel, { EntityType } from '../../../models/Supplier';
import { suppliers as mockSuppliers } from '../../../data/mockData';

export const dynamic = 'force-dynamic';

// ─── GET /api/seed ────────────────────────────────────────────────────────────
// Wipes the existing Supplier collection and re-seeds from mockData.
// Safe to call multiple times — always deletes first to prevent duplicates.

// ── Map mockData.businessType → { entityType[], industry } ────────────────────
const BUSINESS_TYPE_MAP: Record<string, { entityType: EntityType[]; industry: string }> = {
  // Manufacturers
  'Packaging Manufacturer':   { entityType: ['MANUFACTURER'],             industry: 'Packaging Manufacturer' },
  'Plastics Manufacturer':    { entityType: ['MANUFACTURER'],             industry: 'Plastics Manufacturer' },
  'Glass Manufacturer':       { entityType: ['MANUFACTURER'],             industry: 'Glass Manufacturer' },
  'Flour Mill':               { entityType: ['MANUFACTURER'],             industry: 'Flour Mill' },
  'Baking Ingredients':       { entityType: ['MANUFACTURER', 'SUPPLIER'], industry: 'Baking Ingredients' },
  'Sugar Mill':               { entityType: ['MANUFACTURER'],             industry: 'Sugar Mill' },
  'Condiments Manufacturer':  { entityType: ['MANUFACTURER'],             industry: 'Condiments Manufacturer' },
  'Textile Manufacturer':     { entityType: ['MANUFACTURER'],             industry: 'Textiles & Apparel' },
  'Food Manufacturer':        { entityType: ['MANUFACTURER'],             industry: 'Food Manufacturer' },
  // Suppliers / Raw Materials
  'Chemical Supplier':        { entityType: ['SUPPLIER'],                 industry: 'Chemical Supplier' },
  'Raw Materials':            { entityType: ['SUPPLIER'],                 industry: 'Retail & Distribution' },
  'Packaging':                { entityType: ['SUPPLIER'],                 industry: 'Packaging' },
  'Equipment':                { entityType: ['SUPPLIER'],                 industry: 'Retail & Distribution' },
  // Logistics & Warehousing
  'Logistics':                { entityType: ['LOGISTICS'],                industry: 'Logistics & Freight' },
  'Cold Chain':               { entityType: ['LOGISTICS', 'WAREHOUSE'],   industry: 'Cold Chain' },
  // Agriculture
  'Rice Farm':                { entityType: ['AGRICULTURE'],              industry: 'Rice Farm' },
  'Corn Farm':                { entityType: ['AGRICULTURE'],              industry: 'Corn Farm' },
  'Mango Farm':               { entityType: ['AGRICULTURE'],              industry: 'Mango Farm' },
  'Coconut Farm':             { entityType: ['AGRICULTURE'],              industry: 'Coconut Farm' },
  'Abaca Farm':               { entityType: ['AGRICULTURE'],              industry: 'Agriculture & Farming' },
  'Vegetable Farm':           { entityType: ['AGRICULTURE'],              industry: 'Agriculture & Farming' },
  'Fishery':                  { entityType: ['AGRICULTURE'],              industry: 'Agriculture & Farming' },
  'Livestock Farm':           { entityType: ['AGRICULTURE'],              industry: 'Agriculture & Farming' },
  // Distributors
  'Supermarket':              { entityType: ['DISTRIBUTOR'],              industry: 'Retail & Distribution' },
  'Wet Market':               { entityType: ['DISTRIBUTOR'],              industry: 'Retail & Distribution' },
  'Drugstore':                { entityType: ['DISTRIBUTOR'],              industry: 'Pharmaceuticals' },
  'Department Store':         { entityType: ['DISTRIBUTOR'],              industry: 'Retail & Distribution' },
  'Electronics Store':        { entityType: ['DISTRIBUTOR'],              industry: 'Retail & Distribution' },
  'Textile Market':           { entityType: ['DISTRIBUTOR'],              industry: 'Textiles & Apparel' },
  'Hardware Store':           { entityType: ['DISTRIBUTOR'],              industry: 'Retail & Distribution' },
};

export async function GET() {
  try {
    await connectDB();

    // ── Always wipe before re-seeding to prevent duplicates ───────────────────
    const { deletedCount } = await SupplierModel.deleteMany({});

    // ── Map mockData shape → Mongoose ISupplier shape ─────────────────────────
    const seeded = mockSuppliers.map((s) => {
      const mapped = BUSINESS_TYPE_MAP[s.businessType] ?? {
        entityType: ['SUPPLIER'] as EntityType[],
        industry: s.businessType,
      };

      return {
        businessName: s.name,
        description: s.description,
        location: s.city,
        geoLocation:
          s.latitude && s.longitude
            ? { type: 'Point' as const, coordinates: [s.longitude, s.latitude] }
            : undefined,
        isVerified: true,
        status: 'VERIFIED' as const,
        entityType: mapped.entityType,
        industry: mapped.industry,
        productCategory: s.productCategory,
        contactEmail: s.contactEmail,
        contactPhone: s.contactPhone,
        inventory: s.products.map((p) => ({
          itemName: p.name,
          quantity: p.quantity,
          unit: p.unit,
          price: p.pricePerUnit,
        })),
      };
    });

    const inserted = await SupplierModel.insertMany(seeded, { ordered: false });

    return NextResponse.json(
      {
        success: true,
        message: `Deleted ${deletedCount} old record(s). Seeded ${inserted.length} supplier(s) into MongoDB.`,
        count: inserted.length,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[GET /api/seed]', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Seeding failed' },
      { status: 500 }
    );
  }
}
