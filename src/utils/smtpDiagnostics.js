const nodemailer = require('nodemailer');

class SMTPDiagnostics {
  constructor() {
    this.config = {
      host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
      port: Number(process.env.BREVO_SMTP_PORT || 587),
      username: process.env.BREVO_SMTP_USERNAME || '84e8b5001@smtp-brevo.com',
      password: process.env.BREVO_SMTP_PASSWORD || 'pUPMjXEkgFCLIRQr',
      fromEmail: process.env.BREVO_FROM_EMAIL || 'noreply@admin-pro.com'
    };
  }

  async performComprehensiveSMTPTest() {
    const diagnosticResults = {
      timestamp: new Date().toISOString(),
      host: this.config.host,
      port: this.config.port,
      username: this.config.username.replace(/./g, '*')
    };

    try {
      const transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: false,
        auth: {
          user: this.config.username,
          pass: this.config.password
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify SMTP Connection
      await new Promise((resolve, reject) => {
        transporter.verify((error) => {
          if (error) {
            console.error('SMTP Verification Failed:', error);
            reject(error);
          } else {
            resolve();
          }
        });
      });

      // Send Test Email
      const testEmail = await transporter.sendMail({
        from: this.config.fromEmail,
        to: this.config.fromEmail,
        subject: '🔍 SMTP Diagnostic Test',
        text: 'SMTP connection verified successfully.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2>✅ SMTP Connection Verified</h2>
            <p>This is a diagnostic test email sent at ${new Date().toLocaleString()}.</p>
            <small>Sent via Brevo SMTP Relay</small>
          </div>
        `
      });

      diagnosticResults.emailTest = {
        status: 'success',
        messageId: testEmail.messageId
      };

      return {
        connectionStatus: true,
        configurationDetails: diagnosticResults
      };

    } catch (error) {
      console.error('SMTP Diagnostic Error:', error);
      
      diagnosticResults.emailTest = {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown Error'
      };

      return {
        connectionStatus: false,
        configurationDetails: diagnosticResults,
        errorDetails: error instanceof Error ? error.message : 'Unhandled SMTP Error'
      };
    }
  }
}

const smtpDiagnostics = new SMTPDiagnostics();

// Direct test when run as a script
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

module.exports = { smtpDiagnostics };
