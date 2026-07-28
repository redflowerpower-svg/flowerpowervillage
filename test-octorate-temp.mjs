import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envPath = "./.env";
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
envContent.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || "";
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    envVars[key] = val;
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const url = "https://api.octorate.com/connect/rest/v1/reservation/new";

async function testPayload(token, name, extra) {
  const payload = {
    checkIn: "2026-07-20",
    checkOut: "2026-07-22",
    guestName: "Test Rossi",
    guestEmail: "test@rossi.com",
    phone: "123456789",
    note: "Test reservation",
    totalPrice: 3600,
    ...extra
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    console.log(`[${name}] Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`[${name}] Response: ${text}`);
  } catch (err) {
    console.log(`[${name}] Error: ${err.message}`);
  }
}

async function run() {
  const { data: tokenData } = await supabase
    .from("octorate_tokens")
    .select("access_token")
    .eq("id", "singleton")
    .maybeSingle();

  const token = tokenData.access_token;
  console.log("Found token:", token.substring(0, 10) + "...");

  // Let's test combinations of structure + roomRate/accommodation objects
  await testPayload(token, "combo 1: structure {id} + accommodation {id}", {
    structure: { id: 366879 },
    accommodation: { id: 449385 }
  });

  await testPayload(token, "combo 2: structure {id} + accommodationId as number", {
    structure: { id: 366879 },
    accommodationId: 449385
  });

  await testPayload(token, "combo 3: structure {id} + roomRate {id}", {
    structure: { id: 366879 },
    roomRate: { id: 449385 }
  });

  await testPayload(token, "combo 4: structure {id} + ratePlan {id}", {
    structure: { id: 366879 },
    ratePlan: { id: 449385 }
  });
}
run();
