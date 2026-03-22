import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Supplier from '@/models/Supplier';

export const dynamic = 'force-dynamic';

const INTERNAL_THRESHOLD = 3;

interface NominatimPlace {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  category: string;
  address?: {
    city?: string;
    town?: string;
    municipality?: string;
    country?: string;
  };
}

function resolveIndustry(category: string, type: string): string {
  if (category === 'shop') return 'Retail & Distribution';
  if (category === 'amenity' && type === 'marketplace') return 'Trade & Distribution';
  if (category === 'landuse') return 'Agriculture & Farming';
  if (category === 'industrial') return 'Manufacturing';
  return 'General Trade';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query')?.trim() ?? '';
    const lat = parseFloat(searchParams.get('lat') ?? '');
    const lng = parseFloat(searchParams.get('lng') ?? '');

    if (!query) {
      return NextResponse.json({ success: false, message: 'query param is required' }, { status: 400 });
    }

    await connectDB();

    // ── 1. Internal search ──────────────────────────────────────────────────────
    const regex = { $regex: query, $options: 'i' };
    const internal = await Supplier.find({
      $or: [
        { businessName: regex },
        { industry: regex },
        { productCategory: regex },
        { description: regex },
      ],
    })
      .select('-__v')
      .sort({ status: 1, createdAt: -1 })
      .limit(20)
      .lean();

    if (internal.length >= INTERNAL_THRESHOLD) {
      return NextResponse.json({ success: true, data: internal, source: 'internal' });
    }

    // ── 2. External OSM fallback ────────────────────────────────────────────────
    const hasCoords = !isNaN(lat) && !isNaN(lng);
    const nominatimUrl = hasCoords
      ? `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&lat=${lat}&lon=${lng}&addressdetails=1`
      : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' Philippines')}&format=json&limit=5&addressdetails=1`;

    let external: ReturnType<typeof mapNominatimToSupplier>[] = [];

    try {
      const res = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'DrektPlatform/1.0 (hybrid search)',
          'Accept-Language': 'en',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const places: NominatimPlace[] = await res.json();
        external = places
          .filter((p) => p.display_name)
          .map((p) => mapNominatimToSupplier(p));
      }
    } catch {
      // OSM unavailable — still return internal results
    }

    const combined = [
      ...internal,
      ...external.filter(
        (ext) => !internal.some((i) => i.businessName?.toLowerCase() === ext.businessName?.toLowerCase())
      ),
    ];

    return NextResponse.json({ success: true, data: combined, source: internal.length > 0 ? 'hybrid' : 'external' });
  } catch (error) {
    console.error('[GET /api/search]', error);
    return NextResponse.json({ success: false, message: 'Search failed' }, { status: 500 });
  }
}

function mapNominatimToSupplier(place: NominatimPlace) {
  const nameParts = place.display_name.split(',');
  const businessName = nameParts[0].trim();
  const city = place.address?.city ?? place.address?.town ?? place.address?.municipality ?? '';
  const location = [city, place.address?.country].filter(Boolean).join(', ') || place.display_name.slice(0, 60);

  return {
    _id: `osm_${place.place_id}`,
    businessName,
    description: place.display_name,
    location,
    isVerified: false,
    entityType: [] as string[],
    status: 'PENDING' as const,
    industry: resolveIndustry(place.category, place.type),
    productCategory: place.type,
    contactEmail: '',
    contactPhone: '',
    inventory: [],
    dedicatedInventory: [],
    specialties: [],
    logoUrl: '',
    latitude: parseFloat(place.lat),
    longitude: parseFloat(place.lon),
    markerEmoji: '❓',
    isExternal: true,
  };
}
