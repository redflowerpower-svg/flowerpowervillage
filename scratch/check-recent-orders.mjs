import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach(l => {
  const [k, ...v] = l.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim().replace(/^['"]|['"]$/g, "");
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await supabase
  .from("pizza_orders")
  .select("id, customer_name, status, payment_method, created_at")
  .order("created_at", { ascending: false })
  .limit(10);

console.log("Recent orders:", data, "Error:", error);
