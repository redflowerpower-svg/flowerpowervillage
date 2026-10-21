import React, { useMemo } from 'react';
import AutoCutStudioPage from './AutoCutStudioPage';
import TikTokAuditStudioPage from './TikTokAuditStudioPage';

export type UILanguage = 'EN' | 'IT';

/**
 * SocialStudioPage Switcher:
 * - Localhost / Local Dev (http://localhost:5173/social): Loads the modern AutoCut Studio Page
 *   with Ken Burns cinematic video players, Ranong live weather, DeepSeek AI copywriter & Proverbio del Giorno.
 * - Production (https://www.flowerpowerpizza.com/social): Loads the exact primordial TikTok Audit
 *   interface submitted for TikTok Developer API review and app approval.
 * - Query overrides:
 *   - ?view=modern force-loads AutoCut Studio (even on production for staff).
 *   - ?view=audit force-loads the TikTok Audit page (for local verification).
 */
export default function SocialStudioPage() {
  const isLocalOrModern = useMemo(() => {
    if (typeof window === 'undefined') return false;

    const hostname = window.location.hostname;
    const search = window.location.search;

    // Explicit manual overrides
    if (search.includes('view=modern')) return true;
    if (search.includes('view=audit')) return false;

    // Local development hosts
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.local');

    return isLocalhost;
  }, []);

  if (isLocalOrModern) {
    return <AutoCutStudioPage />;
  }

  return <TikTokAuditStudioPage />;
}
