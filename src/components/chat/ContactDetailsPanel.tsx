// src/components/chat/UnifiedChatInterface.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import ContactList from './ContactList';
import ChatArea from './ChatArea';
import { useChatContacts } from '@/hooks/useChatContacts';
import { useChatMessages } from '@/hooks/useChatMessages';

export default function UnifiedChatInterface() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // We are now passing the original `deleteContact` from the hook
  const { contacts, isLoadingContacts, updateName, toggleAi, deleteContact } = useChatContacts();
  const { messages, isLoadingMessages, sendMessage, isSendingMessage } = useChatMessages(selectedContactId);
  
  const selectedContact = useMemo(() => {
    return contacts.find((c) => c.id === selectedContactId);
  }, [contacts, selectedContactId]);

  const handleSendMessage = (text: string) => {
    if (!selectedContact) return;
    sendMessage({
        contact_id: selectedContact.id,
        content_type: 'text',
        text_content: text,
        platform: selectedContact.platform,
    });
  }

  const handleSendImageByUrl = (url: string) => {
    if (!selectedContact) return;
    sendMessage({
        contact_id: selectedContact.id,
        content_type: 'image',
        text_content: url, // Assuming the URL is sent as text_content for image type
        platform: selectedContact.platform,
    });
  };

  React.useEffect(() => {
    if (selectedContactId && !contacts.find(c => c.id === selectedContactId)) {
        setSelectedContactId(null);
    }
  }, [contacts, selectedContactId]);
  
  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <Box
        sx={{
          width: isSidebarOpen ? 320 : 0,
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'width 0.3s ease-in-out',
          height: '100%',
        }}
      >
        <ContactList
          contacts={contacts}
          isLoading={isLoadingContacts}
          selectedContactId={selectedContactId}
          onSelectContact={setSelectedContactId}
          onUpdateName={updateName}
          onToggleAi={toggleAi}
        />
      </Box>
      
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
         <Box sx={{ p: 0.5, backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
            <Tooltip title={isSidebarOpen ? "Hide Contacts" : "Show Contacts"}>
                <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
                </IconButton>
            </Tooltip>
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
          <ChatArea
            contact={selectedContact}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            onSendMessage={handleSendMessage}
            onSendImageByUrl={handleSendImageByUrl}
            isSendingMessage={isSendingMessage}
            onDeleteContact={deleteContact} // The delete handler is correctly passed here
          />
        </Box>
      </Box>
    </Box>
  );
}