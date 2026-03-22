import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/mongodb';
import Supplier from '@/models/Supplier';
import { EntityType } from '@/models/Supplier';

export const dynamic = 'force-dynamic';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const OVERPASS_QUERY = `[out:json][timeout:25];
area["name"="Metro Manila"]->.searchArea;
(
  node["shop"~"hardware|wholesale|water|agrarian|farm|supermarket|bakery"](area.searchArea);
  node["amenity"="marketplace"](area.searchArea);
);
out 100;`;

interface OsmTag {
  name?: string;
  shop?: string;
  landuse?: string;
  amenity?: string;
  'addr:full'?: string;
  'addr:city'?: string;
  'addr:street'?: string;
  'addr:barangay'?: string;
  'addr:suburb'?: string;
  phone?: string;
  'contact:phone'?: string;
  'phone:mobile'?: string;
  email?: string;
  'contact:email'?: string;
  website?: string;
}

interface OsmNode {
  id: number;
  lat: number;
  lon: number;
  tags: OsmTag;
}

interface OverpassResponse {
  elements: OsmNode[];
}

function resolveEntityType(tags: OsmTag): EntityType {
  const shop = tags.shop;
  if (shop === 'water') return 'SUPPLIER';
  if (shop === 'farm' || shop === 'agrarian') return 'FARMER';
  if (shop === 'hardware') return 'MANUFACTURER';
  if (shop === 'wholesale') return 'DISTRIBUTOR';
  if (shop === 'supermarket' || shop === 'bakery') return 'DISTRIBUTOR';
  if (tags.amenity === 'marketplace') return 'DISTRIBUTOR';
  return 'SUPPLIER';
}

function resolveIndustry(tags: OsmTag): string {
  const shop = tags.shop;
  if (shop === 'water') return 'Water Supply';
  if (shop === 'farm' || shop === 'agrarian') return 'Agriculture & Farming';
  if (shop === 'hardware') return 'Hardware & Construction';
  if (shop === 'wholesale') return 'Wholesale Trade';
  if (shop === 'supermarket') return 'Retail & Distribution';
  if (shop === 'bakery') return 'Food Manufacturer';
  if (tags.amenity === 'marketplace') return 'Trade & Distribution';
  return 'General Trade';
}

function resolveMarkerEmoji(entityType: EntityType, tags: OsmTag): string {
  if (tags.shop === 'bakery') return '🥐';
  if (tags.shop === 'supermarket') return '🛒';
  if (tags.shop === 'hardware') return '🔧';
  if (tags.shop === 'water') return '💧';
  if (entityType === 'FARMER') return '🌾';
  if (entityType === 'DISTRIBUTOR') return '📦';
  if (entityType === 'MANUFACTURER') return '🏤';
  return '🏢';
}

function resolveContact(tags: OsmTag): { phone: string; email: string } {
  const phone = tags.phone ?? tags['contact:phone'] ?? tags['phone:mobile'] ?? '';
  const email = tags.email ?? tags['contact:email'] ?? '';
  return { phone: phone.trim(), email: email.trim() };
}

function resolveLocation(tags: OsmTag): string {
  if (tags['addr:full']) return tags['addr:full'];
  const parts = [
    tags['addr:street'],
    tags['addr:barangay'] ?? tags['addr:suburb'],
    tags['addr:city'],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Metro Manila';
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();

    console.log('[HARVEST-OSM] Fetching data from Overpass API...');

    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'DrektPlatform/1.0 (admin harvest tool)',
      },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: `Overpass API returned ${res.status}` },
        { status: 502 }
      );
    }

    const json: OverpassResponse = await res.json();
    const elements = json.elements ?? [];

    console.log(`[HARVEST-OSM] Got ${elements.length} OSM nodes.`);

    if (elements.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Overpass returned 0 results. Try a broader query.',
        created: 0,
        skipped: 0,
      });
    }

    let created = 0;
    let skipped = 0;

    for (const node of elements) {
      const name = node.tags?.name?.trim();
      if (!name) {
        skipped++;
        continue;
      }

      const existing = await Supplier.findOne({
        businessName: { $regex: `^${name}$`, $options: 'i' },
      });

      if (existing) {
        console.log(`[HARVEST-OSM] Skipping duplicate: "${name}"`);
        skipped++;
        continue;
      }

      const entityType = resolveEntityType(node.tags);
      const industry = resolveIndustry(node.tags);
      const location = resolveLocation(node.tags);
      const { phone, email } = resolveContact(node.tags);
      const markerEmoji = resolveMarkerEmoji(entityType, node.tags);

      await Supplier.create({
        businessName: name,
        description: `Real business sourced from OpenStreetMap (OSM ID: ${node.id}). Located in ${location}.`,
        location,
        industry,
        entityType: [entityType],
        status: 'VERIFIED',
        isVerified: true,
        latitude: node.lat,
        longitude: node.lon,
        markerEmoji,
        contactEmail: email,
        contactPhone: phone,
        inventory: [],
        dedicatedInventory: [],
        specialties: [],
        logoUrl: '',
      });

      console.log(`[HARVEST-OSM] Created: "${name}" (${entityType}) @ ${node.lat}, ${node.lon}`);
      created++;
    }

    return NextResponse.json({
      success: true,
      message: `Harvest complete. ${created} new businesses added, ${skipped} skipped (no name or duplicate).`,
      created,
      skipped,
      total: elements.length,
    });
  } catch (error) {
    console.error('[POST /api/admin/harvest-osm]', error);
    return NextResponse.json({ success: false, message: 'Server error during OSM harvest.' }, { status: 500 });
  }
}
