import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Authorization check using a simple secret to prevent misuse
  const secret = req.query.secret;
  if (secret !== "flowerpowerdelete123") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("Listing files in bucket 'delivery_food' folder '01-Pizza'...");
    const { data: files, error: listError } = await supabase
      .storage
      .from("delivery_food")
      .list("01-Pizza", { limit: 200 });

    if (listError) {
      return res.status(500).json({ error: "Failed to list files", details: listError });
    }

    const pngFiles = files
      .filter((f: any) => f.name && f.name.toLowerCase().endsWith(".png"))
      .map((f: any) => `01-Pizza/${f.name}`);

    console.log(`Found ${pngFiles.length} PNG files to remove:`, pngFiles);

    if (pngFiles.length === 0) {
      return res.status(200).json({ success: true, message: "No PNG files found to delete" });
    }

    const { data: deleted, error: deleteError } = await supabase
      .storage
      .from("delivery_food")
      .remove(pngFiles);

    if (deleteError) {
      return res.status(500).json({ error: "Failed to delete files", details: deleteError });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${pngFiles.length} PNG files`,
      deleted
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}
