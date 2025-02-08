import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Smartphone, 
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Languages,
  UserRoundCog
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import i18n from '@/i18n';
import { databaseUtils, executeQuery } from '@/lib/supabaseClient';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [state, setState] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    language: i18n.language,
    verificationCode: '',
    isEmailVerificationRequired: false,
    userId: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [renderError, setRenderError] = useState<Error | null>(null);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setState(prev => ({ ...prev, language: lang }));
    localStorage.setItem('language', lang);
  };

  // Enhanced validation functions
  const validateUsername = (username: string): string | null => {
    const sanitizedUsername = databaseUtils.sanitizeInput(username);
    if (sanitizedUsername.length < 3 || sanitizedUsername.length > 50) {
      return t('auth.register.validation.usernameTooShort');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(sanitizedUsername)) {
      return t('auth.register.validation.usernameInvalid');
    }
    return null;
  };

  const validateFullName = (fullName: string): string | null => {
    const sanitizedFullName = databaseUtils.sanitizeInput(fullName);
    if (sanitizedFullName.length < 3 || sanitizedFullName.length > 100) {
      return t('auth.register.validation.fullNameTooShort');
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    const sanitizedEmail = databaseUtils.sanitizeInput(email);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return t('auth.register.validation.invalidEmail');
    }
    return null;
  };

  const validatePhoneNumber = (phoneNumber: string): string | null => {
    const sanitizedPhone = databaseUtils.sanitizeInput(phoneNumber);
    const phoneRegex = /^08\d{8,}$/;
    if (!phoneRegex.test(sanitizedPhone)) {
      return t('auth.register.validation.invalidPhoneNumber');
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!(hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar)) {
      return t('auth.register.validation.passwordRequirements', {
        minLength: 8,
        hasUppercase: hasUppercase,
        hasLowercase: hasLowercase,
        hasNumber: hasNumber,
        hasSpecialChar: hasSpecialChar
      });
    }

    return null;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (password !== confirmPassword) {
      return t('auth.register.validation.passwordMismatch');
    }
    return null;
  };

  const [errors, setErrors] = useState<{
    username?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Validation handlers
  const handleUsernameBlur = () => {
    const usernameError = validateUsername(state.username);
    setErrors(prev => ({ ...prev, username: usernameError }));
  };

  const handleFullNameBlur = () => {
    const fullNameError = validateFullName(state.fullName);
    setErrors(prev => ({ ...prev, fullName: fullNameError }));
  };

  const handleEmailBlur = () => {
    const emailError = validateEmail(state.email);
    setErrors(prev => ({ ...prev, email: emailError }));
  };

  const handlePhoneNumberBlur = () => {
    const phoneNumberError = validatePhoneNumber(state.phoneNumber);
    setErrors(prev => ({ ...prev, phoneNumber: phoneNumberError }));
  };

  const handlePasswordBlur = () => {
    const passwordError = validatePassword(state.password);
    setErrors(prev => ({ ...prev, password: passwordError }));
  };

  const handleConfirmPasswordBlur = () => {
    const confirmPasswordError = validateConfirmPassword(state.password, state.confirmPassword);
    setErrors(prev => ({ ...prev, confirmPassword: confirmPasswordError }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Normalize and sanitize inputs
      const normalizedEmail = databaseUtils.sanitizeInput(state.email.trim().toLowerCase());
      const normalizedUsername = databaseUtils.sanitizeInput(state.username.trim().toLowerCase());
      const normalizedFullName = databaseUtils.sanitizeInput(state.fullName.trim());

      // Validate all fields before submission
      const usernameError = validateUsername(state.username);
      const fullNameError = validateFullName(state.fullName);
      const emailError = validateEmail(state.email);
      const phoneNumberError = validatePhoneNumber(state.phoneNumber);
      const passwordError = validatePassword(state.password);
      const confirmPasswordError = validateConfirmPassword(state.password, state.confirmPassword);

      if (usernameError || fullNameError || emailError || phoneNumberError || passwordError || confirmPasswordError) {
        setErrors({
          username: usernameError,
          fullName: fullNameError,
          email: emailError,
          phoneNumber: phoneNumberError,
          password: passwordError,
          confirmPassword: confirmPasswordError
        });
        setLoading(false);
        return;
      }

      try {
        // Hash password with salt
        const passwordHash = await databaseUtils.hashPassword(state.password);

        // Generate UUIDs
        const userId = databaseUtils.generateUUID();
        const profileId = databaseUtils.generateUUID();

        // Prepare user and profile data
        const userQuery = `
          INSERT INTO users (
            id, username, email, password_hash, 
            first_name, last_name, role, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        const userParams = [
          userId, 
          normalizedUsername, 
          normalizedEmail, 
          passwordHash,
          normalizedFullName.split(' ')[0] || '', // first_name
          normalizedFullName.split(' ').slice(1).join(' ') || '', // last_name
          'user', // default role
          true // is_active
        ];

        const profileQuery = `
          INSERT INTO profiles (
            id, user_id, username, email, 
            phone_number, theme
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const profileParams = [
          profileId, 
          userId, 
          normalizedUsername, 
          normalizedEmail,
          state.phoneNumber ? databaseUtils.sanitizeInput(state.phoneNumber) : null,
          'light' // default theme
        ];

        // Execute queries
        await executeQuery(userQuery, userParams);
        await executeQuery(profileQuery, profileParams);

        // Successful registration
        toast.success('Registration Successful', {
          description: 'Your account has been created',
          duration: 3000
        });

        // Optional: Redirect or show success message
        navigate('/login');

      } catch (dbError) {
        console.error('🚨 User Record Creation Error:', dbError);
        
        toast.error('Registration Failed', {
          description: 'Could not create user record',
          duration: 5000
        });
        
        setLoading(false);
      }

    } catch (error) {
      console.error('🚨 Unexpected Registration Error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Registration failed. Please try again.';

      toast.error('Registration Failed', {
        description: errorMessage,
        duration: 5000
      });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Lifecycle error handling
  useEffect(() => {
    const handleRenderError = (error: Error) => {
      console.error('🚨 Render Error in Register:', error);
      setRenderError(error);
    };

    window.addEventListener('error', handleRenderError as EventListener);
    return () => {
      window.removeEventListener('error', handleRenderError as EventListener);
    };
  }, []);

  if (renderError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {t('auth.register.error.renderError')}
          </h2>
          <p className="text-center">
            {t('auth.register.error.renderErrorDescription')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t('auth.register.title')}
        </h2>

        {!state.isEmailVerificationRequired ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="relative mb-6">
              <div className="relative">
                <UserRoundCog className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder={t('auth.register.username')}
                  value={state.username}
                  onChange={(e) => setState(prev => ({ ...prev, username: e.target.value }))}
                  onBlur={handleUsernameBlur}
                  className={`pl-10 ${errors.username ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1 pl-10">{errors.username}</p>
              )}
            </div>

            {/* Full Name Input */}
            <div className="relative mb-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder={t('auth.register.fullName')}
                  value={state.fullName}
                  onChange={(e) => setState(prev => ({ ...prev, fullName: e.target.value }))}
                  onBlur={handleFullNameBlur}
                  className={`pl-10 ${errors.fullName ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1 pl-10">{errors.fullName}</p>
              )}
            </div>

            {/* Email Input */}
            <div className="relative mb-6">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <Input
                  type="email"
                  placeholder={t('auth.register.email')}
                  value={state.email}
                  onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                  onBlur={handleEmailBlur}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 pl-10">{errors.email}</p>
              )}
            </div>

            {/* Phone Number Input */}
            <div className="relative mb-6">
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <Input
                  type="tel"
                  placeholder={t('auth.register.phoneNumber')}
                  value={state.phoneNumber}
                  onChange={(e) => setState(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  onBlur={handlePhoneNumberBlur}
                  className={`pl-10 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1 pl-10">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Language Selection */}
            <div className="mb-4 relative">
              <label className="mb-2 block">{t('auth.register.selectLanguage')}</label>
              <div className="relative">
                <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <Select
                  value={state.language}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder={t('auth.register.selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">
                      <span className="flex items-center">
                        🇺🇸 English
                      </span>
                    </SelectItem>
                    <SelectItem value="id">
                      <span className="flex items-center">
                        🇮🇩 Indonesia
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Password Input */}
            <div className="relative mb-6">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.register.password')}
                  value={state.password}
                  onChange={(e) => setState(prev => ({ ...prev, password: e.target.value }))}
                  onBlur={handlePasswordBlur}
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 pl-10">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="relative mb-6">
              <div className="relative">
                <CheckCircle2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t('auth.register.confirmPassword')}
                  value={state.confirmPassword}
                  onChange={(e) => setState(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  onBlur={handleConfirmPasswordBlur}
                  className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1 pl-10">{errors.confirmPassword}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#3a72ec] hover:bg-[#3a72ec]/90 text-white"
              disabled={loading}
            >
              {loading ? t('Membuat akun...') : t('auth.register.submit')}
            </Button>

            <div className="mt-4 text-center">
              {t('auth.register.alreadyHaveAccount')} 
              <Link 
                to="/login" 
                className="ml-2 text-[#3a72ec] hover:underline"
              >
                {t('auth.register.signIn')}
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-center">
              {t('auth.register.verificationSent', { email: state.email })}
            </p>
            <div className="relative">
              <Input
                type="text"
                placeholder={t('auth.register.enterVerificationCode')}
                value={state.verificationCode}
                onChange={(e) => setState(prev => ({ ...prev, verificationCode: e.target.value }))}
                className="pl-3"
                maxLength={6}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => {/* Implement email verification */}} 
                className="flex-1"
              >
                {t('auth.register.verifyEmail')}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {/* Implement resend verification */}}
                className="flex-1"
              >
                {t('auth.register.resendCode')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;