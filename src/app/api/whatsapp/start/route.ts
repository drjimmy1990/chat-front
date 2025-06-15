// src/app/api/whatsapp/start/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Read environment variable for bot API URL
const WHATSAPP_BOT_API_URL = process.env.WHATSAPP_BOT_API_URL;

export async function POST(_req: NextRequest) {
  try {
    // Make a POST request to the bot's start endpoint
    const response = await fetch(`${WHATSAPP_BOT_API_URL}/start`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 // If your bot requires a body for the start request, add it here
 // body: JSON.stringify({ some_param: 'value' }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Attempt to parse error, fallback to empty
      throw new Error(errorData.message || `Error from bot API: ${response.status}`);
    }

    const data = await response.json();

    // Wait for QR code to be generated
    // Assuming the bot's start endpoint returns the QR code data directly
    // You might need to adjust this based on your bot's actual response structure
    const qr = data.qrCodeData || data.qrCode; // Adjust based on your bot's response
    return NextResponse.json({ status: 'success', message: 'QR code received', qrCode: qr });

  } catch (error: any) {
    console.error('Error starting WhatsApp bot:', error);
     // Handle cleanup if initialization fails
    return NextResponse.json({ status: 'error', message: error.message || 'Failed to start WhatsApp bot.' }, { status: 500 });
  }
}

// Add a GET handler to potentially retrieve the last generated QR code
// or the current status if needed by the frontend polling
export async function GET(req: NextRequest) {
    return NextResponse.json({ status: 'info', message: 'Check bot status using the /api/whatsapp/health endpoint.' });
}