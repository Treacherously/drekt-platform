import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';
import { connectDB } from '../../../../lib/mongodb';
import Supplier from '../../../../models/Supplier';

export const dynamic = 'force-dynamic';

// ─── PATCH /api/admin/businesses ─────────────────────────────────────────────
// Body: { businessId: string, status: 'PENDING' | 'VERIFIED' | 'FEATURED' }
// Updates the status of a business and sets isVerified accordingly.

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();

    const body = await req.json();
    const { businessId, status } = body;

    if (!businessId || !status) {
      return NextResponse.json(
        { success: false, message: 'businessId and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'VERIFIED', 'FEATURED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await Supplier.findByIdAndUpdate(
      businessId,
      {
        status,
        isVerified: status === 'VERIFIED' || status === 'FEATURED',
      },
      { new: true, runValidators: true }
    ).select('-__v').lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/admin/businesses]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update business' },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/admin/businesses ────────────────────────────────────────────
// Body: { businessId: string }
// Permanently removes a business from the database.

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();

    const body = await req.json();
    const { businessId } = body;

    if (!businessId) {
      return NextResponse.json(
        { success: false, message: 'businessId is required' },
        { status: 400 }
      );
    }

    const deleted = await Supplier.findByIdAndDelete(businessId).lean();

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Business deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/admin/businesses]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete business' },
      { status: 500 }
    );
  }
}
