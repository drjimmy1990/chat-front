// src/components/chat/AdminPanel.tsx
import React, { useState } from 'react';
import { Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';

// Define the function signature for the backup handler
type BackupFormat = 'csv' | 'txt_detailed' | 'txt_numbers_only' | 'txt_number_name' | 'json';

interface AdminPanelProps {
  onBackupWhatsappNumbers: (format: BackupFormat) => void;
  // We can add more props for future features
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBackupWhatsappNumbers }) => {
  const [backupFormat, setBackupFormat] = useState<BackupFormat>('csv');
  const [showBackupOptions, setShowBackupOptions] = useState(false);
  const [whatsappHealthStatus, setWhatsappHealthStatus] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);


  const handleFormatChange = (event: SelectChangeEvent<BackupFormat>) => {

    setBackupFormat(event.target.value as BackupFormat);
  };

  const handleDownloadBackup = () => {
    onBackupWhatsappNumbers(backupFormat);
  };

  const checkWhatsappBotHealth = async () => {
    try {
      const response = await fetch('/api/whatsapp/health');
      const data = await response.json();
      setWhatsappHealthStatus(data.status);
    } catch (error) {
      console.error('Error checking WhatsApp bot health:', error);
      setWhatsappHealthStatus('Error checking status');
    }
  };

  const startWhatsappBotAndGetQrCode = async () => {
    try {
      const response = await fetch('/api/whatsapp/start', { method: 'POST' });
      const data = await response.json();
      setQrCodeData(data.qrCodeData || null); // Assuming the response contains qrCodeData
    } catch (error) { console.error('Error starting WhatsApp bot:', error); }
  };

  return (
    <Box
      sx={{
        width: 320,
        flexShrink: 0,
        borderLeft: '1px solid',
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        p: 2,
        overflowY: 'auto'
      }}
    >
      <Typography variant="h6" gutterBottom>Admin Actions</Typography>

      {!showBackupOptions ? (
        <Button variant="contained" onClick={() => setShowBackupOptions(true)}>
          Prepare WhatsApp Backup
        </Button>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="backup-format-label">Backup Format</InputLabel>
            <Select
              labelId="backup-format-label"
              value={backupFormat}
              label="Backup Format"
              onChange={handleFormatChange}
            >
              <MenuItem value="csv">CSV (Name,PhoneNumber)</MenuItem>
              <MenuItem value="txt_detailed">TXT (Detailed)</MenuItem>
              <MenuItem value="txt_numbers_only">TXT (Numbers Only)</MenuItem>
              <MenuItem value="txt_number_name">TXT (Number:Name)</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="success" onClick={handleDownloadBackup}>
            Download Backup
          </Button>
          <Button variant="outlined" onClick={() => setShowBackupOptions(false)}>
            Cancel
          </Button>
        </Box>
      )}

      {/* New WhatsApp Bot Buttons */}
      <Button variant="contained" sx={{ mt: 2 }} onClick={checkWhatsappBotHealth}>
        Check WhatsApp Bot Health
      </Button>
      {whatsappHealthStatus !== null && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Bot Status: {whatsappHealthStatus}
        </Typography>
      )}

      <Button variant="contained" sx={{ mt: 1 }} onClick={startWhatsappBotAndGetQrCode}>
        Start WhatsApp Bot and Get QR Code
      </Button>
      {qrCodeData && (
        <img src={qrCodeData} alt="WhatsApp QR Code" style={{ width: '100%', height: 'auto', marginTop: '10px' }} />
      )}
    </Box>
  );
};

export default AdminPanel;