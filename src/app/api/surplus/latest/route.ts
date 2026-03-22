import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Surplus from '../../../../models/Surplus';

export const dynamic = 'force-dynamic';

// ─── GET /api/surplus/latest ──────────────────────────────────────────────────
// Public endpoint — returns the 5 most recent available surplus listings.

export async function GET() {
  try {
    await connectDB();

    const items = await Surplus.find({ isAvailable: true })
      .select('productName quantity unit ownerLocation createdAt isFree price')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/surplus/latest]', error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
