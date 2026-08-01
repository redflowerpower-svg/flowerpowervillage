import { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCreateCheckoutSession } from "./_handlers/checkout.js";
import { handleVerifyCheckoutSession } from "./_handlers/verify.js";
import { handleDownloadConfirmation } from "./_handlers/download.js";
import {
  handleTelegramNotify,
  handleTelegramUpdateStatus,
  handleTelegramWebhook,
  handleSyncTelegramWebhook
} from "./_handlers/telegram.js";
import {
  handleOctorateExchange,
  handleOctorateRefresh,
  handleOctorateTokens,
  handleOctorateClientGet,
  handleOctorateClientClear,
  handleOctorateBookings,
  handleOctorateGrid,
  handleOctorateMinStay
} from "./_handlers/octorate.js";
import { handleOctorateWebhook } from "./_handlers/octorate-webhook.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.url?.includes('webhooks/octorate') || req.url?.includes('octorate-webhook')) {
      if (req.method === 'GET' || req.method === 'HEAD') {
          return res.status(200).json({ status: "Webhook Ready" });
      }
      return handleOctorateWebhook(req, res); 
  }

  // Extract path from req.url or req.query.route
  const rawUrl = req.url || '';
  const pathname = rawUrl.split('?')[0].replace(/^\/+/, ''); // e.g. "api/create-checkout-session" or "api/resort/octorate-grid"

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Normalize path string (remove leading 'api/' and trailing slashes)
  const queryRoute = Array.isArray(req.query?.route) ? req.query.route.join('/') : String(req.query?.route || '');
  const cleanPath = (pathname || queryRoute || '').replace(/^api\//, '').replace(/\/$/, '');

  if (cleanPath.includes('min-stay') || cleanPath.includes('minstay')) {
    return handleOctorateMinStay(req, res);
  }

  if (cleanPath.includes('octorate-bookings') || cleanPath.includes('octorate_bookings')) {
    return handleOctorateBookings(req, res);
  }

  if (cleanPath.includes('octorate-grid') || cleanPath.includes('octorate_grid')) {
    return handleOctorateGrid(req, res);
  }

  switch (cleanPath) {
    case 'create-checkout-session':
      return handleCreateCheckoutSession(req, res);

    case 'verify-checkout-session':
      return handleVerifyCheckoutSession(req, res);

    case 'download-confirmation':
      return handleDownloadConfirmation(req, res);

    case 'telegram-notify':
      return handleTelegramNotify(req, res);

    case 'telegram-update-status':
      return handleTelegramUpdateStatus(req, res);

    case 'telegram-webhook':
      return handleTelegramWebhook(req, res);

    case 'admin/sync-telegram-webhook':
      return handleSyncTelegramWebhook(req, res);

    case 'octorate-exchange':
      return handleOctorateExchange(req, res);

    case 'octorate-refresh':
      return handleOctorateRefresh(req, res);

    case 'octorate-tokens':
      return handleOctorateTokens(req, res);

    case 'octorate-client-get':
      return handleOctorateClientGet(req, res);

    case 'octorate-client-clear':
      return handleOctorateClientClear(req, res);

    case 'resort/octorate-bookings':
      return handleOctorateBookings(req, res);

    case 'resort/octorate-grid':
      return handleOctorateGrid(req, res);

    case 'resort/octorate/min-stay':
    case 'resort/octorate-min-stay':
    case 'octorate-min-stay':
      return handleOctorateMinStay(req, res);

    case 'webhooks/octorate':
    case 'octorate-webhook':
    case 'webhooks/octoraate':
      return handleOctorateWebhook(req, res);

    default:
      return res.status(404).json({ error: `Route not found: /api/${cleanPath}` });
  }
}
