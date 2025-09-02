// src/lib/api.ts
import { supabase } from './supabaseClient';
import { Contact, Message, SendMessagePayload } from './types';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export const getContacts = async (): Promise<Contact[]> => {
  const cacheKey = 'contacts';
  const cached = getCachedData<Contact[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase.functions.invoke('get-contacts');
  if (error) throw new Error(error.message);
  
  const contacts = data || [];
  setCachedData(cacheKey, contacts);
  return contacts;
};

export const getMessagesForContact = async (contactId: string): Promise<Message[]> => {
  const cacheKey = `messages-${contactId}`;
  const cached = getCachedData<Message[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase.functions.invoke('get-messages-for-contact', {
    body: { contact_id: contactId },
  });
  if (error) throw new Error(error.message);
  
  const messages = data || [];
  setCachedData(cacheKey, messages);
  return messages;
};

export const markChatAsRead = async (contactId: string) => {
  const { error } = await supabase.functions.invoke('mark-chat-as-read', {
    body: { contact_id: contactId }
  });
  if (error) throw new Error(error.message);
  
  // Invalidate contacts cache
  cache.delete('contacts');
  return { success: true };
};

export const updateContactName = async ({ contactId, newName }: { contactId: string; newName: string }) => {
  const { data, error } = await supabase.functions.invoke('update-contact-name', {
    body: { contact_id: contactId, new_name: newName }
  });
  if (error) throw new Error(error.message);
  
  // Invalidate relevant caches
  cache.delete('contacts');
  return data;
};

export const toggleAiStatus = async ({ contactId, newStatus }: { contactId: string; newStatus: boolean }) => {
  const { error } = await supabase.from('contacts').update({ ai_enabled: newStatus }).eq('id', contactId);
  if (error) throw new Error(error.message);
  
  // Invalidate contacts cache
  cache.delete('contacts');
  return { success: true };
};

export const deleteContact = async (contactId: string) => {
  const { data, error } = await supabase.functions.invoke('delete-contact-and-messages', {
    body: { contact_id: contactId }
  });
  if (error) throw new Error(error.message);
  
  // Invalidate relevant caches
  cache.delete('contacts');
  cache.delete(`messages-${contactId}`);
  return data;
};

export const sendMessage = async (payload: SendMessagePayload): Promise<Message> => {
  const { platform, ...messagePayload } = payload;
  let edgeFunctionName = '';

  if (platform === 'facebook') edgeFunctionName = 'send-facebook-agent-message';
  else if (platform === 'whatsapp') edgeFunctionName = 'send-agent-whatsapp-message';
  else throw new Error(`Unsupported platform for sending agent message: ${platform}`);
  
  const { data, error } = await supabase.functions.invoke(edgeFunctionName, {
    body: messagePayload
  });
  if (error) throw new Error(error.message);
  
  // Invalidate relevant caches
  cache.delete('contacts');
  cache.delete(`messages-${payload.contact_id}`);
  
  return data.message;
};