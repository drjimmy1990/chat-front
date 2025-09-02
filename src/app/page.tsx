// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import AppHeader from "@/components/layout/AppHeader";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load the chat interface for better performance
const UnifiedChatInterface = dynamic(
  () => import('@/components/chat/UnifiedChatInterface'),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    ),
    ssr: false
  }
);

export default function HomePage() {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const toggleAdminPanel = () => {
    setIsAdminPanelOpen(prev => !prev);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader 
        onToggleAdminPanel={toggleAdminPanel} 
        isAdminPanelOpen={isAdminPanelOpen} 
      />
      <div className="flex-1 overflow-hidden">
        <UnifiedChatInterface isAdminPanelOpen={isAdminPanelOpen} />
      </div>
    </div>
  );
}