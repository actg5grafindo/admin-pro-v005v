-- Function to send email verification token
CREATE OR REPLACE FUNCTION send_email_verification_token(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    verification_token TEXT;
    user_id UUID;
    token_expiry TIMESTAMP;
    current_attempts INTEGER;
    last_attempt TIMESTAMP;
BEGIN
    -- Find the user
    SELECT id INTO user_id 
    FROM profiles 
    WHERE email = user_email;

    IF user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'User not found'
        );
    END IF;

    -- Check verification attempt limits
    SELECT 
        COALESCE(verification_attempts, 0),
        last_verification_attempt
    INTO 
        current_attempts, 
        last_attempt
    FROM profiles
    WHERE id = user_id;

    -- Prevent too many verification attempts
    IF current_attempts >= 5 AND last_attempt > NOW() - INTERVAL '1 hour' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Too many verification attempts. Please try again later.'
        );
    END IF;

    -- Generate a random 6-digit token
    verification_token := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    token_expiry := NOW() + INTERVAL '15 minutes';

    -- Delete any existing tokens for this user
    DELETE FROM email_verification_tokens 
    WHERE user_id = user_id;

    -- Insert new verification token
    INSERT INTO email_verification_tokens 
        (user_id, email, token, expires_at)
    VALUES 
        (user_id, user_email, verification_token, token_expiry);

    -- Update verification attempts
    UPDATE profiles
    SET 
        verification_attempts = COALESCE(verification_attempts, 0) + 1,
        last_verification_attempt = NOW()
    WHERE id = user_id;

    -- Return token details
    RETURN jsonb_build_object(
        'success', true,
        'token', verification_token,
        'expires_at', token_expiry::TEXT,
        'attempts_remaining', 5 - (current_attempts + 1)
    );
END;
$$;
