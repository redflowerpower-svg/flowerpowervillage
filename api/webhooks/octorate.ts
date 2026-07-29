import { handleOctorateWebhook } from "../_handlers/octorate-webhook.js";

export default async function handler(req: any, res: any) {
  // Ping Catcher per Octorate e Vercel
  if (req.method === 'GET' || req.method === 'HEAD') {
    return res.status(200).json({ status: "Webhook Ready" });
  }
  return handleOctorateWebhook(req, res);
}
