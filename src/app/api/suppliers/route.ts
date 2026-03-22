import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Supplier from '../../../models/Supplier';

export const dynamic = 'force-dynamic';

// ─── GET /api/suppliers ───────────────────────────────────────────────────────
// Returns all business entities. Optional query filters:
//   ?q=<text>          — regex search across businessName / description / productCategory
//   ?industry=<name>   — filter by industry (case-insensitive)
//   ?location=<city>   — filter by location (case-insensitive)
//   ?entityType=<type> — filter by entityType enum (MANUFACTURER, LOGISTICS, etc.)
//   ?status=<status>   — filter by status (PENDING | VERIFIED | FEATURED)

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const sample = await Supplier.findOne({ entityType: { $exists: true, $not: { $size: 0 } } });
    console.log('DEBUG: Raw DB Record EntityType:', JSON.stringify(sample?.entityType));

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const industry = searchParams.get('industry')?.trim();
    const location = searchParams.get('location')?.trim();
    const entityType = searchParams.get('entityType')?.trim();
    const statusFilter = searchParams.get('status')?.trim();
    console.log('SEARCHING FOR:', entityType);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (statusFilter) {
      filter.status = statusFilter;
    }

    if (industry) {
      filter.industry = { $regex: industry, $options: 'i' };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (entityType) {
      const typeRegex = new RegExp(`^${entityType}$`, 'i');
      filter.entityType = { $in: [typeRegex] };
    }

    if (q) {
      filter.$or = [
        { businessName: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { productCategory: { $regex: q, $options: 'i' } },
        { industry: { $regex: q, $options: 'i' } },
      ];
    }

    console.log('[GET /api/suppliers] Final MongoDB Filter:', JSON.stringify(filter, null, 2));

    const suppliers = await Supplier.find(filter)
      .select('-__v')
      .sort({ status: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, count: suppliers.length, data: suppliers },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/suppliers]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

// ─── POST /api/suppliers ──────────────────────────────────────────────────────
// Creates a new supplier document. Used for initial data seeding.
// Body (JSON): ISupplier fields (businessName, industry, location, etc.)

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    if (!body.businessName || !body.industry || !body.location) {
      return NextResponse.json(
        { success: false, message: 'businessName, industry, and location are required' },
        { status: 400 }
      );
    }

    // ── Geocode the text location via Nominatim ────────────────────────────────
    let lat = 14.5995; // Default: Manila centre
    let lng = 120.9842;

    try {
      const searchQuery = encodeURIComponent(`${body.location}, Philippines`);
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${searchQuery}`,
        { headers: { 'User-Agent': 'DrektPH_Registration_Module' } }
      );
      const geoData = await geoRes.json();
      if (Array.isArray(geoData) && geoData.length > 0) {
        lat = parseFloat(geoData[0].lat);
        lng = parseFloat(geoData[0].lon);
      }
    } catch {
      console.warn('[POST /api/suppliers] Geocoding failed, using default Manila coordinates');
    }

    const supplier = await Supplier.create({
      ...body,
      latitude: lat,
      longitude: lng,
      geoLocation: { type: 'Point', coordinates: [lng, lat] },
    });

    return NextResponse.json(
      { success: true, data: supplier },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/suppliers]', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return NextResponse.json(
        { success: false, message: messages.join(', ') },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}
