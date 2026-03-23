import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Supplier from '../../../../models/Supplier';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Supplier id is required' },
        { status: 400 }
      );
    }

    const supplier = await Supplier.findById(id)
      .select(
        'businessName description location industry contactEmail contactPhone latitude longitude products inventory'
      )
      .lean();

    if (!supplier) {
      return NextResponse.json(
        { success: false, message: 'Supplier not found' },
        { status: 404 }
      );
    }

    // DEBUG: confirm server is sending products
    // eslint-disable-next-line no-console
    console.log(
      'API Sending Supplier:',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supplier as any)?.businessName,
      'Products Count:',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Array.isArray((supplier as any)?.products) ? (supplier as any).products.length : 0
    );

    return NextResponse.json({ success: true, data: supplier }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/suppliers/:id]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch supplier' },
      { status: 500 }
    );
  }
}
