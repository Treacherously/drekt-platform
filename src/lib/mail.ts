import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_to_bypass_build');

const FROM_ADDRESS = 'DREKT <noreply@drekt.ph>';
const APP_NAME = 'DREKT';

// ─── Verification Email ───────────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Verify your ${APP_NAME} account`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f8fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#001a80;padding:28px 40px;">
              <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                DRE<span style="color:#4ade80;">KT</span>
              </span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;">
                Verify your email address
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
                Thanks for signing up! Click the button below to verify your email and activate your account.
                This link expires in <strong>24 hours</strong>.
              </p>
              <a href="${verifyUrl}"
                 style="display:inline-block;background:#001a80;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
                Verify Email Address
              </a>
              <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">
                If you didn't create a DREKT account, you can safely ignore this email.<br>
                Or copy this link: <a href="${verifyUrl}" style="color:#001a80;">${verifyUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 40px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © 2026 DREKT · Philippine B2B Supply Chain Directory
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
