import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, User, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [showForgotEmailModal, setShowForgotEmailModal] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let email = identifier;

      // Check if identifier is not an email (username or phone)
      if (!identifier.includes('@')) {
        email = await findUserEmail(identifier);
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toast.error(t('auth.resetPassword.error.failed'), {
          description: error.message
        });
      } else {
        toast.success(t('auth.resetPassword.success.sent'));
        navigate('/login');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(t('auth.resetPassword.error.unexpected'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotEmail = () => {
    setShowForgotEmailModal(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold w-full text-center">
            {t('auth.resetPassword.title')}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label className="block text-gray-700 mb-2">
              {t('auth.resetPassword.identifierLabel')}
            </label>
            <Input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t('auth.resetPassword.identifierPlaceholder')}
              className="w-full pl-10"
              disabled={loading}
              required
            />
            <div className="absolute left-3 top-11 h-5 w-5 text-gray-400">
              {identifier.includes('@') ? <Mail className="h-5 w-5" /> : 
               identifier.match(/^\d+$/) ? <Phone className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>
          </div>
          
          <div className="mb-4 text-right">
            <button
              type="button"
              onClick={handleForgotEmail}
              className="text-blue-500 hover:underline text-sm"
            >
              {t('auth.resetPassword.forgotEmail')}
            </button>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#3a72ec] hover:bg-[#3a72ec]/90"
            disabled={loading}
          >
            {loading ? t('common.loading') : t('auth.resetPassword.submitButton')}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:underline text-sm"
          >
            {t('auth.resetPassword.backToLogin')}
          </button>
        </div>

        {showForgotEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
              <h3 className="text-xl font-semibold mb-4">Forgot Email Address?</h3>
              <p className="text-gray-600 mb-4">
                If you cannot remember your email address, please contact our support team.
              </p>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowForgotEmailModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => {/* TODO: Add support contact logic */}}>
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}