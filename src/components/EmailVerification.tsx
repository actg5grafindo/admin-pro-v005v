import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const EmailVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Extract email from navigation state or require manual input
    const stateEmail = location.state?.email;
    if (stateEmail) {
      setEmail(stateEmail);
    }
  }, [location.state]);

  useEffect(() => {
    const countdown = timer > 0 && setInterval(() => setTimer(timer - 1), 1000);
    return () => clearInterval(countdown as NodeJS.Timeout);
  }, [timer]);

  const sendVerificationEmail = async () => {
    if (!email) {
      toast.error('Please provide an email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.rpc('send_email_verification_token', {
        user_email: email
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Verification email sent!');
        setTimer(30);
        setCanResend(false);
      } else {
        toast.error(data.error || 'Failed to send verification email');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!email || !otp) {
      toast.error('Please provide both email and OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (error) throw error;

      // Update user profile to mark email as verified
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ email_verified: true })
        .eq('email', email);

      if (updateError) throw updateError;

      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-verification container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
        
        {!email && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email Address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Verification Code</label>
          <input 
            type="text" 
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex justify-between items-center">
          <button 
            onClick={handleVerifyOTP}
            disabled={otp.length !== 6 || loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          {timer > 0 ? (
            <p className="text-gray-600">Resend in {timer} seconds</p>
          ) : (
            <button 
              onClick={sendVerificationEmail}
              disabled={loading || !canResend}
              className="text-blue-500 hover:underline disabled:opacity-50"
            >
              Resend Verification Email
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
