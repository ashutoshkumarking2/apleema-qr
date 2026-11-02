import { Resend } from 'resend'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export type OtpPurpose = 'login' | 'logout' | 'qr-delete'

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: OtpPurpose,
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const logoPath = resolve(process.cwd(), 'assets', 'apleemaofficial.png')
  const logo = readFileSync(logoPath)

  const isLogout = purpose === 'logout'
  const isQrDelete = purpose === 'qr-delete'

  const heading = isLogout
    ? 'Confirm your logout'
    : isQrDelete
      ? 'Confirm QR code deletion'
      : 'Welcome back!'

  const description = isLogout
    ? 'You requested to log out of your Apleema account. Enter the verification code below to confirm this action.'
    : isQrDelete
      ? 'A request was made to permanently delete QR code(s) from your Apleema account, including their scan history. Enter this code only if you initiated this action.'
      : 'Use the verification code below to securely access your Apleema account.'

  const subject = isLogout
    ? `${code} — Confirm your Apleema logout`
    : isQrDelete
      ? `${code} — Confirm Apleema QR deletion`
      : `${code} — Your Apleema login code`

  const text = isLogout
    ? `Your Apleema logout verification code is ${code}. It expires in 10 minutes. If you did not request this logout, do not share this code.`
    : isQrDelete
      ? `Your Apleema QR deletion verification code is ${code}. It expires in 10 minutes. If you did not request QR deletion, do not share this code and ignore this email.`
      : `Your Apleema login verification code is ${code}. It expires in 10 minutes. If you did not request this code, ignore this email.`

  const { error } = await resend.emails.send({
    from: process.env.FROM_EMAIL || 'Apleema <onboarding@resend.dev>',
    to,
    subject,
    text,
    attachments: [
      {
        filename: 'apleemaofficial.png',
        content: logo,
        contentType: 'image/png',
        contentId: 'apleema-logo',
      },
    ],
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apleema Verification</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Your Apleema verification code is ${code}.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:40px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background:#101014;padding:30px 32px;text-align:center;">
              <img src="cid:apleema-logo" alt="Apleema" width="150" style="display:block;margin:0 auto;max-width:150px;height:auto;border:0;">
              <p style="margin:14px 0 0;color:#a1a1aa;font-size:12px;letter-spacing:2px;">
                CREATE. CONNECT. GROW.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:38px 32px 24px;text-align:center;">
              <div style="display:inline-block;background:#fff1eb;color:#ff5a1f;padding:9px 15px;border-radius:30px;font-size:12px;font-weight:bold;">
                ${isLogout ? 'SECURE LOGOUT VERIFICATION' : isQrDelete ? 'SECURE QR DELETION VERIFICATION' : 'SECURE LOGIN VERIFICATION'}
              </div>
              <h1 style="color:#18181b;font-size:26px;line-height:1.3;margin:24px 0 12px;">
                ${heading}
              </h1>
              <p style="color:#71717a;font-size:15px;line-height:1.7;margin:0;">
                ${description}
              </p>
              <div style="margin:30px 0;background:#fff7f3;border:1px solid #ffdfd1;border-radius:16px;padding:25px 12px;">
                <p style="margin:0 0 13px;color:#71717a;font-size:12px;font-weight:bold;letter-spacing:2px;">
                  YOUR ONE-TIME PASSWORD
                </p>
                <div style="font-size:38px;font-weight:800;letter-spacing:10px;color:#ff5a1f;padding-left:10px;">
                  ${code}
                </div>
                <p style="margin:15px 0 0;color:#71717a;font-size:12px;">
                  <span style="color:#ff5a1f;">●</span>
                  Expires in 10 minutes
                </p>
              </div>
              <p style="color:#71717a;font-size:13px;line-height:1.7;margin:0;">
                Enter this code on Apleema to continue.
                For your security, never share this code with anyone.
              </p>
              <div style="height:1px;background:#eeeeef;margin:30px 0;"></div>
              <p style="color:#52525b;font-size:13px;line-height:1.7;margin:0;">
                <strong>${isLogout ? 'Did you not request logout?' : isQrDelete ? 'Did you not request QR deletion?' : "Didn't request this code?"}</strong><br>
                ${isLogout ? 'Do not enter or share this code. Your account will remain logged in.' : isQrDelete ? 'Do not enter or share this code. Your QR codes will remain unchanged.' : 'You can safely ignore this email. Your account remains secure.'}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#fafafa;padding:25px;text-align:center;">
              <p style="margin:0;color:#18181b;font-size:14px;font-weight:bold;">
                Built for what's next.
              </p>
              <p style="margin:8px 0;color:#a1a1aa;font-size:12px;">
                © 2026 Apleema. All rights reserved.
              </p>
              <p style="margin:0;color:#ff5a1f;font-size:12px;font-weight:bold;">
                apleema.ai
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`,
  })

  if (error) throw new Error(error.message)
}

