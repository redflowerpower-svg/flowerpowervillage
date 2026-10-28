/**
 * ⏰ CronJob.org REST API v2 Client
 * Reparto Stagno Social Media Studio (/social) & Serverless Scheduler
 * 
 * Permette la gestione programmatica completa dei cron job esterni (sveglia 24/7):
 * - createJob: Creazione nuovo job schedulato
 * - updateJob: Aggiornamento orari, URL o stato
 * - deleteJob: Eliminazione job
 * - getJobDetails: Dettagli e statistiche job
 * - listJobs: Elenco di tutti i job attivi/disattivi
 * - getJobHistory: Storico esecuzioni e latenze
 */

import { createClient } from "@supabase/supabase-js";

const CRONJOB_API_BASE = "https://api.cron-job.org";

export interface CronJobSchedule {
  timezone?: string; // Default: 'Asia/Bangkok'
  expiresAt?: number; // 0 = nessun limite
  hours?: number[]; // [-1] = ogni ora, oppure [8, 9, 11, 12, 16, 17, 18, 19, 20, 21]
  minutes?: number[]; // [0, 30]
  mdays?: number[]; // [-1] = ogni giorno
  months?: number[]; // [-1] = ogni mese
  wdays?: number[]; // [-1] = ogni giorno della settimana
}

export interface CronJobNotification {
  onFailure?: boolean; // Notifica su fallimento
  onFailureCount?: number; // Quanti errori consecutivi prima di notificare
  onSuccess?: boolean; // Disattivato di default per anti-spam
  onDisable?: boolean; // Notifica se il job viene disattivato
  onSslCertExpiry?: boolean;
  onSslCertExpirySeconds?: number;
}

export interface CronJobExtendedData {
  headers?: Record<string, string>;
  body?: string;
}

export interface CronJobData {
  title: string;
  url: string;
  enabled?: boolean;
  saveResponses?: boolean;
  requestMethod?: number; // 0 = GET, 1 = POST
  schedule?: CronJobSchedule;
  notification?: CronJobNotification;
  extendedData?: CronJobExtendedData;
}

export interface CronJobItem {
  jobId: number;
  enabled: boolean;
  title: string;
  url: string;
  saveResponses: boolean;
  lastStatus?: number;
  lastDuration?: number;
  lastExecution?: number;
  nextExecution?: number;
  schedule: CronJobSchedule;
  requestMethod: number;
}

export interface CronJobListResponse {
  jobs: CronJobItem[];
  someFailed?: boolean;
}

export interface CronJobDetailsResponse {
  jobDetails: CronJobItem & {
    notification?: CronJobNotification;
    extendedData?: CronJobExtendedData;
  };
}

/**
 * Risolve l'API Key di cron-job.org:
 * 1. Da process.env.CRONJOB_ORG_API_KEY
 * 2. Fallback protetto da Supabase telegram_config (id: cronjob_org_api_key)
 */
export async function getCronJobApiKey(): Promise<string> {
  if (process.env.CRONJOB_ORG_API_KEY) {
    return process.env.CRONJOB_ORG_API_KEY.trim();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from("telegram_config")
        .select("bot_token")
        .eq("id", "cronjob_org_api_key")
        .single();
      if (data?.bot_token) {
        return data.bot_token.trim();
      }
    } catch (err) {
      console.warn("[cronjob-service] Errore lettura API Key da Supabase:", err);
    }
  }

  return "";
}

/**
 * Helper per chiamate HTTP verso api.cron-job.org
 */
