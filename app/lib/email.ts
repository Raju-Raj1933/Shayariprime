import { Resend } from "resend";

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("[email] RESEND_API_KEY is not set. Cannot send email.");
  }
  return new Resend(apiKey);
}

function getFromAddress(): string {
  const from = process.env.FROM_EMAIL;
  if (!from) {
    throw new Error("[email] FROM_EMAIL is not set. Cannot send email.");
  }
  return from;
}

/**
 * Sends JWT-based email verification link.
 * Token is a signed JWT — no DB storage required.
 */
export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const resend = getResend();
  const from = getFromAddress();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shayariprime.com";
  const link = `${baseUrl}/verify?token=${token}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0d0d1a;color:#e2e8f0;border-radius:12px;border:1px solid rgba(124,58,237,0.3)">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ec4899);padding:14px;border-radius:12px;">
          <span style="font-size:28px">✍️</span>
        </div>
        <h1 style="color:#a78bfa;margin:16px 0 4px;font-size:24px">Shayariprime</h1>
        <p style="color:#94a3b8;margin:0;font-size:14px">Verify your email address</p>
      </div>
      <p style="color:#cbd5e1;font-size:15px;line-height:1.6">
        Welcome to Shayariprime! Click the button below to verify your email address and activate your account.
      </p>
      <div style="text-align:center;margin:32px 0">
        <a href="${link}" style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;display:inline-block">
          ✅ Verify Email Address
        </a>
      </div>
      <p style="color:#64748b;font-size:13px;text-align:center">
        This link expires in <strong style="color:#a78bfa">15 minutes</strong>.<br/>
        If you didn't create an account, you can safely ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0"/>
      <p style="color:#475569;font-size:12px;text-align:center">
        Or copy and paste this URL into your browser:<br/>
        <span style="color:#7c3aed;word-break:break-all">${link}</span>
      </p>
    </div>`;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "✍️ Verify your Shayariprime account",
    html,
  });

  if (error) {
    throw new Error(`[email] Failed to send verification email: ${error.message}`);
  }
}

/**
 * Sends password reset link — DB-token based (unchanged flow).
 */
export async function sendResetPasswordEmail(to: string, token: string): Promise<void> {
  const resend = getResend();
  const from = getFromAddress();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shayariprime.com";
  const link = `${baseUrl}/reset-password?token=${token}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0d0d1a;color:#e2e8f0;border-radius:12px;border:1px solid rgba(124,58,237,0.3)">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ec4899);padding:14px;border-radius:12px;">
          <span style="font-size:28px">🔐</span>
        </div>
        <h1 style="color:#a78bfa;margin:16px 0 4px;font-size:24px">Shayariprime</h1>
        <p style="color:#94a3b8;margin:0;font-size:14px">Reset your password</p>
      </div>
      <p style="color:#cbd5e1;font-size:15px;line-height:1.6">
        We received a request to reset your password. Click the button below to choose a new password.
      </p>
      <div style="text-align:center;margin:32px 0">
        <a href="${link}" style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;display:inline-block">
          🔑 Reset Password
        </a>
      </div>
      <p style="color:#64748b;font-size:13px;text-align:center">
        This link expires in <strong style="color:#a78bfa">30 minutes</strong>.<br/>
        If you didn't request this, you can safely ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0"/>
      <p style="color:#475569;font-size:12px;text-align:center">
        Or copy and paste this URL into your browser:<br/>
        <span style="color:#7c3aed;word-break:break-all">${link}</span>
      </p>
    </div>`;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "🔐 Reset your Shayariprime password",
    html,
  });

  if (error) {
    throw new Error(`[email] Failed to send reset email: ${error.message}`);
  }
}
