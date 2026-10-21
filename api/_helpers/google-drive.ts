import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  folderId: string;
}

/**
 * Retrieves Google Drive credentials dynamically from env or Supabase fallback
 * (Zero hardcoded secrets to guarantee complete security)
 */
export async function getGoogleDriveConfig(): Promise<GoogleDriveConfig> {
  let clientId = process.env.GOOGLE_CLIENT_ID || "";
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  let refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || "";
  let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "";

  if ((!clientId || !clientSecret || !refreshToken || !folderId) && supabase) {
    try {
      const { data } = await supabase
        .from("telegram_config")
        .select("bot_token, chat_id")
        .eq("id", "google_drive")
        .maybeSingle();

      if (data) {
        if (!refreshToken && data.bot_token) refreshToken = data.bot_token;
        if (data.chat_id) {
          try {
            const parsed = JSON.parse(data.chat_id);
            if (!clientId && parsed.client_id) clientId = parsed.client_id;
            if (!clientSecret && parsed.client_secret) clientSecret = parsed.client_secret;
            if (!refreshToken && parsed.refresh_token) refreshToken = parsed.refresh_token;
            if (!folderId && parsed.folder_id) folderId = parsed.folder_id;
          } catch {
            // chat_id is plain folder ID string
            if (!folderId) folderId = data.chat_id;
          }
        }
      }
    } catch (e) {
      console.warn("[GoogleDrive] Error fetching config from Supabase:", e);
    }
  }

  return { clientId, clientSecret, refreshToken, folderId };
}

/**
 * Gets a fresh Google Drive access token using OAuth refresh token
 */
export async function getGoogleDriveAccessToken(): Promise<string> {
  const config = await getGoogleDriveConfig();
  if (!config.refreshToken || !config.clientId || !config.clientSecret) {
    throw new Error("Missing Google Drive OAuth credentials");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token"
    })
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Google Drive token refresh failed: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

export interface UploadOptions {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folderId?: string;
}

export interface UploadResult {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
}

/**
 * Uploads a file (photo, video, document) to the Google Drive vault folder
 */
export async function uploadFileToGoogleDrive(options: UploadOptions): Promise<UploadResult> {
  const accessToken = await getGoogleDriveAccessToken();
  const config = await getGoogleDriveConfig();
  const targetFolderId = options.folderId || config.folderId;

  if (!targetFolderId) {
    throw new Error("Target Google Drive folder ID is missing");
  }

  const metadata = {
    name: options.fileName,
    parents: [targetFolderId]
  };

  const boundary = "----G禦iveUploadBoundary" + Date.now();
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelim = "\r\n--" + boundary + "--";

  const metadataPart = delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) + "\r\n";

  const fileHeader = "--" + boundary + "\r\n" +
    `Content-Type: ${options.mimeType || "application/octet-stream"}\r\n\r\n`;

  const bodyBuffer = Buffer.concat([
    Buffer.from(metadataPart, "utf8"),
    Buffer.from(fileHeader, "utf8"),
    options.buffer,
    Buffer.from(closeDelim, "utf8")
  ]);

  const uploadRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
      "Content-Length": bodyBuffer.length.toString()
    },
    body: bodyBuffer
  });

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.id) {
    throw new Error(`Google Drive upload failed (${uploadRes.status}): ${JSON.stringify(uploadData)}`);
  }

  return uploadData as UploadResult;
}
