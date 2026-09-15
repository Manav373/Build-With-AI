/**
 * external-connectors/vapiVoiceConnector.js
 * -------------------------------------------------------------
 * Real-time Voice AI connectivity with Vapi.
 * Manages WebRTC audio sessions, multilingual speech synthesis,
 * transcript streaming, and webhook handshake.
 */

import { domainBridge } from '../cross-domain/domainBridge.js';

export class VapiVoiceConnector {
  constructor(apiKey, assistantId) {
    this.apiKey = apiKey || (typeof process !== 'undefined' ? process.env.VITE_VAPI_API_KEY : '');
    this.assistantId = assistantId || (typeof process !== 'undefined' ? process.env.VITE_VAPI_ASSISTANT_ID : '');
    this.callState = 'IDLE'; // 'IDLE' | 'CONNECTING' | 'IN_CALL' | 'ENDED' | 'ERROR'
    this.vapiInstance = null;
  }

  async startCall(customPrompt = '', language = 'hi-IN') {
    this.callState = 'CONNECTING';
    domainBridge.broadcast('VAPI_CALL_STATE_CHANGED', {
      state: this.callState,
      language
    }, 'vapi');

    try {
      // If running with @vapi-ai/web in browser
      if (typeof window !== 'undefined' && window.Vapi) {
        if (!this.vapiInstance) {
          this.vapiInstance = new window.Vapi(this.apiKey);
          this._bindEvents();
        }
        await this.vapiInstance.start(this.assistantId, {
          variableValues: { language, customPrompt }
        });
      }

      this.callState = 'IN_CALL';
      domainBridge.broadcast('VAPI_CALL_STATE_CHANGED', {
        state: this.callState,
        connectedAt: new Date().toISOString()
      }, 'vapi');

      return { success: true, state: this.callState };
    } catch (err) {
      this.callState = 'ERROR';
      domainBridge.broadcast('VAPI_CALL_STATE_CHANGED', {
        state: this.callState,
        error: err.message
      }, 'vapi');
      throw err;
    }
  }

  stopCall() {
    if (this.vapiInstance) {
      this.vapiInstance.stop();
    }
    this.callState = 'ENDED';
    domainBridge.broadcast('VAPI_CALL_STATE_CHANGED', {
      state: this.callState,
      endedAt: new Date().toISOString()
    }, 'vapi');
  }

  _bindEvents() {
    if (!this.vapiInstance) return;

    this.vapiInstance.on('speech-start', () => {
      domainBridge.broadcast('VAPI_SPEECH_EVENT', { type: 'SPEECH_START' }, 'vapi');
    });

    this.vapiInstance.on('speech-end', () => {
      domainBridge.broadcast('VAPI_SPEECH_EVENT', { type: 'SPEECH_END' }, 'vapi');
    });

    this.vapiInstance.on('message', (message) => {
      if (message.type === 'transcript') {
        domainBridge.broadcast('VAPI_TRANSCRIPT_STREAMED', {
          role: message.role,
          transcript: message.transcript
        }, 'vapi');
      }
    });
  }

  getStatus() {
    return {
      callState: this.callState,
      hasApiKey: Boolean(this.apiKey),
      hasAssistantId: Boolean(this.assistantId)
    };
  }
}

export const vapiConnector = new VapiVoiceConnector();
export default vapiConnector;
