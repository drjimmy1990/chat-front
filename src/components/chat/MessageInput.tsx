// src/components/chat/MessageInput.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Send, Paperclip, Image } from 'lucide-react';
import toast from 'react-hot-toast';

interface MessageInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSendText: () => void;
  onSendImageByUrl: (url: string) => void;
  disabled: boolean;
  isSending: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSendText,
  onSendImageByUrl,
  disabled,
  isSending
}) => {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (value.trim()) {
        onSendText();
      }
    }
  };

  const handleSendImage = () => {
    if (imageUrl.trim()) {
      try {
        new URL(imageUrl); // Validate URL
        onSendImageByUrl(imageUrl);
        setImageUrl('');
        setShowImageDialog(false);
        toast.success('Image sent!');
      } catch {
        toast.error('Please enter a valid URL');
      }
    }
  };

  return (
    <>
      <div className="p-4 bg-white border-t border-border">
        <div className="flex items-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowImageDialog(true)}
            disabled={disabled || isSending}
            className="mb-1"
          >
            <Image className="w-4 h-4" />
          </Button>
          
          <div className="flex-1">
            <Input
              value={value}
              onChange={onChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={disabled || isSending}
              className="resize-none"
            />
          </div>
          
          <Button
            onClick={onSendText}
            disabled={disabled || isSending || !value.trim()}
            size="icon"
            className="mb-1"
          >
            {isSending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Image URL Dialog */}
      {showImageDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowImageDialog(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Send Image by URL</h3>
            <div className="space-y-4">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendImage();
                  }
                }}
                autoFocus
              />
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowImageDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendImage}
                  disabled={!imageUrl.trim()}
                  className="flex-1"
                >
                  Send Image
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default React.memo(MessageInput);