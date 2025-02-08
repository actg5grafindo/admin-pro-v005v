const nodemailer = require('nodemailer');

async function testSmtp() {
  console.log('🔍 Starting SMTP Diagnostic Test...');

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: '84e8b5001@smtp-brevo.com',
      pass: 'pUPMjXEkgFCLIRQr'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    // Verify connection
    await new Promise((resolve, reject) => {
      transporter.verify((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    // Send test email
    const result = await transporter.sendMail({
      from: 'noreply@admin-pro.com',
      to: 'noreply@admin-pro.com',
      subject: 'SMTP Test',
      text: 'SMTP connection test successful'
    });

    console.log('✅ SMTP Test Successful');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('❌ SMTP Test Failed:', error);
  }
}

testSmtp();
