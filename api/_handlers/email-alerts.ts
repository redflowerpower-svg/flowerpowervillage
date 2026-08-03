import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

/**
 * emailAlertsHandler — Invia email di allerta phishing ai clienti del resort.
 * Attivato dal componente PhishingAlertSection in /admin/resort.
 * Instradato da api/[...route].ts su /api/resort/email-alerts (Catch-All, no nuova serverless function).
 */
export async function handleEmailAlerts(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { emails, guestName } = req.body as { emails: string[]; guestName?: string };

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    res.status(400).json({ error: 'No email addresses provided' });
    return;
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    res.status(500).json({ error: 'SMTP configuration missing in environment variables' });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const greeting = guestName ? `Dear ${guestName},` : 'Dear valued guest,';

    const mailOptions = {
      from: `"Flower Power Village" <${smtpUser}>`,
      to: emails.join(','),
      subject: '⚠️ IMPORTANT SECURITY NOTICE — Flower Power Village',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #f5f5f5; border-radius: 12px; padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #e11d48; font-size: 22px; margin: 0;">⚠️ SECURITY ALERT</h1>
            <p style="color: #f59e0b; font-size: 14px; margin: 8px 0 0;">Flower Power Village — Koh Phayam, Thailand</p>
          </div>
          <p style="line-height: 1.7; color: #e5e5e5;">${greeting}</p>
          <p style="line-height: 1.7; color: #e5e5e5;">
            We are contacting you because our booking management system <strong>Octorate</strong> has reported
            a potential security breach affecting guest contact data.
          </p>
          <div style="background: #7f1d1d; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #fca5a5; font-weight: bold; font-size: 15px;">
              🚫 If you receive ANY message asking for extra payments, wire transfers, or clicks on links
              claiming to be from Flower Power Village or Octorate — DO NOT COMPLY and block the sender immediately.
            </p>
          </div>
          <p style="line-height: 1.7; color: #e5e5e5;">
            <strong>We will NEVER ask for additional payments via WhatsApp, SMS, or unknown email addresses.</strong>
            All official communications come exclusively from this email address.
          </p>
          <p style="line-height: 1.7; color: #e5e5e5;">
            If you have already interacted with a suspicious message, please contact us immediately:<br/>
            📧 <a href="mailto:${smtpUser}" style="color: #f59e0b;">${smtpUser}</a>
          </p>
          <hr style="border-color: #3f3f3f; margin: 24px 0;" />
          <p style="color: #737373; font-size: 12px; text-align: center; margin: 0;">
            Flower Power Village — Koh Phayam, Ranong, Thailand<br/>
            This is an automated security notification. Please do not reply directly to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, sent: emails.length });
  } catch (error: any) {
    console.error('[emailAlerts] SMTP error:', error?.message || error);
    res.status(500).json({ error: 'Failed to send email', details: error?.message });
  }
}
