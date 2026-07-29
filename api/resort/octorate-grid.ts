import { handleOctorateGrid } from "../_handlers/octorate.js";

export default async function handler(req: any, res: any) {
  return handleOctorateGrid(req, res);
}
