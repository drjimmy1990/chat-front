// src/components/chat/UnifiedChatInterface.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import ContactList from './ContactList';
import ChatArea from './ChatArea';
import AdminPanel from './AdminPanel';
import { useChatContacts } from '@/hooks/useChatContacts';
import { useChatMessages } from '@/hooks/useChatMessages';
import { supabase } from '@/lib/supabaseClient';
import { BackupFormat } from '@/lib/types';
import { Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface UnifiedChatInterfaceProps {
  isAdminPanelOpen: boolean;
}

export default function UnifiedChatInterface({ isAdminPanelOpen }: UnifiedChatInterfaceProps) {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { contacts, isLoadingContacts, updateName, toggleAi, deleteContact } = useChatContacts();
  const { messages, isLoadingMessages, sendMessage, isSendingMessage } = useChatMessages(selectedContactId);
  
  const selectedContact = useMemo(() => {
    return contacts.find((c) => c.id === selectedContactId);
  }, [contacts, selectedContactId]);

  const handleSendMessage = useCallback((text: string) => {
    if (!selectedContact) return;
    sendMessage({
      contact_id: selectedContact.id,
      content_type: 'text',
      text_content: text,
      platform: selectedContact.platform,
    });
  }, [selectedContact, sendMessage]);

  const handleSendImageByUrl = useCallback((url: string) => {
    if (!selectedContact) return;
    sendMessage({
      contact_id: selectedContact.id,
      content_type: 'image',
      attachment_url: url,
      platform: selectedContact.platform
    });
  }, [selectedContact, sendMessage]);

  const handleBackup = useCallback(async (format: BackupFormat) => {
    try {
      const { data: whatsappContacts, error } = await supabase.functions.invoke('get-whatsapp-contacts-for-backup');
      
      if (error) throw error;
      if (!whatsappContacts || whatsappContacts.length === 0) {
        toast.error('No WhatsApp contacts found to backup');
        return;
      }

      let fileContentString = "";
      let mimeType = "text/plain";
      let fileExtension = "txt";

      type BackupContact = { name?: string; platform_user_id?: string; [key: string]: unknown };
      const typedWhatsappContacts = whatsappContacts as BackupContact[];

      switch (format) {
        case 'csv':
          mimeType = "text/csv";
          fileExtension = "csv";
          const csvRows = ["Name,PhoneNumber"];
          typedWhatsappContacts.forEach((contact) => {
            const name = contact.name ? `"${contact.name.replace(/"/g, '""')}"` : 'N/A';
            csvRows.push(`${name},${contact.platform_user_id || 'N/A'}`);
          });
          fileContentString = csvRows.join("\r\n");
          break;
        case 'txt_numbers_only':
          fileContentString = typedWhatsappContacts.map((c) => c.platform_user_id).filter(Boolean).join("\r\n");
          break;
        case 'txt_detailed':
          const txtLines: string[] = [];
          typedWhatsappContacts.forEach((contact) => {
            const name = contact.name || 'N/A';
            const phoneNumber = contact.platform_user_id || 'N/A';
            txtLines.push(`Name: ${name}, Phone: ${phoneNumber}`);
          });
          fileContentString = txtLines.join("\r\n");
          break;
        case 'txt_number_name':
          fileContentString = typedWhatsappContacts.map((c) => 
            `${c.platform_user_id || 'No Number'}:${c.name || 'No Name'}`
          ).join("\r\n");
          break;
        case 'json':
          mimeType = "application/json";
          fileExtension = "json";
          fileContentString = JSON.stringify(
            typedWhatsappContacts.map((c) => ({ 
              name: c.name || 'N/A', 
              phoneNumber: c.platform_user_id || 'N/A'
            })), 
            null, 
            2
          );
          break;
      }
      
      const blob = new Blob([fileContentString], { type: `${mimeType};charset=utf-8;` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      link.setAttribute("href", url);
      link.setAttribute("download", `whatsapp_contacts_backup_${timestamp}.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error: unknown) { 
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Backup failed: ${errorMessage}`);
    }
  }, []);

  // Auto-clear selected contact if it no longer exists
  React.useEffect(() => {
    if (selectedContactId && !contacts.find(c => c.id === selectedContactId)) {
      setSelectedContactId(null);
    }
  }, [contacts, selectedContactId]);
  
  return (
    <div className="flex h-full">
      {/* Sidebar Toggle Button (Mobile) */}
      <div className="lg:hidden absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Contact Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="sidebar-transition"
          >
            <ContactList
              contacts={contacts}
              isLoading={isLoadingContacts}
              selectedContactId={selectedContactId}
              onSelectContact={setSelectedContactId}
              onUpdateName={updateName}
              onToggleAi={toggleAi}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sidebar Toggle for Desktop */}
        <div className="hidden lg:block p-2 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <ChatArea
            contact={selectedContact}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            onSendMessage={handleSendMessage}
            onSendImageByUrl={handleSendImageByUrl}
            isSendingMessage={isSendingMessage}
            onDeleteContact={deleteContact}
          />
        </div>
      </div>

      {/* Admin Panel */}
      <AnimatePresence>
        {isAdminPanelOpen && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <AdminPanel onBackupWhatsappNumbers={handleBackup} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}