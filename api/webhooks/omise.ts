import { handleOmiseWebhook } from "../_handlers/omise-payment.js";

export default async function handler(req: any, res: any) {
  return handleOmiseWebhook(req, res);
}
