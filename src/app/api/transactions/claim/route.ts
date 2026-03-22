import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Supplier from '../../../../models/Supplier';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supplierId, itemId, quantityClaimed } = body as {
      supplierId: string;
      itemId: string;
      quantityClaimed: number;
    };

    // ── Validate payload ───────────────────────────────────────────────────────
    if (!supplierId || !itemId || typeof quantityClaimed !== 'number') {
      return NextResponse.json(
        { success: false, message: 'supplierId, itemId, and quantityClaimed are required.' },
        { status: 400 }
      );
    }

    if (quantityClaimed <= 0 || !Number.isInteger(quantityClaimed)) {
      return NextResponse.json(
        { success: false, message: 'quantityClaimed must be a positive integer.' },
        { status: 400 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(supplierId) ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid supplierId or itemId.' },
        { status: 400 }
      );
    }

    await connectDB();

    // ── Find supplier ──────────────────────────────────────────────────────────
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return NextResponse.json(
        { success: false, message: 'Supplier not found.' },
        { status: 404 }
      );
    }

    // ── Locate inventory item ─────────────────────────────────────────────────
    const item = supplier.dedicatedInventory.find(
      (i) => (i._id as mongoose.Types.ObjectId).toString() === itemId
    );

    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Inventory item not found.' },
        { status: 404 }
      );
    }

    // ── Check sufficient stock ────────────────────────────────────────────────
    if (item.quantity < quantityClaimed) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient stock. Available: ${item.quantity} ${item.unit}.`,
        },
        { status: 400 }
      );
    }

    // ── Deduct stock atomically ───────────────────────────────────────────────
    item.quantity -= quantityClaimed;
    item.lastUpdated = new Date();

    await supplier.save();

    return NextResponse.json({
      success: true,
      message: `Claimed ${quantityClaimed} ${item.unit} of "${item.itemName}". Remaining stock: ${item.quantity} ${item.unit}.`,
      newQuantity: item.quantity,
      unit: item.unit,
      itemName: item.itemName,
    });
  } catch (err) {
    console.error('[/api/transactions/claim]', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
