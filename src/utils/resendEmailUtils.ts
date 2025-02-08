import * as nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

// Email options interface
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  userId?: string; // Optional user ID for logging
}

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

// Generate OTP function
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

// Generate OTP Email Template
export function generateOTPEmailTemplate(otp: string): string {
  return `
    <html>
      <body>
        <h2>Your Verification Code</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="color: #4A90E2;">${otp}</h1>
        <p>This code will expire in 15 minutes.</p>
      </body>
    </html>
  `;
}

// Send email using Nodemailer with Gmail SMTP
export async function sendEmailViaResend(options: EmailOptions): Promise<boolean> {
  try {
    // Validate email address
    if (!isValidEmail(options.to)) {
      console.error('Invalid email address');
      return false;
    }

    // Send email
    const info = await transporter.sendMail({
      from: options.from || process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to: options.to,
      subject: options.subject,
      html: options.html
    });

    // Log email sending in Supabase
    await logEmailInSupabase({
      recipient: options.to,
      subject: options.subject,
      status: 'sent',
      messageId: info.messageId,
      userId: options.userId
    });

    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    // Log failed email attempt
    await logEmailInSupabase({
      recipient: options.to,
      subject: options.subject,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      userId: options.userId
    });

    console.error('Unexpected error in sendEmailViaResend:', error);
    return false;
  }
}

// Log email sending in Supabase
async function logEmailInSupabase(emailLog: {
  recipient: string;
  subject: string;
  status: 'sent' | 'failed' | 'queued';
  messageId?: string;
  errorMessage?: string;
  userId?: string;
}) {
  try {
    const { error } = await supabase
      .from('email_logs')
      .insert({
        ...emailLog,
        user_id: emailLog.userId || null
      });

    if (error) {
      console.error('Failed to log email in Supabase:', error);
    }
  } catch (error) {
    console.error('Unexpected error logging email:', error);
  }
}

// Email validation utility
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
