const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '../.env' });

async function updateEmailTemplate() {
  // Pastikan Anda menggunakan service role key yang benar
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const emailTemplate = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Konfirmasi Akun Anda / Confirm Your Account</h2>
  
  <p>
    Terima kasih telah mendaftar di Admin Pro! Gunakan kode OTP di bawah ini untuk mengonfirmasi email Anda.
    <br><br>
    Thank you for signing up to Admin Pro! Use the OTP code below to confirm your email.
  </p>
  
  <div style="text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 10px; font-weight: bold;">
    {{ .OTP }}
  </div>
  
  <p style="text-align: center; color: #666;">
    Kode ini akan kedaluwarsa dalam 15 menit / This code will expire in 15 minutes
  </p>
  
  <p>
    Jika Anda tidak mendaftar, abaikan email ini.
    <br><br>
    If you did not sign up, please ignore this email.
  </p>
  
  <p style="font-size: 12px; color: #777;">
    &copy; {{ .SiteURL }} - Admin Pro
  </p>
</div>`;

  try {
    // Update email template untuk OTP
    const { error } = await supabase.auth.updateEmailTemplate({
      type: 'signup',
      template: emailTemplate
    });

    if (error) throw error;
    console.log('Email template updated successfully!');
  } catch (error) {
    console.error('Error updating email template:', error);
  }
}

updateEmailTemplate();
