import { handleOctorateMinStay } from "./_handlers/octorate.js";

export default async function handler(req: any, res: any) {
  return handleOctorateMinStay(req, res);
}
