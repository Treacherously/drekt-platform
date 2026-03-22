import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { connectDB } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Supplier from '../../../../models/Supplier';
import { sendVerificationEmail } from '../../../../lib/mail';

export const dynamic = 'force-dynamic';

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Creates a new user account. Password is hashed automatically by the
// User model's pre-save hook (bcryptjs, 12 rounds).
// Body: { email, password, role? }

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password, role } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with that email already exists' },
        { status: 409 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'SUPPLIER';

    let businessId: string | undefined;

    if (assignedRole === 'SUPPLIER') {
      const linkedSupplier = await Supplier.findOne({
        contactEmail: { $regex: `^${normalizedEmail}$`, $options: 'i' },
      }).select('_id').lean<{ _id: any }>();

      if (linkedSupplier) {
        businessId = linkedSupplier._id.toString();
      }
    }

    const verificationToken = randomUUID();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      email: normalizedEmail,
      password,
      role: assignedRole,
      verificationToken,
      tokenExpiry,
      isVerified: true, // DEV BYPASS: set false in production
      ...(businessId ? { businessId } : {}),
    });

    try {
      await sendVerificationEmail(normalizedEmail, verificationToken);
    } catch (mailErr) {
      console.error('[register] Failed to send verification email:', mailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created! Check your email for a verification link.',
        data: { id: user._id, email: user.email, role: user.role, businessId: user.businessId },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/auth/register]', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'An account with that email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message ?? 'Registration failed' },
      { status: 500 }
    );
  }
}
