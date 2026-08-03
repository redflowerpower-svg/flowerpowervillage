import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export async function handleSendNewsletter(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') return res.status(405).json({ error: 'No' });
  const { emails, subject, message, senderAccount } = req.body;
  if (!emails || !emails.length) return res.status(200).json({ success: true });

  try {
    // Selezione dinamica delle credenziali
    let authUser = process.env.SMTP_USER_PHAYAM || process.env.SMTP_USER;
    let authPass = process.env.SMTP_PASS_PHAYAM || process.env.SMTP_PASS;

    if (senderAccount === 'red') {
      authUser = process.env.SMTP_USER_RED || authUser;
      authPass = process.env.SMTP_PASS_RED || authPass;
    }

    if (!authUser || !authPass) {
      throw new Error('Credenziali SMTP mancanti nel server');
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: authUser,
        pass: authPass
      },
    });

    const htmlContent = message.replace(/\n/g, '<br>');
    await transporter.sendMail({
      from: `"Flower Power Village" <${authUser}>`,
      to: authUser,
      bcc: emails.join(','),
      subject: subject,
      html: `<div style="font-family: sans-serif; color: #333;">${htmlContent}</div>`
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Invio fallito' });
  }
}

export default handleSendNewsletter;
