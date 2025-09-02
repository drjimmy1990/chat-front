// src/components/layout/AppHeader.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Settings, MessageSquare } from 'lucide-react';

interface AppHeaderProps {
  onToggleAdminPanel: () => void;
  isAdminPanelOpen: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  onToggleAdminPanel, 
  isAdminPanelOpen 
}) => {
  return (
    <motion.header
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-b border-border shadow-sm z-50"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chat Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your conversations</p>
          </div>
        </div>
        
        <Button
          variant={isAdminPanelOpen ? "default" : "outline"}
          onClick={onToggleAdminPanel}
          className="flex items-center space-x-2"
        >
          <Settings className="w-4 h-4" />
          <span>{isAdminPanelOpen ? 'Hide Actions' : 'Show Actions'}</span>
        </Button>
      </div>
    </motion.header>
  );
};

export default AppHeader;