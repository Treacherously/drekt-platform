import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Inquiry from '../../../models/Inquiry';

export const dynamic = 'force-dynamic';

// ─── POST /api/inquiries ──────────────────────────────────────────────────────
// Saves an inquiry from a prospective buyer to MongoDB.
// Body: { businessId, businessName, senderName, senderEmail?, senderPhone?, message }

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { businessId, businessName, senderName, senderEmail, senderPhone, message } = body;

    if (!businessId || !senderName?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: 'businessId, senderName, and message are required' },
        { status: 400 }
      );
    }

    const inquiry = await Inquiry.create({
      businessId,
      businessName,
      senderName: senderName.trim(),
      senderEmail: senderEmail?.trim() ?? '',
      senderPhone: senderPhone?.trim() ?? '',
      message: message.trim(),
    });

    return NextResponse.json(
      { success: true, data: inquiry },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/inquiries]', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Failed to save inquiry' },
      { status: 500 }
    );
  }
}

// ─── GET /api/inquiries ───────────────────────────────────────────────────────
// Returns all inquiries, newest first. Used by the Admin Dashboard.

export async function GET() {
  try {
    await connectDB();

    const inquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, count: inquiries.length, data: inquiries },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[GET /api/inquiries]', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/inquiries ─────────────────────────────────────────────────────
// Marks an inquiry as READ.
// Body: { inquiryId }

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const { inquiryId } = await req.json();
    if (!inquiryId) {
      return NextResponse.json({ success: false, message: 'inquiryId is required' }, { status: 400 });
    }

    const updated = await Inquiry.findByIdAndUpdate(
      inquiryId,
      { status: 'READ' },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: any) {
    console.error('[PATCH /api/inquiries]', error);
    return NextResponse.json(
      { success: false, message: error.message ?? 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}
