import { sendEmailViaResend, generateOTPEmailTemplate } from '../resendEmailUtils';

describe('Resend Email Utilities', () => {
  it('should generate a valid OTP email template', () => {
    const otp = '123456';
    const template = generateOTPEmailTemplate(otp);
    
    expect(template).toContain(otp);
    expect(template).toContain('One-Time Password');
  });

  // Note: This is a mock test. In a real-world scenario, 
  // you'd want to mock the Resend API call
  it('should have a method to send emails', () => {
    expect(typeof sendEmailViaResend).toBe('function');
  });
});

// Example of how to use the email utilities
async function exampleEmailUsage() {
  const email = 'test@example.com';
  const result = await sendEmailViaResend({
    to: email,
    subject: 'Test Email',
    html: generateOTPEmailTemplate('123456')
  });

  console.log('Email sent:', result);
}
