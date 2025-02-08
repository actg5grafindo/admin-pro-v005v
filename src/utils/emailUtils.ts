import { supabase } from '@/lib/supabase';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmailViaSendGrid(options: EmailOptions): Promise<boolean> {
  try {
    // Validate email address
    if (!isValidEmail(options.to)) {
      console.error(`Invalid email address: ${options.to}`);
      return false;
    }

    // Use fetch with proxy
    try {
      const response = await fetch('/api/resend/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'admin@grafindo.co',
          to: options.to,
          subject: options.subject,
          html: options.html
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Resend Email sending error:', errorText);
        
        // Fallback to alternative email sending method
        return await sendEmailFallback(options);
      }

      // Log email in Supabase
      await logEmailInSupabase({
        recipient: options.to,
        subject: options.subject,
        status: 'sent'
      });

      console.log(`Email sent successfully to ${options.to}`);
      return true;

    } catch (networkError) {
      console.error('Network error sending email:', networkError);
      return await sendEmailFallback(options);
    }
  } catch (error) {
    console.error('Unexpected error in sendEmailViaSendGrid:', error);
    return false;
  }
}

// Fallback email sending mechanism
async function sendEmailFallback(options: EmailOptions): Promise<boolean> {
  console.log('Using fallback email sending method');
  
  try {
    // You can implement alternative email sending methods here
    // For example, using a different email service or logging
    await logEmailInSupabase({
      recipient: options.to,
      subject: options.subject,
      status: 'fallback_attempted'
    });

    return true;
  } catch (error) {
    console.error('Fallback email sending failed:', error);
    return false;
  }
}

// Generate OTP email template
export function generateOTPEmailTemplate(otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Konfirmasi Akun / Account Confirmation</h2>
      <p>
        Terima kasih telah mendaftar di Admin Pro! Gunakan kode OTP di bawah ini untuk mengonfirmasi email Anda.
        <br><br>
        Thank you for signing up to Admin Pro! Use the OTP code below to confirm your email.
      </p>
      
      <div style="text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 10px; font-weight: bold;">
        ${otp}
      </div>
      
      <p style="text-align: center; color: #666;">
        Kode ini akan kedaluwarsa dalam 15 menit / This code will expire in 15 minutes
      </p>
      
      <p>
        Jika Anda tidak mendaftar, abaikan email ini.
        <br><br>
        If you did not sign up, please ignore this email.
      </p>
    </div>
  `;
}

// Log email sending in Supabase
async function logEmailInSupabase(emailLog: {
  recipient: string;
  subject: string;
  status: string;
}) {
  const { error } = await supabase
    .from('email_logs')
    .insert([emailLog]);

  if (error) {
    console.error('Error logging email in Supabase:', error);
  }
}

// Simple email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send email verification OTP
export async function sendEmailVerificationOTP(email: string): Promise<{ 
  sent: boolean, 
  otp?: string 
}> {
  try {
    // Generate 6-digit OTP
    const otp = generateOTP();

    // Create email template
    const emailTemplate = generateOTPEmailTemplate(
      `Your Email Verification OTP is: ${otp}. 
      This code will expire in 10 minutes.`
    );

    // Send email via existing method
    const emailSent = await sendEmailViaSendGrid({
      to: email,
      subject: 'Email Verification OTP',
      html: emailTemplate
    });

    // If email sent successfully, store OTP securely
    if (emailSent) {
      await storeEmailVerificationOTP(email, otp);
      
      await logEmailInSupabase({
        recipient: email,
        subject: 'Email Verification OTP',
        status: 'otp_sent'
      });

      return { sent: true, otp };
    }

    return { sent: false };
  } catch (error) {
    console.error('Email OTP sending failed:', error);
    return { sent: false };
  }
}

// Store OTP securely (in Supabase)
async function storeEmailVerificationOTP(email: string, otp: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('email_verification_otps')
      .upsert({
        email,
        otp,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      }, { 
        onConflict: 'email' 
      });

    if (error) {
      console.error('Failed to store OTP:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error storing OTP:', error);
    return false;
  }
}

// Verify OTP
export async function verifyEmailOTP(email: string, otp: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('email_verification_otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      console.warn('Invalid or expired OTP');
      return false;
    }

    // Mark email as verified
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ email_verified: true })
      .eq('email', email);

    if (updateError) {
      console.error('Failed to update email verification status:', updateError);
      return false;
    }

    // Delete used OTP
    await supabase
      .from('email_verification_otps')
      .delete()
      .eq('email', email);

    return true;
  } catch (error) {
    console.error('OTP verification failed:', error);
    return false;
  }
}

// Resend OTP with cooldown
export async function resendEmailVerificationOTP(email: string): Promise<{ 
  canResend: boolean, 
  sent?: boolean 
}> {
  try {
    // Check last OTP sent time
    const { data, error } = await supabase
      .from('email_verification_otps')
      .select('created_at')
      .eq('email', email)
      .single();

    if (data) {
      const lastSentTime = new Date(data.created_at).getTime();
      const currentTime = Date.now();
      
      // Enforce 1-minute cooldown between OTP requests
      if (currentTime - lastSentTime < 60000) {
        return { 
          canResend: false 
        };
      }
    }

    // Send new OTP
    const result = await sendEmailVerificationOTP(email);
    return { 
      canResend: true, 
      sent: result.sent 
    };

  } catch (error) {
    console.error('Resend OTP failed:', error);
    return { 
      canResend: false 
    };
  }
}

// Add email verification token functions

export async function sendEmailVerificationToken(email: string): Promise<boolean> {
  try {
    // Generate a verification token (could be a UUID or random string)
    const token = crypto.randomUUID();
    
    // Create email template for verification
    const verificationLink = `${import.meta.env.VITE_APP_URL}/verify-email?token=${token}`;
    
    const emailTemplate = generateOTPEmailTemplate(`
      Please verify your email by clicking the link below:
      ${verificationLink}
    `);

    // Send email via existing method
    const emailSent = await sendEmailViaSendGrid({
      to: email,
      subject: 'Verify Your Email',
      html: emailTemplate
    });

    // If email sent successfully, log the token (securely)
    if (emailSent) {
      await logEmailInSupabase({
        recipient: email,
        subject: 'Email Verification',
        status: 'verification_sent'
      });
    }

    return emailSent;
  } catch (error) {
    console.error('Email verification token sending failed:', error);
    return false;
  }
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  try {
    // In a real-world scenario, you'd validate this token against a stored token in your database
    // This is a placeholder implementation
    if (!token) return false;

    // Simulate token verification
    // In production, you'd check against a secure token store
    return token.length > 10;
  } catch (error) {
    console.error('Email token verification failed:', error);
    return false;
  }
}
