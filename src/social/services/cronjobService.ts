/**
 * ⏰ CronJob Service (Client-Side per Social Media Studio)
 * Reparto Stagno Social Media Studio (/social)
 * 
 * Interfaccia per la gestione dei cron job di cron-job.org dal frontend di /social
 * chiamando l'endpoint sicuro /api/social-publisher protetto da token Staff Supabase.
 */

import { supabase } from '../../lib/supabase';

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
  schedule: {
    timezone: string;
    hours: number[];
    minutes: number[];
    mdays: number[];
    months: number[];
    wdays: number[];
  };
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch {}
  return headers;
}

export async function fetchCronJobs(): Promise<{ ok: boolean; jobs?: CronJobItem[]; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/social-publisher?action=cronjob_list", {
      headers
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to fetch cron jobs" };
  }
}

export async function syncOfficialCronJobs(): Promise<{ ok: boolean; message?: string; details?: any; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/social-publisher?action=cronjob_sync", {
      method: "POST",
      headers
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to sync cron jobs" };
  }
}

export async function toggleCronJob(jobId: number, enabled: boolean): Promise<{ ok: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/social-publisher?action=cronjob_toggle", {
      method: "POST",
      headers,
      body: JSON.stringify({ jobId, enabled })
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to toggle cron job" };
  }
}
