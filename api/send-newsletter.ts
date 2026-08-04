import { handleSendNewsletter } from "./_handlers/send-newsletter.js";

export default async function handler(req: any, res: any) {
  return handleSendNewsletter(req, res);
}
