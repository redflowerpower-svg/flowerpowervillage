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
    let authUser = process.env.SMTP_USER_PHAYAM || process.env.SMTP_USER || 'flowerpowerphayam@gmail.com';
    let authPass = process.env.SMTP_PASS_PHAYAM || process.env.SMTP_PASS;
    let fromName = 'Flower Power Village';

    if (senderAccount === 'red') {
      authUser = process.env.SMTP_USER_RED || authUser;
      authPass = process.env.SMTP_PASS_RED || authPass;
    } else if (senderAccount === 'pizza' || senderAccount === 'ranong') {
      authUser = process.env.PIZZA_SMTP_USER || 'flowerpowerpizzaranong.th@gmail.com';
      authPass = (process.env.PIZZA_SMTP_PASS || process.env.SMTP_PASS || '').replace(/\s+/g, '');
      fromName = 'Flower Power Pizza Ranong';
    }

    if (!authUser || !authPass) {
      console.error('[send-newsletter] Credenziali SMTP mancanti per account:', senderAccount);
      res.status(500).json({ error: `Credenziali SMTP (${senderAccount}) non configurate nel server` });
      return;
    }

    const smtpHost = (senderAccount === 'pizza' ? process.env.PIZZA_SMTP_HOST : process.env.SMTP_HOST) || 'smtp.gmail.com';
    const smtpPort = Number((senderAccount === 'pizza' ? process.env.PIZZA_SMTP_PORT : process.env.SMTP_PORT) || 465);

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

    const htmlContent = body.html || `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 16px; overflow: hidden; color: #1c1917;">
        <div style="background-color: ${senderAccount === 'pizza' ? '#8B1E1E' : '#1c1917'}; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 20px; margin: 0; font-weight: 900; letter-spacing: 0.5px;">
            ${senderAccount === 'pizza' ? '🍕 FLOWER POWER PIZZA RANONG' : 'FLOWER POWER VILLAGE'}
          </h1>
        </div>
        <div style="padding: 28px 24px; line-height: 1.7; font-size: 14px;">
          ${String(message).replace(/\n/g, '<br>')}
        </div>
        <div style="background-color: #f5f5f4; padding: 18px 24px; text-align: center; font-size: 11px; color: #78716c; border-top: 1px solid #e7e5e4;">
          <p style="margin: 0 0 6px;"><b>${fromName}</b> · Ranong, Thailand</p>
          <p style="margin: 0;">Ricevi questa email perché hai effettuato un ordine o una richiesta presso la nostra struttura.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${fromName}" <${authUser}>`,
      to: authUser,
      bcc: cleanEmails,
      subject: subject,
      html: htmlContent
    });

    res.status(200).json({ success: true, count: cleanEmails.length });
  } catch (error: any) {
    console.error('[send-newsletter] Errore durante l\'invio:', error);
    res.status(500).json({ error: error?.message || 'Invio fallito causa errore server' });
  }
}

export default handleSendNewsletter;
