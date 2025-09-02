// src/components/chat/ContactList.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Contact } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PlatformAvatar from '@/components/ui/PlatformAvatar';
import { formatRelativeTime, debounce } from '@/lib/utils';
import { 
  Search, 
  Edit3, 
  Check, 
  X, 
  Filter,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  selectedContactId: string | null;
  onSelectContact: (id: string) => void;
  onUpdateName: (params: { contactId: string; newName: string }) => void;
  onToggleAi: (params: { contactId: string; newStatus: boolean }) => void;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  isLoading,
  selectedContactId,
  onSelectContact,
  onUpdateName,
  onToggleAi,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'whatsapp' | 'facebook' | 'instagram'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const parentRef = React.useRef<HTMLDivElement>(null);

  // Debounced search to improve performance
  const debouncedSearch = useCallback(
    debounce((term: string) => setSearchTerm(term), 300),
    []
  );

  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    if (searchTerm) {
      filtered = filtered.filter(contact => 
        (contact.name && contact.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        contact.platform_user_id.includes(searchTerm)
      );
    }

    if (platformFilter !== 'all') {
      filtered = filtered.filter(contact => contact.platform === platformFilter);
    }

    return filtered.sort((a, b) => 
      new Date(b.last_interaction_at).getTime() - new Date(a.last_interaction_at).getTime()
    );
  }, [contacts, searchTerm, platformFilter]);

  const virtualizer = useVirtualizer({
    count: filteredContacts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  const handleEditClick = (e: React.MouseEvent, contact: Contact) => {
    e.stopPropagation();
    setEditingId(contact.id);
    setEditingName(contact.name || '');
  };

  const handleSaveName = async (contactId: string) => {
    try {
      await onUpdateName({ contactId, newName: editingName });
      setEditingId(null);
      toast.success('Contact name updated');
    } catch (error) {
      toast.error('Failed to update contact name');
    }
  };

  const handleToggleAi = async (contactId: string, currentStatus: boolean) => {
    try {
      await onToggleAi({ contactId, newStatus: !currentStatus });
      toast.success(`AI ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle AI status');
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 h-full flex items-center justify-center bg-card border-r border-border">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-80 h-full flex flex-col bg-card border-r border-border"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Contacts</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value as any)}
                className="w-full p-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">All Platforms</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contact List */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const contact = filteredContacts[virtualItem.index];
            const isSelected = selectedContactId === contact.id;
            const isEditing = editingId === contact.id;

            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: virtualItem.index * 0.05 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div
                  className={`
                    mx-2 my-1 p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'hover:bg-gray-50 border-2 border-transparent'
                    }
                  `}
                  onClick={() => !isEditing && onSelectContact(contact.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <PlatformAvatar platform={contact.platform} />
                      {contact.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {contact.unread_count > 9 ? '9+' : contact.unread_count}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveName(contact.id);
                              } else if (e.key === 'Escape') {
                                setEditingId(null);
                              }
                            }}
                            className="text-sm"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveName(contact.id);
                            }}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(null);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-sm text-foreground truncate">
                                {contact.name || contact.platform_user_id}
                              </h3>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleEditClick(e, contact)}
                                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {contact.last_message_preview}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeTime(contact.last_interaction_at)}
                            </p>
                          </div>
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAi(contact.id, contact.ai_enabled);
                            }}
                            className="ml-2"
                          >
                            {contact.ai_enabled ? (
                              <ToggleRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {filteredContacts.length === 0 && !isLoading && (
        <div className="p-4 text-center text-muted-foreground">
          <p className="text-sm">No contacts match your filters</p>
        </div>
      )}
    </motion.div>
  );
};

export default React.memo(ContactList);