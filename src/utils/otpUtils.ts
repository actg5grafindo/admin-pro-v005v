import { supabase } from '@/lib/supabase';

export function generateOTP(length: number = 6): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeOTP(email: string, otp: string): Promise<boolean> {
  const { error } = await supabase
    .from('email_verification_otps')
    .upsert({ 
      email, 
      otp, 
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes expiry
    }, { 
      onConflict: 'email' 
    });

  return !error;
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('email_verification_otps')
    .select('*')
    .eq('email', email)
    .eq('otp', otp)
    .single();

  if (error || !data) return false;

  // Check if OTP is expired (15 minutes)
  const expiresAt = new Date(data.expires_at);
  if (expiresAt < new Date()) return false;

  // Delete the OTP after successful verification
  await supabase
    .from('email_verification_otps')
    .delete()
    .eq('email', email);

  return true;
}
