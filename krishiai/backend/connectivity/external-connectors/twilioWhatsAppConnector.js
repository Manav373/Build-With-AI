/**
 * external-connectors/twilioWhatsAppConnector.js
 * -------------------------------------------------------------
 * Real-time connector for Twilio WhatsApp agronomist alerts and inbound webhooks.
 * Handles:
 * - Direct farmer WhatsApp alerts (disease diagnosis, weather alerts, MSP updates)
 * - Two-way asynchronous chat sync with FastAPI backend webhook
 */

import { domainBridge } from '../cross-domain/domainBridge.js';
import { universalClient } from '../api/universalClient.js';

export class TwilioWhatsAppConnector {
  constructor(accountSid, authToken) {
    this.accountSid = accountSid || '';
    this.authToken = authToken || '';
    this.fromNumber = 'whatsapp:+14155238886'; // Twilio Sandbox
  }

  /**
   * Send WhatsApp advisory alert to a farmer.
   */
  async sendAlert(toPhoneNumber, messageBody, metadata = {}) {
    const formattedPhone = toPhoneNumber.startsWith('whatsapp:')
      ? toPhoneNumber
      : `whatsapp:${toPhoneNumber.startsWith('+') ? toPhoneNumber : `+91${toPhoneNumber}`}`;

    const payload = {
      to: formattedPhone,
      from: this.fromNumber,
      body: messageBody,
      metadata,
      sentAt: new Date().toISOString()
    };

    domainBridge.broadcast('WHATSAPP_ALERT_DISPATCHING', payload, 'whatsapp');

    try {
      // Dispatch via backend webhook orchestrator
      const response = await universalClient.post('/api/v1/whatsapp/send', payload);

      domainBridge.broadcast('WHATSAPP_ALERT_SENT', {
        ...payload,
        status: 'DELIVERED',
        response
      }, 'whatsapp');

      return response;
    } catch (err) {
      domainBridge.broadcast('WHATSAPP_ALERT_FAILED', {
        ...payload,
        status: 'FAILED',
        error: err.message
      }, 'whatsapp');
      throw err;
    }
  }

  /**
   * Simulate or verify incoming WhatsApp webhook callback from Twilio.
   */
  handleInboundWebhook(webhookData) {
    const message = {
      from: webhookData.From,
      body: webhookData.Body,
      mediaUrl: webhookData.MediaUrl0 || null,
      messageSid: webhookData.MessageSid,
      receivedAt: new Date().toISOString()
    };

    domainBridge.broadcast('WHATSAPP_MESSAGE_RECEIVED', message, 'whatsapp');
    return message;
  }
}

export const twilioWhatsAppConnector = new TwilioWhatsAppConnector();
export default twilioWhatsAppConnector;
