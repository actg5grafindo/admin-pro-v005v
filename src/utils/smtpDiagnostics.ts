import nodemailer from 'nodemailer';
import { createTransport } from 'nodemailer';

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
}

class SMTPDiagnostics {
  private config: SMTPConfig;
  private logger: Console;

  constructor() {
    this.logger = console;
    this.config = {
      host: import.meta.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(import.meta.env.SMTP_PORT || 587),
      username: import.meta.env.SMTP_USERNAME || 'your_email@gmail.com',
      password: import.meta.env.SMTP_PASSWORD || 'your_app_password',
      fromEmail: import.meta.env.SMTP_FROM_EMAIL || 'noreply@admin-pro.com'
    };
  }

  // Comprehensive Connection Test with Detailed Diagnostics
  public async performComprehensiveSMTPTest(): Promise<{
    connectionStatus: boolean;
    configurationDetails: Record<string, any>;
    errorDetails?: string;
  }> {
    const diagnosticResults: Record<string, any> = {
      timestamp: new Date().toISOString(),
      host: this.config.host,
      port: this.config.port,
      username: this.config.username.replace(/./g, '*'), // Mask username
    };

    try {
      const transporter = createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: false, // Use TLS
        auth: {
          user: this.config.username,
          pass: this.config.password
        },
        tls: {
          rejectUnauthorized: true // Stricter for Gmail
        }
      });

      // Verify SMTP Connection
      await transporter.verify();
      diagnosticResults.connectionStatus = true;

      // Send Diagnostic Email
      const emailResult = await transporter.sendMail({
        from: this.config.fromEmail,
        to: this.config.username, // Send to self for verification
        subject: '🔍 SMTP Diagnostic Test',
        text: 'SMTP connection verified successfully.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2>✅ SMTP Connection Verified</h2>
            <p>Diagnostic test completed successfully at ${diagnosticResults.timestamp}</p>
            <small>Sent via Gmail SMTP</small>
          </div>
        `
      });

      diagnosticResults.emailMessageId = emailResult.messageId;

      return {
        connectionStatus: true,
        configurationDetails: diagnosticResults
      };
    } catch (error) {
      this.logger.error('SMTP Verification Failed:', error);
      return {
        connectionStatus: false,
        configurationDetails: diagnosticResults,
        errorDetails: error instanceof Error ? error.message : 'Unhandled SMTP Error'
      };
    }
  }

  // Send Diagnostic Test Email
  private async sendTestEmail(transporter: nodemailer.Transporter): Promise<{
    messageId: string;
  }> {
    const testEmail = await transporter.sendMail({
      from: this.config.fromEmail,
      to: this.config.fromEmail, // Send to self
      subject: '🔍 SMTP Diagnostic Test',
      text: 'SMTP connection verified successfully.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>✅ SMTP Connection Verified</h2>
          <p>This is a diagnostic test email sent at ${new Date().toLocaleString()}.</p>
          <small>Sent via Gmail SMTP</small>
        </div>
      `
    });

    return {
      messageId: testEmail.messageId
    };
  }
}

export const smtpDiagnostics = new SMTPDiagnostics();

if (require.main === module) {
  (async () => {
    console.log('🔍 Starting Direct SMTP Diagnostic Test...');
    try {
      const result = await smtpDiagnostics.performComprehensiveSMTPTest();
      console.log('📋 Diagnostic Results:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('🚨 Diagnostic Test Failed:', error);
    }
  })();
}
