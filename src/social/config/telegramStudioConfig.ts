/**
 * Configurazione Ufficiale Telegram Supergruppo & Topics per FP Social Studio
 * Ambito: Reparto Stagno Social Media Studio (/src/social)
 *
 * Supergruppo: FP Social Studio (ID: -1004492692624)
 * Bot Ufficiale: @flower_power_studio_bot
 */

export const TELEGRAM_STUDIO_CONFIG = {
  supergroupId: '-1004492692624',
  botUsername: 'flower_power_studio_bot',

  topics: {
    /** Topic 2: Dispatch verso il gruppo Facebook locale Koh Phayam Community */
    kohPhayamGroup: {
      threadId: 2,
      name: 'Koh Phayam Group',
      targetFacebookGroupUrl: 'https://www.facebook.com/share/g/1Hyh1mJ7Hu/',
      icon: '🌴',
      description: 'Ricezione post e video per la community Facebook di Koh Phayam',
    },

    /** Topic 3: Dispatch verso TikTok Stories & Reels */
    tikTokStories: {
      threadId: 3,
      name: 'TikTok Stories',
      icon: '📱',
      description: 'Ricezione video verticali 9:16 e copy bilingue per Stories e Reels',
    },

    /** Topic 4: Inbox smartphone per caricamento su Google Drive (5 TB) */
    mediaBoxGoogleDrive: {
      threadId: 4,
      name: 'MediaBox - Google Drive',
      icon: '📥',
      description: 'Upload multimediale mobile verso lo storage Google Drive 5TB',
    },
  },
} as const;

export type StudioTopicKey = keyof typeof TELEGRAM_STUDIO_CONFIG.topics;
