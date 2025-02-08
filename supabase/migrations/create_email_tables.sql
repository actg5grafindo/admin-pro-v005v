-- Create email_verification_otps table
CREATE TABLE email_verification_otps (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  otp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '10 minutes'
);

-- Create email_logs table
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for email tables
ALTER TABLE email_verification_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users to manage their own data
CREATE POLICY "Users can manage their own OTP" ON email_verification_otps
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own email logs" ON email_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);
