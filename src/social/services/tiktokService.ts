/**
 * TikTok Content Posting API (v2) Client Service
 * Reparto Stagno: Social Media Studio (/social)
 * Specs reference: documentation_reports/20_docs_tiktok_api.md
 */

import { supabase } from '../../lib/supabase';

export interface TikTokTokenData {
  open_id: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  scope: string;
  updated_at?: string;
}

export interface TikTokPublishResult {
  success: boolean;
  publish_id?: string;
  error?: string;
  raw?: any;
}

export interface TikTokStatusResult {
  status: 'PROCESSING_DOWNLOAD' | 'PROCESSING_UPLOAD' | 'SUCCESS' | 'FAILED';
  fail_reason?: string;
  publicaly_available_post_id?: string[];
  raw?: any;
}

/**
 * Generates the official TikTok OAuth 2.0 authorization URL for a specific brand ('village' or 'pizza')
 */
export function getTikTokAuthUrl(brand: 'village' | 'pizza' = 'village'): string {
  const clientKey = import.meta.env.VITE_TIKTOK_CLIENT_KEY || 'awsghb9gm4smzsic';
  const redirectUri = 'https://flowerpowerpizza.com/api/social-callback';
  const state = `tiktok_${brand}`;
  return `https://www.tiktok.com/v2/auth/authorize/?client_key=${encodeURIComponent(clientKey)}&scope=user.info.basic,video.publish,video.upload&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
}

/**
 * Fetches the active TikTok account credentials from Supabase, brand-isolated and excluding sandbox mocks
 */
export async function getActiveTikTokAccount(brandOrOpenId?: string): Promise<TikTokTokenData | null> {
  if (!supabase) return null;

  const isBrand = brandOrOpenId === 'village' || brandOrOpenId === 'pizza';
  const brand = isBrand ? brandOrOpenId : undefined;
  const openId = !isBrand ? brandOrOpenId : undefined;

  try {
    // 1. Check brand-dedicated row in telegram_config
    if (brand) {
      const { data: brandData } = await supabase
        .from('telegram_config')
        .select('*')
        .eq('id', `tiktok_${brand}`)
        .maybeSingle();

      if (brandData && brandData.bot_token && !brandData.bot_token.startsWith('act.tiktok_sandbox_')) {
        try {
          const parsed = JSON.parse(brandData.chat_id || '{}');
          return {
            open_id: parsed.open_id || brandData.id.replace('tiktok_', ''),
            access_token: brandData.bot_token,
            refresh_token: parsed.refresh_token || '',
            expires_in: parsed.expires_in || 86400,
            refresh_expires_in: parsed.refresh_expires_in || 31536000,
            scope: parsed.scope || 'video.publish,video.upload,user.info.basic',
            updated_at: brandData.updated_at
          };
        } catch {}
      }
    }

    // 2. Query social_accounts table if available
    let query = supabase.from('social_accounts').select('*').eq('platform', 'tiktok');
    if (openId) {
      query = query.eq('open_id', openId);
    }
    const { data, error } = await query.order('updated_at', { ascending: false }).limit(1).maybeSingle();

    if (!error && data && data.access_token && !data.access_token.startsWith('act.tiktok_sandbox_')) {
      return data as TikTokTokenData;
    }

    // 3. Fallback: Check telegram_config store for any non-mock TikTok token
    const { data: fallbackList } = await supabase
      .from('telegram_config')
      .select('*')
      .like('id', 'tiktok_%')
      .neq('id', 'tiktok_sb_user_flowerpower_review')
      .neq('id', 'tiktok_app_config')
      .order('updated_at', { ascending: false });

    if (fallbackList && fallbackList.length > 0) {
      const nonMock = fallbackList.find(f => f.bot_token && !f.bot_token.startsWith('act.tiktok_sandbox_'));
      if (nonMock) {
        try {
          const parsed = JSON.parse(nonMock.chat_id || '{}');
          return {
            open_id: parsed.open_id || nonMock.id.replace('tiktok_', ''),
            access_token: nonMock.bot_token,
            refresh_token: parsed.refresh_token || '',
            expires_in: parsed.expires_in || 86400,
            refresh_expires_in: parsed.refresh_expires_in || 31536000,
            scope: parsed.scope || 'video.publish,video.upload,user.info.basic',
            updated_at: nonMock.updated_at
          };
        } catch {}
      }
    }
  } catch (err) {
    console.warn('[TikTokService] Error retrieving account:', err);
  }

  return null;
}

/**
 * Refreshes an expired TikTok user access token using the refresh_token (grant_type: refresh_token).
 * Standard TikTok tokens expire after 24 hours. Refresh tokens are valid for up to 365 days.
 */
export async function refreshTikTokToken(refreshToken: string): Promise<TikTokTokenData | null> {
  const clientKey = import.meta.env.VITE_TIKTOK_CLIENT_KEY || '';
  
  // Note: Client secret is kept safe on server. We delegate refresh to our API handler if on client
  try {
    const res = await fetch('/api/social-callback?action=refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (res.ok) {
      const data = await res.json();
      return data as TikTokTokenData;
    }
  } catch (err) {
    console.error('[TikTokService] Refresh token call failed:', err);
  }

  return null;
}

/**
 * Publishes a video directly to TikTok via PULL_FROM_URL
 * Endpoint: POST https://open.tiktokapis.com/v2/post/publish/video/init/
 */
export async function publishDirectVideo(
  accessToken: string,
  videoUrl: string,
  title: string,
  options?: {
    privacy_level?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY' | 'FOLLOWER_OF_CREATOR';
    disable_comment?: boolean;
    disable_duet?: boolean;
    disable_stitch?: boolean;
  }
): Promise<TikTokPublishResult> {
  try {
    const payload = {
      post_info: {
        title: title.slice(0, 150),
        privacy_level: options?.privacy_level || 'PUBLIC_TO_EVERYONE',
        disable_comment: options?.disable_comment ?? false,
        disable_duet: options?.disable_duet ?? false,
        disable_stitch: options?.disable_stitch ?? false,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoUrl,
      },
    };

    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || (data.error && data.error.code !== 'ok' && data.error.code !== 0 && data.error.code !== '')) {
      const errorMsg = data.error?.message || data.message || 'Errore durante la pubblicazione video su TikTok';
      return { success: false, error: errorMsg, raw: data };
    }

    const publishId = data.data?.publish_id || data.publish_id;
    return {
      success: true,
      publish_id: publishId,
      raw: data,
    };
  } catch (err: any) {
    console.error('[TikTokService] publishDirectVideo failed:', err);
    return { success: false, error: err.message || 'Eccezione di rete TikTok API' };
  }
}

/**
 * Publishes a photo post or carousel (1 to 35 images) directly to TikTok
 * Endpoint: POST https://open.tiktokapis.com/v2/post/publish/content/init/
 */
export async function publishDirectPhoto(
  accessToken: string,
  photoUrls: string[],
  title: string,
  description?: string
): Promise<TikTokPublishResult> {
  try {
    const payload = {
      media_type: 'PHOTO',
      post_mode: 'DIRECT_POST',
      post_info: {
        title: title.slice(0, 90),
        description: (description || title).slice(0, 4000),
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_comment: false,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        photo_images: photoUrls.slice(0, 35),
      },
    };

    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || (data.error && data.error.code !== 'ok' && data.error.code !== 0 && data.error.code !== '')) {
      const errorMsg = data.error?.message || data.message || 'Errore durante la pubblicazione foto su TikTok';
      return { success: false, error: errorMsg, raw: data };
    }

    const publishId = data.data?.publish_id || data.publish_id;
    return {
      success: true,
      publish_id: publishId,
      raw: data,
    };
  } catch (err: any) {
    console.error('[TikTokService] publishDirectPhoto failed:', err);
    return { success: false, error: err.message || 'Eccezione di rete TikTok API' };
  }
}

/**
 * Checks the status of an asynchronous TikTok publishing task
 * Endpoint: POST https://open.tiktokapis.com/v2/post/publish/status/fetch/
 */
export async function fetchPublishStatus(accessToken: string, publishId: string): Promise<TikTokStatusResult | null> {
  try {
    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({ publish_id: publishId }),
    });

    const data = await res.json();
    if (res.ok && data.data) {
      return {
        status: data.data.status,
        fail_reason: data.data.fail_reason,
        publicaly_available_post_id: data.data.publicaly_available_post_id,
        raw: data,
      };
    }
  } catch (err) {
    console.warn('[TikTokService] Status fetch error:', err);
  }
  return null;
}
