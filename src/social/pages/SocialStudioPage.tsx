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
  const isAudit = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const search = window.location.search;
    return search.includes('view=audit');
  }, []);

  if (isAudit) {
    return <TikTokAuditStudioPage />;
  }

  return <AutoCutStudioPage />;
}
