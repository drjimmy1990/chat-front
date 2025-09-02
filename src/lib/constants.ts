// src/lib/constants.ts
export const PLATFORMS = {
  WHATSAPP: 'whatsapp',
  FACEBOOK: 'facebook', 
  INSTAGRAM: 'instagram'
} as const;

export const SENDER_TYPES = {
  USER: 'user',
  AGENT: 'agent',
  AI: 'ai'
} as const;

export const CONTENT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio'
} as const;

export const BACKUP_FORMATS = {
  CSV: 'csv',
  TXT_DETAILED: 'txt_detailed',
  TXT_NUMBERS_ONLY: 'txt_numbers_only',
  TXT_NUMBER_NAME: 'txt_number_name',
  JSON: 'json'
} as const;

export const QUERY_KEYS = {
  CONTACTS: ['contacts'],
  MESSAGES: (contactId: string) => ['messages', contactId],
  WHATSAPP_HEALTH: ['whatsapp', 'health']
} as const;