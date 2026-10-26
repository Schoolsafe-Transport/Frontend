import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // ignore
    }
  }

  const { to, subject, text, html, sixDigitCode, recipientName, verificationUrl } = body || {};

  if (!to) {
    return res.status(400).json({ success: false, message: 'Recipient email address (to) is required.' });
  }

  const user = process.env.SMTP_USER || 'rahelnaba716@gmail.com';
  const pass = (process.env.SMTP_PASS || 'odoyizjclhpejyxa').replace(/\s+/g, '');

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });

    const emailSubject = subject || 'Verify your SchoolSafe email address';
    const emailText =
      text ||
      `Welcome to SchoolSafe!\n\nYour 6-digit verification code is: ${sixDigitCode || ''}\n\nVerify online: ${
        verificationUrl || ''
      }\n\nThis code expires in 30 minutes.`;

    const emailHtml =
      html ||
      `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #1e3a8a; margin: 0; font-size: 24px;">SchoolSafe</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Smart School Transportation Safeguarding</p>
        </div>
        <p style="font-size: 16px; font-weight: 600; color: #1e293b;">Welcome to SchoolSafe, ${recipientName || 'Member'}!</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          Please enter the 6-digit verification code below in your SchoolSafe app to verify your email address and activate your account.
        </p>
        ${
          sixDigitCode
            ? `
        <div style="margin: 28px 0; padding: 20px; background-color: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; text-align: center;">
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #1e40af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            Your 6-Digit Email Verification Code
          </p>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #1d4ed8; font-family: monospace;">
            ${sixDigitCode}
          </div>
        </div>
        `
            : ''
        }
        ${
          verificationUrl
            ? `
        <div style="text-align: center; margin: 24px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
            Verify Email Address Directly
          </a>
        </div>
        `
            : ''
        }
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          This code expires in 30 minutes. If you did not create this account, you can safely ignore this email.
        </p>
      </div>
    `;

    console.log(`[VercelEmailRelay] Sending email to ${to}...`);
    const info = await transporter.sendMail({
      from: `"SchoolSafe Smart Transit" <${user}>`,
      to,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    console.log(`[VercelEmailRelay] Delivered successfully! Message ID: ${info.messageId}`);
    return res.status(200).json({
      success: true,
      delivered: true,
      messageId: info.messageId,
    });
  } catch (err) {
    console.error('[VercelEmailRelay] SMTP error:', err);
    return res.status(500).json({
      success: false,
      delivered: false,
      error: err.message,
    });
  }
}
