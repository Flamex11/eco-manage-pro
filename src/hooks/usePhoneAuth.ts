import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PhoneAuthResult {
  success: boolean;
  error?: string;
}

export const usePhoneAuth = () => {
  const [loading, setLoading] = useState(false);

  const sendOTP = async (phoneNumber: string): Promise<PhoneAuthResult> => {
    setLoading(true);
    try {
      // Generate a random 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in database with 5-minute expiry
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);
      
      const { error } = await supabase
        .from('phone_verifications')
        .insert([{
          phone_number: phoneNumber,
          otp_code: otpCode,
          expires_at: expiresAt.toISOString(),
        }]);

      if (error) {
        return { success: false, error: error.message };
      }

      // In a real app, you would send the OTP via SMS
      // OTP codes should never be logged to console in production
      // TODO: Implement SMS delivery service (Twilio, AWS SNS, etc.)
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to send OTP' };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (phoneNumber: string, otpCode: string): Promise<PhoneAuthResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('phone_verifications')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('otp_code', otpCode)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid or expired OTP' };
      }

      // Mark OTP as verified
      await supabase
        .from('phone_verifications')
        .update({ verified: true })
        .eq('id', data.id);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to verify OTP' };
    } finally {
      setLoading(false);
    }
  };

  return { sendOTP, verifyOTP, loading };
};