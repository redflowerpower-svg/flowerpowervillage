import { handleOctorateBookings } from "../_handlers/octorate.js";

export default async function handler(req: any, res: any) {
  return handleOctorateBookings(req, res);
}
