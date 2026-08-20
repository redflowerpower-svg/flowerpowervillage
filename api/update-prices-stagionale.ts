import { handleUpdatePricesStagionale } from "./_handlers/api-update-prices-stagionale.js";

export default async function handler(req: any, res: any) {
  return handleUpdatePricesStagionale(req, res);
}
