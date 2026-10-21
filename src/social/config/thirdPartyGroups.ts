/**
 * Configurazione Ufficiale Gruppi Terze Parti (Community & Local Groups)
 * Ambito: Reparto Stagno Social Media Studio (/src/social)
 *
 * Utilizzato per il dispatch via Telegram dello staff verso gruppi Facebook / community
 * dove le API Graph ufficiali non consentono pubblicazioni dirette automatiche senza admin rights.
 */

export interface ThirdPartyCommunityGroup {
  id: string;
  name: string;
  platform: 'facebook' | 'telegram' | 'line';
  department: 'village' | 'pizza' | 'both';
  url: string;
  description: string;
  suggestedFormats: string[];
  active: boolean;
}

export const THIRD_PARTY_COMMUNITY_GROUPS: ThirdPartyCommunityGroup[] = [
  {
    id: 'fb-koh-phayam-community',
    name: 'Koh Phayam',
    platform: 'facebook',
    department: 'village',
    url: 'https://www.facebook.com/share/g/1Hyh1mJ7Hu/',
    description: 'Gruppo Facebook principale della community di Koh Phayam (turisti internazionali, expat, viaggiatori e locali). Ideale per offerte Last Minute (LM1), disponibilità bungalow (V1-V3) e piatti del ristorante del resort (R1).',
    suggestedFormats: ['LM1', 'V1', 'V2', 'V3', 'R1'],
    active: true,
  },
];

export function getGroupsForDepartment(dept: 'village' | 'pizza'): ThirdPartyCommunityGroup[] {
  return THIRD_PARTY_COMMUNITY_GROUPS.filter(
    g => g.active && (g.department === dept || g.department === 'both')
  );
}
