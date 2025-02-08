-- Create email_verification_otps table for storing email verification OTPs
CREATE TABLE email_verification_otps (
  email TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create an index for faster lookups
CREATE INDEX idx_email_verification_otps_email ON email_verification_otps(email);
