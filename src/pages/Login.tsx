import React, { useState, useReducer, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { brevoEmailService } from '@/utils/brevoEmailService';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Phone 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import i18n from '@/i18n';

// Define initial state type for reducer
type State = {
  identifier: string;
  password: string;
};

// Define action types
type Action = 
  | { type: 'SET_IDENTIFIER'; payload: string }
  | { type: 'SET_PASSWORD'; payload: string };

// Reducer function
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_IDENTIFIER':
      return { ...state, identifier: action.payload };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    default:
      return state;
  }
};

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Initial state
  const initialState: State = {
    identifier: '',
    password: ''
  };

  // Use reducer for state management
  const [state, dispatch] = useReducer(reducer, initialState);

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Email verification states
  const [isEmailVerificationRequired, setIsEmailVerificationRequired] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSentTimestamp, setOtpSentTimestamp] = useState<number | null>(null);
  const [remainingCooldown, setRemainingCooldown] = useState(0);

  // Start cooldown timer for OTP resend
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (otpSentTimestamp) {
      intervalId = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - otpSentTimestamp) / 1000);
        const remainingTime = Math.max(30 - elapsedTime, 0);
        
        setRemainingCooldown(remainingTime);
        
        if (remainingTime === 0) {
          clearInterval(intervalId);
        }
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [otpSentTimestamp]);

  // Find user email based on identifier
  const findUserEmail = async (identifier: string) => {
    const { data, error } = await supabase
      .from('login_identifiers')
      .select('email')
      .or(
        `username.eq.${identifier},phone_number.eq.${identifier},email.eq.${identifier}`
      )
      .single();

    if (error || !data) {
      throw new Error('User not found');
    }

    return data.email;
  };

  // Login handler with email verification check
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let email = state.identifier;

      // Check if identifier is not an email (username or phone)
      if (!state.identifier.includes('@')) {
        email = await findUserEmail(state.identifier);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: state.password
      });

      if (error) throw error;

      // Check email verification status
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch user profile to check verification status
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('email', email)
        .single();

      if (profileError) throw profileError;

      // If email is not verified, trigger verification flow
      if (!profileData.email_verified) {
        await handleSendVerificationOTP(email);
        return;
      }

      // Successful login
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Send Verification OTP
  const handleSendVerificationOTP = async (email: string) => {
    try {
      const { user } = await supabase.auth.getUser();
      
      const result = await brevoEmailService.sendVerificationOTP(
        email, 
        user?.id
      );

      if (result.success) {
        // Store OTP in localStorage for verification
        localStorage.setItem(`otp_${email}`, result.otp || '');
        
        toast.success('Verification OTP sent successfully');
        setOtpSentTimestamp(Date.now());
        setIsEmailVerificationRequired(true);
      } else {
        toast.error('Failed to send verification OTP');
      }
    } catch (error) {
      console.error('OTP Send Error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (email: string, userOTP: string) => {
    try {
      const storedOTP = localStorage.getItem(`otp_${email}`);
      
      if (storedOTP === userOTP) {
        // Update email verification status in Supabase
        const { error } = await supabase
          .from('profiles')
          .update({ email_verified: true })
          .eq('email', email);

        if (error) throw error;

        // Clear OTP from storage
        localStorage.removeItem(`otp_${email}`);

        // Mark user as verified in auth metadata
        await supabase.auth.updateUser({
          data: { email_verified: true }
        });

        toast.success('Email verified successfully');
        navigate('/dashboard');
        return true;
      }

      toast.error('Invalid OTP. Please try again.');
      return false;
    } catch (error) {
      console.error('OTP Verification Error:', error);
      toast.error('Failed to verify email');
      return false;
    }
  };

  // OTP Verification handler
  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Find email for the original identifier
      const email = await findUserEmail(state.identifier);
      const isVerified = await handleVerifyOTP(email, otp);
      
      if (isVerified) {
        toast.success(t('auth.login.emailVerification.verified'));
        navigate('/dashboard');
      } else {
        toast.error(t('auth.login.emailVerification.invalidOTP'));
      }
      setLoading(false);
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(t('auth.login.error.unexpected'));
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOTP = async () => {
    // Check if enough time has passed since last OTP
    if (otpSentTimestamp && (Date.now() - otpSentTimestamp) < 60000) {
      toast.warning(t('auth.login.emailVerification.resendCooldown'));
      return;
    }

    try {
      // Find email for the original identifier
      const email = await findUserEmail(state.identifier);
      const otp = await handleSendVerificationOTP(email);
      
      if (otp) {
        setOtp(otp);
        toast.info(t('auth.login.emailVerification.otpResent'));
      } else {
        toast.error(t('auth.login.error.otpSendFailed'));
      }
    } catch (error) {
      toast.error(t('auth.login.error.unexpected'));
    }
  };

  // OTP Verification Form
  if (isEmailVerificationRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {t('auth.login.emailVerification.title')}
          </h2>
          
          <form onSubmit={handleOTPVerification}>
            <div className="mb-4 relative">
              <label className="block text-gray-700 mb-2">
                {t('auth.login.emailVerification.otpLabel')}
              </label>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                placeholder={t('auth.login.emailVerification.otpPlaceholder')}
                className="w-full pl-10"
                disabled={loading}
              />
              <Lock className="absolute left-3 top-11 h-5 w-5 text-gray-400" />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#3a72ec] hover:bg-[#3a72ec]/90"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('auth.login.emailVerification.verifyButton')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button 
              onClick={handleResendOTP}
              className="text-blue-500 hover:underline"
              disabled={loading || remainingCooldown > 0}
            >
              {remainingCooldown > 0 ? `${t('auth.login.emailVerification.resendCooldown')} (${remainingCooldown}s)` : t('auth.login.emailVerification.resendOTP')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Login Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t('auth.login.title')}
        </h2>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4 relative">
            <label className="block text-gray-700 mb-2">
              {t('auth.login.identifierLabel')}
            </label>
            <Input
              type="text"
              value={state.identifier}
              onChange={(e) => dispatch({ type: 'SET_IDENTIFIER', payload: e.target.value })}
              placeholder={t('auth.login.identifierPlaceholder')}
              className="w-full pl-10"
              disabled={loading}
              required
            />
            <div className="absolute left-3 top-11 h-5 w-5 text-gray-400">
              {state.identifier.includes('@') ? <Mail className="h-5 w-5" /> : 
               state.identifier.match(/^\d+$/) ? <Phone className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>
          </div>
          
          <div className="mb-4 relative">
            <label className="block text-gray-700 mb-2">
              {t('auth.login.passwordLabel')}
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              value={state.password}
              onChange={(e) => dispatch({ type: 'SET_PASSWORD', payload: e.target.value })}
              placeholder={t('auth.login.passwordPlaceholder')}
              className="w-full pl-10 pr-10"
              disabled={loading}
              required
            />
            <Lock className="absolute left-3 top-11 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-11 text-gray-400"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="mb-4 text-right">
            <Link 
              to="/reset-password" 
              className="text-blue-500 hover:underline text-sm"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#3a72ec] hover:bg-[#3a72ec]/90"
            disabled={loading}
          >
            {loading ? t('common.loading') : t('auth.login.loginButton')}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {t('auth.login.noAccount')}{' '}
            <Link 
              to="/register" 
              className="text-blue-500 hover:underline"
            >
              {t('auth.login.registerLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;