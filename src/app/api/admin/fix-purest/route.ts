import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/mongodb';
import Supplier from '@/models/Supplier';

export const dynamic = 'force-dynamic';

const PUREST_ADDRESS = 'B26 Lot 8 Arcadia, Kaligayahan, Novaliches, Quezon City, 1124 Metro Manila';
const PUREST_LAT = 14.7294;
const PUREST_LNG = 121.0560;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();

    const supplier = await Supplier.findOne({
      businessName: { $regex: 'Purest Drinking Water', $options: 'i' },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, message: 'Supplier "Purest Drinking Water" not found in database.' },
        { status: 404 }
      );
    }

    supplier.location = PUREST_ADDRESS;
    supplier.latitude = PUREST_LAT;
    supplier.longitude = PUREST_LNG;
    await supplier.save();

    console.log(`[FIX-PUREST] Updated "${supplier.businessName}" -> Lat: ${PUREST_LAT}, Lng: ${PUREST_LNG}`);

    return NextResponse.json({
      success: true,
      message: `Updated "${supplier.businessName}" with precise coordinates.`,
      data: {
        businessName: supplier.businessName,
        location: supplier.location,
        latitude: supplier.latitude,
        longitude: supplier.longitude,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/fix-purest]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
