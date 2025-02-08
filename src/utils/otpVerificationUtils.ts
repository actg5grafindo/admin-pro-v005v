import * as nodemailer from 'nodemailer';
import { generateOTP } from './resendEmailUtils';
import { generateOTPEmailTemplate } from './resendEmailUtils';
import { sendEmailViaResend } from './resendEmailUtils';
import { supabase } from '@/lib/supabase';

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT),
  secure: false, // Use TLS
  auth: {
    user: process.env.BREVO_SMTP_USERNAME,
    pass: process.env.BREVO_SMTP_PASSWORD
  }
});

// Send OTP via Email
export async function sendOTPViaEmail(email: string, userId?: string): Promise<{ success: boolean; otp?: string }> {
  try {
    // Generate OTP
    const otp = generateOTP();
    const emailTemplate = generateOTPEmailTemplate(otp);

    // Send email with optional user ID for logging
    const emailSent = await sendEmailViaResend({
      to: email,
      subject: 'Your One-Time Password',
      html: emailTemplate,
      userId: userId
    });

    if (!emailSent) {
      console.error('Failed to send OTP email');
      return { success: false };
    }

    // Store OTP in Supabase for verification
    const { error } = await supabase
      .from('otp_verification')
      .insert({
        email,
        otp,
        user_id: userId,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      });

    if (error) {
      console.error('Failed to store OTP:', error);
      return { success: false };
    }

    return { 
      success: true, 
      otp 
    };
  } catch (error) {
    console.error('Unexpected error in sendOTPViaEmail:', error);
    return { success: false };
  }
}

// Verify OTP
export async function verifyOTP(email: string, userOTP: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email)
      .eq('otp', userOTP)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      console.error('OTP verification failed:', error);
      return false;
    }

    // Delete the used OTP
    await supabase
      .from('otp_verification')
      .delete()
      .eq('id', data.id);

    return true;
  } catch (error) {
    console.error('Unexpected error in OTP verification:', error);
    return false;
  }
}
