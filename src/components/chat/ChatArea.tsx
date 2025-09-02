// src/components/chat/ChatArea.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Contact, Message } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import PlatformAvatar from '@/components/ui/PlatformAvatar';
import { Trash2, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatAreaProps {
  contact: Contact | undefined;
  messages: Message[];
  isLoadingMessages: boolean;
  onSendMessage: (text: string) => void;
  onSendImageByUrl: (url: string) => void;
  isSendingMessage: boolean;
  onDeleteContact: (id: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  contact,
  messages,
  isLoadingMessages,
  onSendMessage,
  onSendImageByUrl,
  isSendingMessage,
  onDeleteContact,
}) => {
  const [messageText, setMessageText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop = scrollableContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  useEffect(() => {
    setMessageText('');
  }, [contact?.id]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleDelete = async () => {
    if (!contact) return;
    
    if (window.confirm(`Are you sure you want to delete ${contact.name || contact.platform_user_id} and all their messages?`)) {
      try {
        await onDeleteContact(contact.id);
        toast.success('Contact deleted successfully');
      } catch (error) {
        toast.error('Failed to delete contact');
      }
    }
  };

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              💬
            </motion.div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Chat Dashboard</h3>
          <p className="text-gray-600">Select a contact to start viewing conversations</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b border-border bg-white"
      >
        <div className="flex items-center space-x-3">
          <PlatformAvatar platform={contact.platform} />
          <div>
            <h3 className="font-semibold text-foreground">
              {contact.name || 'Unknown Contact'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {contact.platform_user_id}
            </p>
          </div>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 bg-white border border-border rounded-lg shadow-lg z-10"
              >
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Contact
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div
        ref={scrollableContainerRef}
        className="flex-1 overflow-y-auto p-4 chat-background"
      >
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MessageBubble message={message} platform={contact.platform} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      
      {/* Message Input */}
      <div className="border-t border-border bg-white">
        <MessageInput
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onSendText={handleSend}
          onSendImageByUrl={onSendImageByUrl}
          disabled={isLoadingMessages}
          isSending={isSendingMessage}
        />
      </div>
    </div>
  );
};

export default React.memo(ChatArea);