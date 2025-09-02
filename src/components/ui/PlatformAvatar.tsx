// src/components/ui/PlatformAvatar.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Platform } from '@/lib/types';
import { MessageCircle, Facebook, Instagram, HelpCircle } from 'lucide-react';

interface PlatformAvatarProps {
  platform: Platform;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PlatformAvatar: React.FC<PlatformAvatarProps> = ({ 
  platform, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getPlatformConfig = () => {
    switch (platform) {
      case 'whatsapp':
        return {
          bgColor: 'bg-green-500',
          icon: <MessageCircle className={iconSizes[size]} />,
          hoverColor: 'hover:bg-green-600'
        };
      case 'facebook':
        return {
          bgColor: 'bg-blue-600',
          icon: <Facebook className={iconSizes[size]} />,
          hoverColor: 'hover:bg-blue-700'
        };
      case 'instagram':
        return {
          bgColor: 'bg-pink-500',
          icon: <Instagram className={iconSizes[size]} />,
          hoverColor: 'hover:bg-pink-600'
        };
      default:
        return {
          bgColor: 'bg-gray-500',
          icon: <HelpCircle className={iconSizes[size]} />,
          hoverColor: 'hover:bg-gray-600'
        };
    }
  };

  const { bgColor, icon, hoverColor } = getPlatformConfig();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${sizeClasses[size]} 
        ${bgColor} 
        ${hoverColor}
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        transition-colors 
        duration-200
        ${className}
      `}
    >
      {icon}
    </motion.div>
  );
};

export default React.memo(PlatformAvatar);