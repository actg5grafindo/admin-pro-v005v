import axios from 'axios';
import { supabase } from '@/lib/supabase';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateType?: 'verification' | 'reset_password' | 'welcome';
}

interface EmailLogEntry {
  recipient: string;
  subject: string;
  status: 'sent' | 'failed';
  error?: string;
  user_id?: string;
  created_at?: string;
}

class BrevoEmailService {
  private apiKey: string;
  private apiBaseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_BREVO_API_KEY || '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';
    this.apiBaseUrl = 'https://api.brevo.com/v3';
  }

  // Generate Email Templates
  private generateEmailTemplate(type: EmailOptions['templateType'], data: Record<string, any> = {}): { subject: string; html: string } {
    const templates = {
      verification: {
        subject: 'Verify Your Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2>Email Verification</h2>
            <p>Your verification code is: <strong>${data.otp}</strong></p>
            <p>This code will expire in 30 minutes.</p>
          </div>
        `
      },
      reset_password: {
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2>Password Reset</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${data.resetLink}">Reset Password</a>
          </div>
        `
      },
      welcome: {
        subject: 'Welcome to Admin Pro',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2>Welcome, ${data.name}!</h2>
            <p>Thank you for joining Admin Pro. We're excited to have you on board.</p>
          </div>
        `
      }
    };

    return type ? templates[type] : { subject: 'Admin Pro Notification', html: '' };
  }

  // Log Email in Supabase
  private async logEmail(logEntry: EmailLogEntry): Promise<void> {
    try {
      const { error } = await supabase
        .from('email_logs')
        .insert([{
          ...logEntry,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Email Logging Error:', error);
    }
  }

  // Send Email via Brevo API
  async sendEmail(options: EmailOptions, userId?: string): Promise<{ success: boolean; messageId?: string }> {
    try {
      // Prepare email content
      const template = this.generateEmailTemplate(options.templateType);
      const emailPayload = {
        sender: {
          name: 'Admin Pro',
          email: import.meta.env.VITE_BREVO_FROM_EMAIL || 'noreply@admin-pro.com'
        },
        to: [{ email: options.to }],
        subject: options.subject || template.subject,
        htmlContent: options.html || template.html,
        textContent: options.text
      };

      // Send email via Brevo API
      const response = await axios.post(`${this.apiBaseUrl}/smtp/email`, emailPayload, {
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      // Log successful email
      await this.logEmail({
        recipient: options.to,
        subject: emailPayload.subject,
        status: 'sent',
        user_id: userId
      });

      return { 
        success: true, 
        messageId: response.data.messageId 
      };

    } catch (error) {
      console.error('Email Send Error:', error);

      // Log failed email
      await this.logEmail({
        recipient: options.to,
        subject: options.subject || 'Email Notification',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown Error',
        user_id: userId
      });

      return { 
        success: false 
      };
    }
  }

  // Generate and Send OTP
  async sendVerificationOTP(email: string, userId?: string): Promise<{ success: boolean; otp?: string }> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // Store OTP in localStorage for client-side verification
      localStorage.setItem(`otp_${email}`, otp);

      // Send OTP Email
      const result = await this.sendEmail({
        to: email,
        templateType: 'verification',
        subject: 'Your Verification Code',
        html: this.generateEmailTemplate('verification', { otp }).html
      }, userId);

      return {
        success: result.success,
        otp: result.success ? otp : undefined
      };

    } catch (error) {
      console.error('OTP Send Error:', error);
      return { success: false };
    }
  }
}

export const brevoEmailService = new BrevoEmailService();
