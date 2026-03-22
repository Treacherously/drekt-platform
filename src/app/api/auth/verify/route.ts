import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import User from '../../../../models/User';

// ─── GET /api/auth/verify?token=XYZ ──────────────────────────────────────────
// Validates the email verification token.
// On success: sets isVerified=true, clears token, redirects to /login?verified=true
// On failure: redirects to /login?error=invalid-token or ?error=expired-token

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const base = process.env.NEXTAUTH_URL ?? req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(`${base}/login?error=invalid-token`);
  }

  try {
    await connectDB();

    const user = await User.findOne({
      verificationToken: token,
      tokenExpiry: { $gt: new Date() },
    }).select('+verificationToken +tokenExpiry');

    if (!user) {
      return NextResponse.redirect(`${base}/login?error=expired-token`);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    return NextResponse.redirect(`${base}/login?verified=true`);
  } catch (error) {
    console.error('[GET /api/auth/verify]', error);
    return NextResponse.redirect(`${base}/login?error=server-error`);
  }
}
