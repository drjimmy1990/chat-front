// src/components/chat/MessageBubble.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Message, Platform } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import PlatformAvatar from '@/components/ui/PlatformAvatar';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  platform: Platform;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, platform }) => {
  const isUser = message.sender_type === 'user';
  const isAgent = message.sender_type === 'agent';
  const isAi = message.sender_type === 'ai';

  const getAvatar = () => {
    if (isUser) return <PlatformAvatar platform={platform} size="sm" />;
    if (isAgent) return (
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <User className="w-4 h-4 text-white" />
      </div>
    );
    if (isAi) return (
      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
    );
    return null;
  };

  const getBubbleStyles = () => {
    if (isUser) {
      return 'bg-white border border-gray-200 text-gray-900';
    }
    if (isAi) {
      return 'bg-green-500 text-white';
    }
    return 'bg-blue-500 text-white';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex mb-4 ${isUser ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isUser ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        {getAvatar()}
        
        <div className="flex flex-col">
          <div
            className={`
              px-4 py-2 rounded-2xl shadow-sm
              ${getBubbleStyles()}
              ${isUser ? 'rounded-bl-md' : 'rounded-br-md'}
            `}
          >
            {message.text_content && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.text_content}
              </p>
            )}
            
            {message.content_type === 'image' && message.attachment_url && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={message.attachment_url}
                alt="Chat attachment"
                className="mt-2 max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.attachment_url!, '_blank')}
              />
            )}
            
            {message.content_type === 'audio' && message.attachment_url && (
              <audio
                controls
                src={message.attachment_url}
                className="mt-2 max-w-full"
              />
            )}
          </div>
          
          <span className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-left' : 'text-right'}`}>
            {formatTime(message.sent_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(MessageBubble);