async function cronJobFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const apiKey = await getCronJobApiKey();
  if (!apiKey) {
    throw new Error("CRONJOB_ORG_API_KEY non configurata né in env né in Supabase");
  }

  const url = `${CRONJOB_API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const responseText = await response.text();
  let json: any = null;
  try {
    json = JSON.parse(responseText);
  } catch {
    json = { raw: responseText };
  }

  if (!response.ok) {
    const errorMsg = json?.error?.message || json?.error || json?.message || responseText || `HTTP ${response.status}`;
    throw new Error(`Cron-job.org API Error (${response.status}): ${typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}`);
  }

  return json as T;
}

/**
 * 1. Lista tutti i cron job registrati sull'account
 */
export async function listJobs(): Promise<CronJobListResponse> {
  return await cronJobFetch<CronJobListResponse>("/jobs", { method: "GET" });
}

/**
 * 2. Recupera i dettagli completi di un singolo job
 */
export async function getJobDetails(jobId: number): Promise<CronJobDetailsResponse> {
  return await cronJobFetch<CronJobDetailsResponse>(`/jobs/${jobId}`, { method: "GET" });
}

/**
 * 3. Crea un nuovo cron job con best-practices preconfigurate
 * - Fuso predefinito: Asia/Bangkok
 * - Anti-spam: notifyOnSuccess = false, onFailureCount = 2
 */
export async function createJob(data: CronJobData): Promise<{ jobId: number }> {
  const payload = {
    job: {
      title: data.title,
      url: data.url,
      enabled: data.enabled ?? true,
      saveResponses: data.saveResponses ?? true,
      requestMethod: data.requestMethod ?? 0, // 0 = GET
      schedule: {
        timezone: data.schedule?.timezone || "Asia/Bangkok",
        expiresAt: data.schedule?.expiresAt ?? 0,
        hours: data.schedule?.hours || [-1],
        minutes: data.schedule?.minutes || [0, 30],
        mdays: data.schedule?.mdays || [-1],
        months: data.schedule?.months || [-1],
        wdays: data.schedule?.wdays || [-1]
      },
      notification: {
        onFailure: data.notification?.onFailure ?? true,
        onFailureCount: data.notification?.onFailureCount ?? 2,
        onSuccess: data.notification?.onSuccess ?? false, // Anti-spam: zero email quando va a buon fine
        onDisable: data.notification?.onDisable ?? true,
        onSslCertExpiry: data.notification?.onSslCertExpiry ?? true,
        onSslCertExpirySeconds: data.notification?.onSslCertExpirySeconds ?? 604800
      },
      ...(data.extendedData ? { extendedData: data.extendedData } : {})
    }
  };

  return await cronJobFetch<{ jobId: number }>("/jobs", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

/**
 * 4. Aggiorna un cron job esistente
 */
export async function updateJob(jobId: number, data: Partial<CronJobData>): Promise<{ jobId: number }> {
  const payload: any = { job: {} };

  if (data.title !== undefined) payload.job.title = data.title;
  if (data.url !== undefined) payload.job.url = data.url;
  if (data.enabled !== undefined) payload.job.enabled = data.enabled;
  if (data.saveResponses !== undefined) payload.job.saveResponses = data.saveResponses;
  if (data.requestMethod !== undefined) payload.job.requestMethod = data.requestMethod;

  if (data.schedule) {
    payload.job.schedule = {
      timezone: data.schedule.timezone || "Asia/Bangkok",
      expiresAt: data.schedule.expiresAt ?? 0,
      hours: data.schedule.hours || [-1],
      minutes: data.schedule.minutes || [0, 30],
      mdays: data.schedule.mdays || [-1],
      months: data.schedule.months || [-1],
      wdays: data.schedule.wdays || [-1]
    };
  }

  if (data.notification) {
    payload.job.notification = {
      onFailure: data.notification.onFailure ?? true,
      onFailureCount: data.notification.onFailureCount ?? 2,
      onSuccess: data.notification.onSuccess ?? false,
      onDisable: data.notification.onDisable ?? true,
      onSslCertExpiry: data.notification.onSslCertExpiry ?? true,
      onSslCertExpirySeconds: data.notification.onSslCertExpirySeconds ?? 604800
    };
  }

  if (data.extendedData) {
    payload.job.extendedData = data.extendedData;
  }

  return await cronJobFetch<{ jobId: number }>(`/jobs/${jobId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

/**
 * 5. Elimina un cron job esistente
 */
export async function deleteJob(jobId: number): Promise<{ success: boolean }> {
  await cronJobFetch(`/jobs/${jobId}`, { method: "DELETE" });
  return { success: true };
}

/**
 * 6. Recupera lo storico delle ultime esecuzioni di un job
 */
export async function getJobHistory(jobId: number): Promise<any> {
  return await cronJobFetch(`/jobs/${jobId}/history`, { method: "GET" });
}

