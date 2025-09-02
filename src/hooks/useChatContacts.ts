// src/hooks/useChatContacts.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import * as api from '@/lib/api';
import { Contact } from '@/lib/types';
import { QUERY_KEYS } from '@/lib/constants';
import { supabase } from '@/lib/supabaseClient';

export const useChatContacts = () => {
  const queryClient = useQueryClient();

  // Optimized query with better error handling
  const { 
    data: contacts = [], 
    isLoading: isLoadingContacts,
    error: contactsError 
  } = useQuery<Contact[]>({
    queryKey: QUERY_KEYS.CONTACTS,
    queryFn: api.getContacts,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Optimistic updates for better UX
  const updateNameMutation = useMutation({
    mutationFn: api.updateContactName,
    onMutate: async ({ contactId, newName }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CONTACTS });
      
      const previousContacts = queryClient.getQueryData<Contact[]>(QUERY_KEYS.CONTACTS);
      
      queryClient.setQueryData<Contact[]>(QUERY_KEYS.CONTACTS, (old) =>
        old?.map(contact =>
          contact.id === contactId ? { ...contact, name: newName } : contact
        ) || []
      );
      
      return { previousContacts };
    },
    onError: (err, variables, context) => {
      if (context?.previousContacts) {
        queryClient.setQueryData(QUERY_KEYS.CONTACTS, context.previousContacts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS });
    },
  });

  const toggleAiMutation = useMutation({
    mutationFn: api.toggleAiStatus,
    onMutate: async ({ contactId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CONTACTS });
      
      const previousContacts = queryClient.getQueryData<Contact[]>(QUERY_KEYS.CONTACTS);
      
      queryClient.setQueryData<Contact[]>(QUERY_KEYS.CONTACTS, (old) =>
        old?.map(contact =>
          contact.id === contactId ? { ...contact, ai_enabled: newStatus } : contact
        ) || []
      );
      
      return { previousContacts };
    },
    onError: (err, variables, context) => {
      if (context?.previousContacts) {
        queryClient.setQueryData(QUERY_KEYS.CONTACTS, context.previousContacts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS });
    },
  });
  
  const deleteContactMutation = useMutation({
    mutationFn: api.deleteContact,
    onSuccess: (data, contactId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.MESSAGES(contactId) });
    }
  });

  // Realtime subscriptions with better error handling
  useEffect(() => {
    const channel = supabase
      .channel('public-contacts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contacts' },
        (payload) => {
          console.log('Realtime contact change received:', payload);
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to contacts changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to contacts changes');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Memoized mutation functions to prevent unnecessary re-renders
  const updateName = useCallback(
    (params: { contactId: string; newName: string }) => updateNameMutation.mutate(params),
    [updateNameMutation]
  );

  const toggleAi = useCallback(
    (params: { contactId: string; newStatus: boolean }) => toggleAiMutation.mutate(params),
    [toggleAiMutation]
  );

  const deleteContact = useCallback(
    (contactId: string) => deleteContactMutation.mutate(contactId),
    [deleteContactMutation]
  );

  return {
    contacts,
    isLoadingContacts,
    contactsError,
    updateName,
    toggleAi,
    deleteContact,
  };
};