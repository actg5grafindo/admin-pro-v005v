import nodemailer from 'nodemailer';
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

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: import.meta.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
      port: Number(import.meta.env.BREVO_SMTP_PORT || 587),
      secure: false,
      auth: {
        user: import.meta.env.BREVO_SMTP_USERNAME || '84e8b5001@smtp-brevo.com',
        pass: import.meta.env.BREVO_SMTP_PASSWORD || 'pUPMjXEkgFCLIRQr'
      },
      tls: {
        rejectUnauthorized: false
      }
    });
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

  // Send Email with Logging and Template Support
  async sendEmail(options: EmailOptions, userId?: string): Promise<{ success: boolean; messageId?: string }> {
    try {
      // Prepare email content
      const template = this.generateEmailTemplate(options.templateType);
      const emailContent = {
        from: import.meta.env.BREVO_FROM_EMAIL || 'noreply@admin-pro.com',
        to: options.to,
        subject: options.subject || template.subject,
        text: options.text,
        html: options.html || template.html
      };

      // Send email
      const result = await this.transporter.sendMail(emailContent);

      // Log successful email
      await this.logEmail({
        recipient: options.to,
        subject: emailContent.subject,
        status: 'sent',
        user_id: userId
      });

      return { 
        success: true, 
        messageId: result.messageId 
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

export const emailService = new EmailService();
