/**
 * Google Sheets Logger Service
 * Sends login and registration events to a Google Apps Script Web App Webhook
 */

export const logToGoogleSheet = async ({ email, name = '', role = 'player', event = 'LOGIN', status = 'SUCCESS', details = '' }) => {
  const webhookUrl = import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL;
  
  if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com')) {
    // Silently skip if webhook URL is not set yet
    return;
  }

  try {
    const payload = {
      timestamp: new Date().toLocaleString(),
      email: String(email || '').trim(),
      name: String(name || '').trim(),
      role: String(role || 'player'),
      event: String(event),
      status: String(status),
      device: typeof navigator !== 'undefined' && navigator.userAgent 
        ? (navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop')
        : 'Browser',
      details: String(details || '')
    };

    // Google Apps Script requires text/plain and no-cors to avoid CORS preflight blocks
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Google Sheet log skipped:', err);
  }
};
