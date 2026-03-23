import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Supplier from '../../../models/Supplier';

export const dynamic = 'force-dynamic';

// ─── GET /api/suppliers ───────────────────────────────────────────────────────
// Returns suppliers from MongoDB. Falls back to Overpass OSM when DB has < 5 results.
// Query params: ?q= ?industry= ?location= ?entityType= ?status=

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q            = searchParams.get('q')?.trim();
    const industry     = searchParams.get('industry')?.trim();
    const location     = searchParams.get('location')?.trim();
    const entityType   = searchParams.get('entityType')?.trim();
    const statusFilter = searchParams.get('status')?.trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (statusFilter) filter.status     = statusFilter;
    if (industry)     filter.industry   = { $regex: industry, $options: 'i' };
    if (location)     filter.location   = { $regex: location, $options: 'i' };
    if (entityType)   filter.entityType = { $in: [new RegExp(`^${entityType}$`, 'i')] };
    if (q) {
      filter.$or = [
        { businessName:    { $regex: q, $options: 'i' } },
        { description:     { $regex: q, $options: 'i' } },
        { productCategory: { $regex: q, $options: 'i' } },
        { industry:        { $regex: q, $options: 'i' } },
      ];
    }

    const dbResults = await Supplier.find(filter)
      .select('-__v')
      .sort({ status: 1, createdAt: -1 })
      .lean();

    console.log('[DEBUG] Local DB Results:', dbResults.length);
    console.log('[DEBUG] Search Params:', { q, location, industry, entityType, statusFilter });

    // Enough local data — return immediately, skip Overpass
    if (dbResults.length >= 5) {
      return NextResponse.json(
        { success: true, count: dbResults.length, data: dbResults },
        { status: 200 }
      );
    }

    // ── Overpass OSM fallback (only when local data is sparse) ─────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let osmSuppliers: any[] = [];

    try {
      console.log('[DEBUG] Triggering Overpass Fallback...');
      const rawTerm = q || entityType || industry || location || 'business';
      const term = rawTerm.replace(/[[\]\\^$.|?*+(){}]/g, '\\$&');
      // POST avoids URL-length truncation; [out:json] must be first to prevent XML error pages
      // NOTE: the ,i modifier must be unquoted in Overpass QL — "amenity"~"food",i NOT "food","i"
      const overpassQL = [
        '[out:json][timeout:5];',
        '(',
        `  node["amenity"~"${term}",i](14.3,120.9,14.8,121.1);`,
        `  node["shop"~"${term}",i](14.3,120.9,14.8,121.1);`,
        `  node["office"~"${term}",i](14.3,120.9,14.8,121.1);`,
        `  node["name"~"${term}",i]["building"](14.3,120.9,14.8,121.1);`,
        `  way["name"~"${term}",i]["building"](14.3,120.9,14.8,121.1);`,
        ');',
        'out center 20;',
      ].join('\n');

      console.log('[DEBUG] Overpass Query:', overpassQL);

      const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'DrektPH-LiveSearch/1.0',
        },
        body: `data=${encodeURIComponent(overpassQL)}`,
        signal: AbortSignal.timeout(5_000),
      });

      console.log('[DEBUG] Overpass Status:', overpassRes.status);
      const rawText = await overpassRes.text();
      console.log('[DEBUG] Overpass Raw Text (first 100 chars):', rawText.substring(0, 100));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let parsed: any = {};
      try {
        parsed = JSON.parse(rawText);
      } catch {
        console.warn('[GET /api/suppliers] Overpass non-JSON response:', rawText.substring(0, 120));
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const elements: any[] = Array.isArray(parsed?.elements) ? parsed.elements : [];

      const candidates = elements
        .filter((el) => el.tags?.name && (el.lat ?? el.center?.lat))
        .map((el) => osmNodeToSupplier(el));

      // Deduplicate against existing DB records
      if (candidates.length > 0) {
        const names = candidates.map((s) => s.businessName);
        const existing = await Supplier.find({ businessName: { $in: names } })
          .select('businessName').lean();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existingSet = new Set(existing.map((s: any) => s.businessName.toLowerCase()));
        osmSuppliers = candidates.filter((s) => !existingSet.has(s.businessName.toLowerCase()));
      }

      // Background upsert — fire-and-forget, never blocks HTTP response
      if (osmSuppliers.length > 0) {
        Supplier.bulkWrite(
          osmSuppliers.map((s) => ({
            updateOne: {
              filter: { businessName: s.businessName },
              update: { $setOnInsert: s },
              upsert: true,
            },
          }))
        ).catch((err) =>
          console.warn('[GET /api/suppliers] Background OSM upsert failed:', err.message)
        );
      }
    } catch (err: any) {
      console.error('[DEBUG] Overpass Try/Catch Error:', err);
      const reason = err.name === 'AbortError' ? 'timed out' : err.message;
      console.warn(`[GET /api/suppliers] Overpass skipped (${reason})`);
    }

    const combined = [...dbResults, ...osmSuppliers];
    return NextResponse.json(
      { success: true, count: combined.length, data: combined },
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

// ─── OSM helpers ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function osmNodeToSupplier(el: any) {
  const tags     = (el.tags ?? {}) as Record<string, string>;
  const lat      = (el.lat  ?? el.center?.lat) as number;
  const lng      = (el.lon  ?? el.center?.lon) as number;
  const location = tags['addr:city'] || tags['addr:province'] || 'Philippines';

  return {
    businessName:       tags.name,
    description:        `Sourced from OpenStreetMap (OSM ID: ${el.id})`,
    location,
    industry:           resolveOsmIndustry(tags),
    entityType:         [resolveOsmEntityType(tags)],
    status:             'PENDING' as const,
    isVerified:         false,
    contactPhone:       tags.phone        || tags['contact:phone'] || '',
    contactEmail:       tags.email        || tags['contact:email'] || '',
    latitude:           lat,
    longitude:          lng,
    geoLocation:        { type: 'Point' as const, coordinates: [lng, lat] as [number, number] },
    markerEmoji:        '📍',
    inventory:          [],
    dedicatedInventory: [],
    specialties:        [],
    logoUrl:            '',
  };
}

function resolveOsmEntityType(tags: Record<string, string>): string {
  if (tags.shop === 'wholesale'        || tags.office === 'company')    return 'DISTRIBUTOR';
  if (tags.landuse === 'industrial'    || tags['man_made'] === 'works') return 'MANUFACTURER';
  if (tags.building === 'warehouse'    || tags.landuse === 'warehouse') return 'WAREHOUSE';
  if (tags.landuse === 'farmland'      || tags.shop === 'farm')         return 'AGRICULTURE';
  if (tags.amenity === 'logistics'     || tags.transport === 'logistics') return 'LOGISTICS';
  return 'SUPPLIER';
}

function resolveOsmIndustry(tags: Record<string, string>): string {
  if (tags.landuse === 'farmland'      || tags.shop === 'farm')         return 'Agriculture & Farming';
  if (tags.shop === 'food'             || tags.amenity === 'marketplace') return 'Food & Beverage';
  if (tags.landuse === 'industrial'    || tags['man_made'] === 'works') return 'Logistics & Freight';
  if (tags.building === 'warehouse')                                     return 'Warehousing & Storage';
  return 'Other';
}
