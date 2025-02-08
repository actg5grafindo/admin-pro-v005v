import { Resend } from 'resend';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'actg.grafindotu@gmail.com',
      to: 'recipient@example.com', // Replace with a test email
      subject: 'Test Email from Admin Pro',
      html: `
        <h1>Hello from Admin Pro!</h1>
        <p>This is a test email sent via Resend.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    });

    if (error) {
      console.error('Email sending error:', error);
      return;
    }

    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test email function
sendTestEmail();
