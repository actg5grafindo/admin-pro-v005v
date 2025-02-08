import { supabase } from '@/lib/supabase';
import { sendOTPEmail } from './otpVerificationUtils';

interface EmailVerificationState {
  email: string;
  lastOtpSentAt: number;
  remainingAttempts: number;
}

class EmailVerificationManager {
  private static instance: EmailVerificationManager;
  private verificationStates: Record<string, EmailVerificationState> = {};

  private constructor() {}

  public static getInstance(): EmailVerificationManager {
    if (!this.instance) {
      this.instance = new EmailVerificationManager();
    }
    return this.instance;
  }

  // Generate 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Check if OTP can be resent
  private canResendOTP(email: string): boolean {
    const state = this.verificationStates[email];
    if (!state) return true;

    const currentTime = Date.now();
    const timeSinceLastOTP = currentTime - state.lastOtpSentAt;
    return timeSinceLastOTP >= 30000 && state.remainingAttempts > 0;
  }

  // Send Email Verification OTP
  public async sendVerificationOTP(email: string): Promise<{
    success: boolean;
    message: string;
    waitTime?: number;
  }> {
    // Check if OTP can be sent
    if (!this.canResendOTP(email)) {
      const state = this.verificationStates[email];
      const waitTime = 30 - Math.floor((Date.now() - state.lastOtpSentAt) / 1000);
      
      return {
        success: false,
        message: `Please wait ${waitTime} seconds before requesting a new OTP`,
        waitTime
      };
    }

    // Generate OTP
    const otp = this.generateOTP();

    try {
      // Send OTP via email
      await sendOTPEmail({
        email,
        otp,
        purpose: 'email_verification'
      });

      // Update verification state
      this.verificationStates[email] = {
        email,
        lastOtpSentAt: Date.now(),
        remainingAttempts: 3
      };

      return {
        success: true,
        message: 'Verification OTP sent successfully'
      };
    } catch (error) {
      console.error('OTP Send Error:', error);
      return {
        success: false,
        message: 'Failed to send verification OTP'
      };
    }
  }

  // Verify OTP
  public async verifyEmailOTP(email: string, userOTP: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const state = this.verificationStates[email];
    
    if (!state) {
      return {
        success: false,
        message: 'No OTP was sent to this email'
      };
    }

    // Validate OTP (in real scenario, use secure OTP validation)
    if (userOTP === this.generateOTP()) {
      try {
        // Mark email as verified in Supabase
        const { error } = await supabase
          .from('profiles')
          .update({ email_verified: true })
          .eq('email', email);

        if (error) throw error;

        // Clear verification state
        delete this.verificationStates[email];

        return {
          success: true,
          message: 'Email verified successfully'
        };
      } catch (error) {
        console.error('Verification Update Error:', error);
        return {
          success: false,
          message: 'Failed to verify email'
        };
      }
    } else {
      // Decrement remaining attempts
      state.remainingAttempts--;

      return {
        success: false,
        message: state.remainingAttempts > 0
          ? `Incorrect OTP. ${state.remainingAttempts} attempts remaining`
          : 'Maximum OTP attempts reached. Please request a new OTP'
      };
    }
  }
}

export const emailVerificationManager = EmailVerificationManager.getInstance();
