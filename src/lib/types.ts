// src/lib/types.ts
import { PLATFORMS, SENDER_TYPES, CONTENT_TYPES, BACKUP_FORMATS } from './constants';

export type Platform = typeof PLATFORMS[keyof typeof PLATFORMS];
export type SenderType = typeof SENDER_TYPES[keyof typeof SENDER_TYPES];
export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];
export type BackupFormat = typeof BACKUP_FORMATS[keyof typeof BACKUP_FORMATS];

export interface Contact {
  id: string;
  platform: Platform;
  platform_user_id: string;
  name: string;
  avatar_url: string | null;
  ai_enabled: boolean;
  last_interaction_at: string;
  last_message_preview: string;
  unread_count: number;
}

export interface Message {
  id: string;
  contact_id: string;
  sender_type: SenderType;
  content_type: ContentType;
  text_content: string | null;
  attachment_url: string | null;
  sent_at: string;
}

export interface SendMessagePayload {
  contact_id: string;
  content_type: ContentType;
  text_content?: string;
  attachment_url?: string;
  platform: Platform;
}