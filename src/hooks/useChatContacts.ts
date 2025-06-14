// src/hooks/useChatContacts.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

export const useChatContacts = () => {
  const queryClient = useQueryClient();

  // --- QUERIES ---
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery<api.Contact[]>({
    queryKey: ['contacts'],
    queryFn: api.getContacts,
  });

  // --- MUTATIONS ---
  // A mutation for updating the name
  const updateNameMutation = useMutation({
    mutationFn: api.updateContactName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
    // We can add onMutate for optimistic updates later if needed
  });

  // A mutation for toggling AI status
  const toggleAiMutation = useMutation({
    mutationFn: api.toggleAiStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
  
  // A mutation for deleting a contact
  const deleteContactMutation = useMutation({
    mutationFn: api.deleteContact,
    onSuccess: (data, contactId) => {
        // Invalidate queries to refetch the list
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        // Also remove any cached messages for the deleted contact
        queryClient.removeQueries({ queryKey: ['messages', contactId] });
    }
  });


  // --- REALTIME ---
  useEffect(() => {
    const channel = supabase
      .channel('public-contacts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contacts' },
        (payload) => {
          console.log('Realtime contact change received:', payload);
          queryClient.invalidateQueries({ queryKey: ['contacts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  

  return {
    contacts,
    isLoadingContacts,
    updateName: updateNameMutation.mutate,
    toggleAi: toggleAiMutation.mutate,
    deleteContact: deleteContactMutation.mutate,
  };
};