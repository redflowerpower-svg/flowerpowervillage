/**
 * Google Business Profile API Service
 * Reparto Stagno: Social Media Studio (/social)
 * 
 * Supports:
 * - OAuth 2.0 Token Status & Authorization URL
 * - Discovery of Accounts & Locations (Flower Power Pizza Ranong & Farm Village Koh Phayam)
 * - Publishing Local Posts (Updates / Events / Offers) on Google Maps & Google Search
 */

export interface GoogleLocation {
  account?: string;
  name: string;
  title: string;
  websiteUri?: string;
  brand?: 'pizza' | 'village';
  address?: any;
  phoneNumbers?: any;
  categories?: any;
  metadata?: any;
}

export interface GoogleBusinessStatus {
  connected: boolean;
  clientId: string | null;
  redirectUri: string;
  authUrl: string;
  accountName?: string;
  locations: GoogleLocation[];
  expiresAt?: number | null;
}

export interface PublishGooglePostParams {
  summary: string;
  locationName?: string;
  brand?: 'pizza' | 'village';
  actionType?: 'ORDER' | 'BOOK' | 'LEARN_MORE' | 'CALL';
  actionUrl?: string;
  mediaUrl?: string;
  topicType?: 'STANDARD' | 'EVENT' | 'OFFER';
}

export async function fetchGoogleStatus(): Promise<GoogleBusinessStatus | null> {
  try {
    const res = await fetch('/api/social-publisher?action=status');
    if (!res.ok) return null;
    const data = await res.json();
    return data.google || null;
  } catch (err) {
    console.warn('[GoogleBusinessService] Error fetching status:', err);
    return null;
  }
}

export async function publishGooglePost(params: PublishGooglePostParams) {
  try {
    const res = await fetch('/api/social-publisher?action=publish_google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to publish to Google Business Profile');
    }
    return data;
  } catch (err: any) {
    console.error('[GoogleBusinessService] Publish error:', err);
    throw err;
  }
}
