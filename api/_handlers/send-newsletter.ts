import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export async function handleSendNewsletter(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { emails, subject, message, senderAccount } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      res.status(400).json({ error: 'Nessun indirizzo email specificato' });
      return;
    }

    if (!subject || !message) {
      res.status(400).json({ error: 'Oggetto e messaggio sono obbligatori' });
      return;
    }

    // Selezione dinamica delle credenziali
    let authUser = process.env.SMTP_USER_PHAYAM || process.env.SMTP_USER;
    let authPass = process.env.SMTP_PASS_PHAYAM || process.env.SMTP_PASS;

    if (senderAccount === 'red') {
      authUser = process.env.SMTP_USER_RED || authUser;
      authPass = process.env.SMTP_PASS_RED || authPass;
    }

    if (!authUser || !authPass) {
      console.error('[send-newsletter] Credenziali SMTP mancanti per account:', senderAccount);
      res.status(500).json({ error: `Credenziali SMTP (${senderAccount}) non configurate nel server` });
      return;
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT || 465);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: authUser,
        pass: authPass
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000
    });

    const cleanEmails = emails
      .map((e: any) => String(e || '').trim())
      .filter((e: string) => e.includes('@'));

    if (cleanEmails.length === 0) {
      res.status(400).json({ error: 'Nessun indirizzo email valido nella lista' });
      return;
    }

    const htmlContent = String(message).replace(/\n/g, '<br>');

    await transporter.sendMail({
      from: `"Flower Power Village" <${authUser}>`,
      to: authUser,
      bcc: cleanEmails,
      subject: subject,
      html: `<div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px;">${htmlContent}</div>`
    });

    res.status(200).json({ success: true, count: cleanEmails.length });
  } catch (error: any) {
    console.error('[send-newsletter] Errore durante l\'invio:', error);
    res.status(500).json({ error: error?.message || 'Invio fallito causa errore server' });
  }
}

export default handleSendNewsletter;
