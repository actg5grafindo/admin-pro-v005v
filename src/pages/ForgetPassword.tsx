import React, { useState, useReducer } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  Lock,
  Languages 
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

// Define initial state type for reducer
type State = {
  email: string;
  language: string;
};

// Define action types
type Action = 
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: string };

// Reducer function
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, email: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    default:
      return state;
  }
};

const ForgetPassword = () => {
  const { t, i18n: translator } = useTranslation();
  const navigate = useNavigate();

  // Initial state
  const initialState: State = {
    email: '',
    language: i18n.language || 'id'
  };

  // Use reducer for state management
  const [state, dispatch] = useReducer(reducer, initialState);

  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Language change handler
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
  };

  // Reset password handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(state.email, {
        redirectTo: `${window.location.origin}/update-password`
      });

      if (error) {
        toast.error(t('auth.forgetPassword.error.failed'), {
          description: error.message
        });
      } else {
        setResetSent(true);
        toast.success(t('auth.forgetPassword.success.resetSent'));
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(t('auth.forgetPassword.error.unexpected'));
    } finally {
      setLoading(false);
    }
  };

  // Render reset password form or success message
  if (resetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-6">
            {t('auth.forgetPassword.success.title')}
          </h2>
          <p className="mb-6">
            {t('auth.forgetPassword.success.description')}
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className="w-full"
          >
            {t('auth.forgetPassword.success.backToLogin')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-end mb-4">
          <Select 
            value={state.language} 
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Language">
                <Languages className="mr-2 h-4 w-4" />
                {state.language.toUpperCase()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">ID</SelectItem>
              <SelectItem value="en">EN</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {t('auth.forgetPassword.title')}
        </h2>
        
        <form onSubmit={handleResetPassword}>
          <div className="mb-4 relative">
            <label className="block text-gray-700 mb-2">
              {t('auth.forgetPassword.emailLabel')}
            </label>
            <Input
              type="email"
              value={state.email}
              onChange={(e) => dispatch({ type: 'SET_EMAIL', payload: e.target.value })}
              placeholder={t('auth.forgetPassword.emailPlaceholder')}
              className="w-full pl-10"
              disabled={loading}
              required
            />
            <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#3a72ec] hover:bg-[#3a72ec]/90"
            disabled={loading}
          >
            {loading ? 'Sedang Memproses...' : 'Kirim Tautan Reset'}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            <Link 
              to="/login" 
              className="text-blue-500 hover:underline"
            >
              {t('auth.forgetPassword.backToLogin')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
