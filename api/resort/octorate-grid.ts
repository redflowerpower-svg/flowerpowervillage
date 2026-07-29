import { handleOctorateGrid } from "../_handlers/octorate.js";

export default async function handler(req: any, res: any) {
  try {
    return await handleOctorateGrid(req, res);
  } catch (error: any) {
    console.error("[OCTORATE GRID ERROR CRITICO]:", error);
    if (res && typeof res.status === 'function') {
      return res.status(500).json({ error: error?.message || 'Internal Server Error', stack: error?.stack });
    }
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal Server Error', stack: error?.stack }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
