import { handleOctorateRestrictionsGrid } from "../_handlers/octorate-restrictions-grid.js";

export default async function handler(req: any, res: any) {
  try {
    return await handleOctorateRestrictionsGrid(req, res);
  } catch (error: any) {
    console.error("[OCTORATE RESTRICTIONS GRID ERROR]:", error);
    if (res && typeof res.status === 'function') {
      return res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
