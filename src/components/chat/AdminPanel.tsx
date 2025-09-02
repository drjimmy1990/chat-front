// src/components/chat/AdminPanel.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { BackupFormat } from '@/lib/types';
import { BACKUP_FORMATS } from '@/lib/constants';
import { 
  Download, 
  Database, 
  Activity, 
  ChevronDown,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminPanelProps {
  onBackupWhatsappNumbers: (format: BackupFormat) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBackupWhatsappNumbers }) => {
  const [backupFormat, setBackupFormat] = useState<BackupFormat>(BACKUP_FORMATS.CSV);
  const [showBackupOptions, setShowBackupOptions] = useState(false);
  const [whatsappHealthStatus, setWhatsappHealthStatus] = useState<string | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const handleDownloadBackup = async () => {
    try {
      await onBackupWhatsappNumbers(backupFormat);
      setShowBackupOptions(false);
      toast.success('Backup downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download backup');
    }
  };

  const checkWhatsappBotHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const response = await fetch('/api/whatsapp/health');
      const data = await response.json();
      setWhatsappHealthStatus(data.status);
      
      if (data.status === 'healthy') {
        toast.success('WhatsApp bot is healthy');
      } else {
        toast.error('WhatsApp bot is not responding');
      }
    } catch (error) {
      console.error('Error checking WhatsApp bot health:', error);
      setWhatsappHealthStatus('Error');
      toast.error('Failed to check bot health');
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const formatOptions = [
    { value: BACKUP_FORMATS.CSV, label: 'CSV (Name, Phone)', icon: FileSpreadsheet },
    { value: BACKUP_FORMATS.TXT_DETAILED, label: 'TXT (Detailed)', icon: FileText },
    { value: BACKUP_FORMATS.TXT_NUMBERS_ONLY, label: 'TXT (Numbers Only)', icon: FileText },
    { value: BACKUP_FORMATS.TXT_NUMBER_NAME, label: 'TXT (Number:Name)', icon: FileText },
    { value: BACKUP_FORMATS.JSON, label: 'JSON', icon: FileText },
  ];

  return (
    <motion.div
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-80 h-full flex flex-col bg-card border-l border-border"
    >
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Admin Actions
        </h2>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* WhatsApp Backup Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">WhatsApp Backup</h3>
          
          {!showBackupOptions ? (
            <Button
              variant="outline"
              onClick={() => setShowBackupOptions(true)}
              className="w-full justify-start"
            >
              <Download className="w-4 h-4 mr-2" />
              Prepare Backup
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 p-3 border border-border rounded-lg bg-muted/50"
            >
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Backup Format
                </label>
                <div className="relative">
                  <select
                    value={backupFormat}
                    onChange={(e) => setBackupFormat(e.target.value as BackupFormat)}
                    className="w-full p-2 border border-input rounded-md bg-background text-sm appearance-none pr-8"
                  >
                    {formatOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleDownloadBackup}
                  className="flex-1"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBackupOptions(false)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* WhatsApp Bot Health Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Bot Health</h3>
          
          <Button
            variant="outline"
            onClick={checkWhatsappBotHealth}
            disabled={isCheckingHealth}
            className="w-full justify-start"
          >
            {isCheckingHealth ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Activity className="w-4 h-4 mr-2" />
            )}
            Check WhatsApp Bot
          </Button>
          
          <AnimatePresence>
            {whatsappHealthStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`
                  p-3 rounded-lg text-sm
                  ${whatsappHealthStatus === 'healthy' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                  }
                `}
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    whatsappHealthStatus === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  Bot Status: {whatsappHealthStatus}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Future Features Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Coming Soon</h3>
          <Button variant="ghost" disabled className="w-full justify-start opacity-50">
            Analytics Dashboard
          </Button>
          <Button variant="ghost" disabled className="w-full justify-start opacity-50">
            Bulk Actions
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(AdminPanel);