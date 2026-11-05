import React, { useMemo } from 'react';
import AutoCutStudioPage from './AutoCutStudioPage';
import TikTokAuditStudioPage from './TikTokAuditStudioPage';

export type UILanguage = 'EN' | 'IT';

/**
 * SocialStudioPage Switcher:
 * - /social (Production & Local): By default, strictly renders the approved TikTok Audit Hub
 *   (TikTokAuditStudioPage) for compliance with TikTok Developer API terms, privacy policies,
 *   and periodic automated crawler inspections.
 * - /social?view=modern: Overrides to AutoCutStudioPage if requested.
 * - /social-studio (and /autocut): The permanent dedicated route for staff operational studio.
 */
export default function SocialStudioPage() {
  const isModern = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const search = window.location.search;
    return search.includes('view=modern');
  }, []);

  if (isModern) {
    return <AutoCutStudioPage />;
  }

  return <TikTokAuditStudioPage />;
}
