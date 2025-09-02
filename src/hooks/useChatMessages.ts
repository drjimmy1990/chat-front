// src/hooks/useChatMessages.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import * as api from '@/lib/api';
import { Message, SendMessagePayload } from '@/lib/types';
import { QUERY_KEYS } from '@/lib/constants';
import { supabase } from '@/lib/supabaseClient';

export const useChatMessages = (contactId: string | null) => {
  const queryClient = useQueryClient();

  // Optimized messages query
  const { 
    data: messages = [], 
    isLoading: isLoadingMessages,
    error: messagesError 
  } = useQuery<Message[]>({
    queryKey: QUERY_KEYS.MESSAGES(contactId || ''),
    queryFn: async () => {
      if (!contactId) return [];
      
      // Mark as read when messages are fetched
      try {
        await api.markChatAsRead(contactId);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS });
      } catch (error) {
        console.error('Failed to mark chat as read:', error);
      }
      
      return api.getMessagesForContact(contactId);
    },
    enabled: !!contactId,
    staleTime: 10000, // 10 seconds
    gcTime: 300000, // 5 minutes
    retry: 3,
  });

  // Optimistic message sending
  const sendMessageMutation = useMutation({
    mutationFn: api.sendMessage,
    onMutate: async (newMessagePayload: SendMessagePayload) => {
      if (!contactId) return;

      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.MESSAGES(contactId) });
      
      const previousMessages = queryClient.getQueryData<Message[]>(QUERY_KEYS.MESSAGES(contactId));
      
      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        contact_id: newMessagePayload.contact_id,
        sender_type: 'agent',
        content_type: newMessagePayload.content_type,
        text_content: newMessagePayload.text_content || null,
        attachment_url: newMessagePayload.attachment_url || null,
        sent_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData<Message[]>(QUERY_KEYS.MESSAGES(contactId), (old) => 
        old ? [...old, optimisticMessage] : [optimisticMessage]
      );
      
      return { previousMessages, optimisticMessage };
    },
    onSuccess: (newMessage, variables, context) => {
      if (!contactId) return;
      
      // Replace optimistic message with real one
      queryClient.setQueryData<Message[]>(QUERY_KEYS.MESSAGES(contactId), (old) => {
        if (!old) return [newMessage];
        return old.map(msg => 
          msg.id === context?.optimisticMessage.id ? newMessage : msg
        );
      });
      
      // Update contacts list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS });
    },
    onError: (error, variables, context) => {
      if (!contactId || !context?.previousMessages) return;
      
      // Revert optimistic update
      queryClient.setQueryData(QUERY_KEYS.MESSAGES(contactId), context.previousMessages);
    },
  });

  // Enhanced realtime subscriptions
  useEffect(() => {
    if (!contactId) return;

    const channel = supabase
      .channel(`public-messages-contact-${contactId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `contact_id=eq.${contactId}` 
        },
        (payload) => {
          console.log('New message via realtime:', payload);
          const newMessage = payload.new as Message;
          
          queryClient.setQueryData<Message[]>(QUERY_KEYS.MESSAGES(contactId), (oldData) => {
            if (!oldData) return [newMessage];
            
            // Avoid duplicates
            if (oldData.find(msg => msg.id === newMessage.id)) return oldData;
            return [...oldData, newMessage];
          });

          // Handle read status
          if (document.hasFocus() && document.visibilityState === 'visible') {
            api.markChatAsRead(contactId)
              .then(() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS }))
              .catch(console.error);
          } else {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to messages for contact ${contactId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to messages for contact ${contactId}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactId, queryClient]);

  // Auto-mark as read when window gains focus
  useEffect(() => {
    if (!contactId) return;

    const handleFocus = () => {
      api.markChatAsRead(contactId)
        .then(() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS }))
        .catch(console.error);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [contactId, queryClient]);

  const sendMessage = useCallback(
    (payload: SendMessagePayload) => sendMessageMutation.mutate(payload),
    [sendMessageMutation]
  );

  return {
    messages,
    isLoadingMessages,
    messagesError,
    sendMessage,
    isSendingMessage: sendMessageMutation.isPending,
  };
};