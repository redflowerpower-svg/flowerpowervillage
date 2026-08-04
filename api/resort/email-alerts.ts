import { handleEmailAlerts } from "../_handlers/email-alerts.js";

export default async function handler(req: any, res: any) {
  return handleEmailAlerts(req, res);
}
