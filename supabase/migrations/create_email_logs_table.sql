-- Create email_logs table for tracking email sending
CREATE TABLE email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT CHECK (status IN ('sent', 'failed', 'queued')) NOT NULL,
    message_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email logs
CREATE POLICY "Users can view their own email logs" 
ON email_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert email logs" 
ON email_logs FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');
