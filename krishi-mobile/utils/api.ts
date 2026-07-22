import { API_BASE_URL } from '@/constants/Config';

export interface SendOTPResponse {
  success: boolean;
  message: string;
  phone: string;
  session_id?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  phone: string;
  token?: string;
}

/**
 * Send OTP to phone number via backend (2Factor.in integration)
 */
export async function sendOTP(phone: string): Promise<SendOTPResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send OTP');
    }

    return await response.json();
  } catch (error) {
    console.error('[OTP] sendOTP error:', error);
    throw error;
  }
}

/**
 * Verify OTP code for a phone number
 */
export async function verifyOTP(phone: string, code: string): Promise<VerifyOTPResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to verify OTP');
    }

    return await response.json();
  } catch (error) {
    console.error('[OTP] verifyOTP error:', error);
    throw error;
  }
}
