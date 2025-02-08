import * as nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testGmailSMTP() {
  // Create a transporter using Gmail SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // Use TLS
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
    }
  });

  try {
    // Send a test email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: 'test@admin-pro.com', // Replace with a valid test email
      subject: 'Gmail SMTP Connection Test',
      html: `
        <h1>SMTP Connection Successful! 🚀</h1>
        <p>This is a test email from Admin Pro application.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Sent via Gmail SMTP</p>
      `
    });

    console.log('Test Email Sent Successfully! 🚀');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('SMTP Test Failed:', error);
    process.exit(1);
  }
}

// Run the test
testGmailSMTP();
