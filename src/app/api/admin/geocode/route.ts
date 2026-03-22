import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/mongodb';
import Supplier from '@/models/Supplier';

export const dynamic = 'force-dynamic';

const METRO_MANILA_LAT = 14.5995;
const METRO_MANILA_LNG = 120.9842;

interface NominatimResult {
  lat: string;
  lon: string;
}

async function geocodeAddress(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Philippines')}&format=json&limit=1`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'DrektPlatform/1.0 (admin geocode tool)',
        'Accept-Language': 'en',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data: NominatimResult[] = await res.json();

    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();

    const suppliers = await Supplier.find({ latitude: { $exists: false } })
      .select('_id businessName location')
      .lean();

    if (suppliers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All suppliers already have coordinates.',
        geocoded: 0,
        fallback: 0,
        total: 0,
      });
    }

    let geocodedCount = 0;
    let fallbackCount = 0;

    for (let i = 0; i < suppliers.length; i++) {
      const supplier = suppliers[i];
      const query = (supplier.location as string)?.trim() || supplier.businessName as string;

      console.log(`[GEOCODER] Processing ${i + 1}/${suppliers.length}: ${supplier.businessName}...`);

      const coords = await geocodeAddress(query);

      if (coords) {
        console.log(`  -> Found! Lat: ${coords.lat}, Lng: ${coords.lng}`);
        await Supplier.updateOne(
          { _id: supplier._id },
          { $set: { latitude: coords.lat, longitude: coords.lng } }
        );
        geocodedCount++;
      } else {
        console.log(`  -> Not found. Using fallback coordinates.`);
        const scatter = () => (Math.random() - 0.5) * 0.10;
        await Supplier.updateOne(
          { _id: supplier._id },
          {
            $set: {
              latitude: METRO_MANILA_LAT + scatter(),
              longitude: METRO_MANILA_LNG + scatter(),
            },
          }
        );
        fallbackCount++;
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    return NextResponse.json({
      success: true,
      message: `Done. ${geocodedCount} geocoded, ${fallbackCount} used Metro Manila fallback.`,
      geocoded: geocodedCount,
      fallback: fallbackCount,
      total: suppliers.length,
    });
  } catch (error) {
    console.error('[POST /api/admin/geocode]', error);
    return NextResponse.json({ success: false, message: 'Server error during geocoding.' }, { status: 500 });
  }
}
