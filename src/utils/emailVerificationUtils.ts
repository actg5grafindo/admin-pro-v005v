import { supabase } from '@/lib/supabase';
import { sendEmailViaSendGrid } from './emailUtils';

// Generate a secure random token
function generateVerificationToken(length = 6): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send email verification token
export async function sendEmailVerificationToken(email: string, userId: string): Promise<boolean> {
  try {
    // Generate verification token
    const token = generateVerificationToken();

    // Store token in database
    const { error: tokenError } = await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: userId,
        email: email,
        token: token
      });

    if (tokenError) {
      console.error('Error storing verification token:', tokenError);
      return false;
    }

    // Send verification email
    const emailSent = await sendEmailViaSendGrid({
      to: email,
      subject: 'Email Verification for Admin Pro',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Your verification code is:</p>
          <div style="text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${token}
          </div>
          <p>This code will expire in 15 minutes.</p>
        </div>
      `
    });

    return emailSent;
  } catch (error) {
    console.error('Error in sendEmailVerificationToken:', error);
    return false;
  }
}

// Verify email token
export async function verifyEmailToken(email: string, token: string): Promise<boolean> {
  try {
    // Find the token
    const { data, error } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('email', email)
      .eq('token', token)
      .single();

    if (error || !data) {
      console.error('Invalid or expired token:', error);
      return false;
    }

    // Check token expiration
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    if (now > expiresAt) {
      console.error('Token has expired');
      return false;
    }

    // Mark email as verified
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ email_verified: true })
      .eq('id', data.user_id);

    if (updateError) {
      console.error('Error updating email verification status:', updateError);
      return false;
    }

    // Delete used token
    await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('id', data.id);

    return true;
  } catch (error) {
    console.error('Error in verifyEmailToken:', error);
    return false;
  }
}

// Check email verification status
export async function checkEmailVerificationStatus(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email_verified')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking email verification status:', error);
      return false;
    }

    return data?.email_verified || false;
  } catch (error) {
    console.error('Unexpected error checking email verification:', error);
    return false;
  }
}
