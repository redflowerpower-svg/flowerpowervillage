import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    }
  }
}

async function run() {
  loadEnv();
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
    return;
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Reading octorate_tokens from new Singapore Supabase DB...");
  const { data, error } = await supabase
    .from("octorate_tokens")
    .select("*")
    .eq("id", "singleton")
    .maybeSingle();

  if (error) {
    console.error("Database Error:", error);
    return;
  }

  if (data) {
    console.log("Octorate token found in Singapore DB:", {
      id: data.id,
      expires_in: data.expires_in,
      updated_at: data.updated_at,
      has_access_token: !!data.access_token,
      has_refresh_token: !!data.refresh_token,
    });
  } else {
    console.log("No Octorate token found in Singapore DB (table is empty).");
  }
}

run();
