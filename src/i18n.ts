import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Validation Error Messages
      'Nama pengguna harus diisi': 'Username is required',
      'Nama pengguna minimal 3 karakter': 'Username must be at least 3 characters long',
      'Nama lengkap harus diisi': 'Full name is required',
      'Nama lengkap minimal 3 karakter': 'Full name must be at least 3 characters long',
      'Email harus diisi': 'Email is required',
      'Format email tidak valid': 'Invalid email format',
      'Nomor telepon harus diisi': 'Phone number is required',
      'Nomor telepon harus diawali 0 dan 10-13 digit': 'Phone number must start with 0 and be 10-13 digits',
      'Kata sandi harus diisi': 'Password is required',
      'Kata sandi minimal 6 karakter': 'Password must be at least 6 characters long',
      'Kata sandi harus mengandung huruf besar, huruf kecil, dan angka': 'Password must contain uppercase, lowercase letters, and numbers',
      'Konfirmasi kata sandi tidak cocok': 'Passwords do not match',
      'Gagal membuat profil: Masalah dengan autentikasi': 'Failed to create profile: Authentication issue',

      // Authentication translations
      'Masuk': 'Sign In',
      'Email': 'Email',
      'Masukkan email': 'Enter your email',
      'Kata Sandi': 'Password',
      'Masukkan kata sandi': 'Enter your password',

      'Lupa Kata Sandi?': 'Forgot Password?',
      'Masuk': 'Sign In',
      'Belum memiliki akun?': 'Don\'t have an account?',
      'Buat Akun': 'Create Account',

      // Login translations
      'Masuk': 'Masuk',
      'Email': 'Email',
      'Masukkan email': 'Masukkan email',
      'Kata Sandi': 'Kata Sandi',
      'Masukkan kata sandi': 'Masukkan kata sandi',

      'Lupa Kata Sandi?': 'Lupa Kata Sandi?',
      'Belum memiliki akun?': 'Belum memiliki akun?',
      'Buat Akun': 'Buat Akun',

      // Detailed login translations
      'auth.login.title': 'Login',
      'auth.login.identifierLabel': 'Username / e-Mail / Phone Number',
      'auth.login.identifierPlaceholder': 'Enter username, or e-mail, or phone number',
      'auth.login.passwordLabel': 'Password',
      'auth.login.passwordPlaceholder': 'Enter your password',

      'auth.login.forgotPassword': 'Forgot Password?',
      'auth.login.loginButton': 'Login',
      'auth.login.noAccount': 'Don\'t have an account?',
      'auth.login.registerLink': 'Create Account',

      // Registration translations
      'auth.register.title': 'Create Account',
      'auth.register.username': 'Username',
      'auth.register.fullName': 'Full Name',
      'auth.register.email': 'Email Address',
      'auth.register.phoneNumber': 'Phone Number',
      'auth.register.selectLanguage': 'Select Language',
      'auth.register.password': 'Password',
      'auth.register.confirmPassword': 'Confirm Password',
      'auth.register.submit': 'Create Account',
      'auth.register.alreadyHaveAccount': 'Already have an account?',
      'auth.register.signIn': 'Sign In',
      'auth.register.verificationSent': 'Verification code sent to {{email}}',
      'auth.register.enterVerificationCode': 'Enter verification code',
      'auth.register.verifyEmail': 'Verify Email',
      'auth.register.resendCode': 'Resend Code',

      // Registration validation translations
      'auth.register.validation.usernameTooShort': 'Username must be at least 3 characters',
      'auth.register.validation.fullNameTooShort': 'Full name must be at least 3 characters',
      'auth.register.validation.invalidEmail': 'Please enter a valid email address',
      'auth.register.validation.invalidPhoneNumber': 'Phone number must start with 08 and be at least 10 digits',
      'auth.register.validation.passwordTooShort': 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
      'auth.register.validation.passwordComplexity': 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
      'auth.register.validation.passwordMismatch': 'Passwords do not match',
      'auth.register.validation.passwordRequirements': 'Password must be at least 8 characters long with uppercase, lowercase letters, numbers, and special characters',

      // Registration error translations
      'auth.register.error.clientInitFailed': 'Failed to initialize client. Please reload the page.',
      'auth.register.error.clientInitFailedDescription': 'There was a problem setting up the connection. Please check your network settings.',
      'auth.register.error.missingUrl': 'Invalid Supabase URL configuration.',
      'auth.register.error.userExists': 'User already exists',
      'auth.register.error.rateLimitExceeded': 'Too many attempts. Please try again later.',
      'auth.register.error.signupFailed': 'Signup failed. Please try again.',
      'auth.register.error.signupFailedDescription': 'An error occurred while signing up. Please check your information.',
      'auth.register.error.databaseError': 'Database error while creating user.',
      'auth.register.error.userCreationFailed': 'Failed to create user.',
      'auth.register.error.userCreationFailedDescription': 'The system was unable to create your account at this time. Please try again or contact support.',
      'auth.register.error.profileCreationFailed': 'Failed to create profile. Please contact support.',
      'auth.register.error.profileCreationFailedDescription': 'Unable to save your profile details. Please check your information.',
      'auth.register.error.networkError': 'Network error. Check your internet connection.',
      'auth.register.error.networkErrorDescription': 'Unable to connect to the server. Please ensure you have a stable internet connection.',
      'auth.register.error.unexpectedError': 'An unexpected error occurred. Please try again.',
      'auth.register.error.unexpectedErrorDescription': 'An unexpected error occurred. Please try again or contact the support team.',
      'auth.register.error.diagnosticsFailed': 'Supabase project diagnostics failed.',
      'auth.register.error.diagnosticsFailedDescription': 'There was a problem with the project configuration. Please contact the administrator.',
      'auth.register.error.renderError': 'Rendering Error',
      'auth.register.error.renderErrorDescription': 'Sorry, there was a problem loading the page. Please reload or contact support.',

      // Registration success translations
      'auth.register.success.title': 'Registration Successful',
      'auth.register.success.description': 'Your account has been created. Please verify your email.',

      // Reset Password translations
      'Atur Ulang Kata Sandi': 'Reset Password',
      'Masukkan email untuk mengatur ulang kata sandi': 'Enter your email to reset your password',
      'Email pengaturan ulang kata sandi telah dikirim. Silakan periksa kotak masuk Anda.': 'Password reset email sent. Please check your inbox.',
      'Kirim Tautan Atur Ulang': 'Send Reset Link',
      'Mengirim...': 'Sending...',
      'Kembali ke Masuk': 'Back to Sign In',

      // Error translations
      'Kesalahan saat mencari pengguna': 'Error looking up user',
      'Pengguna tidak ditemukan': 'User not found',

      // Login email verification translations
      'auth.login.emailVerification.title': 'Email Verification',
      'auth.login.emailVerification.otpLabel': 'Enter OTP Code',
      'auth.login.emailVerification.otpPlaceholder': 'Enter 6 digit code',
      'auth.login.emailVerification.verifyButton': 'Verify',
      'auth.login.emailVerification.resendOTP': 'Resend OTP',
      'auth.login.emailVerification.otpSent': 'Verification code sent to your email',
      'auth.login.emailVerification.otpResent': 'New verification code sent',
      'auth.login.emailVerification.verified': 'Email successfully verified',
      'auth.login.emailVerification.invalidOTP': 'Invalid or expired OTP code',
      'auth.login.emailVerification.resendCooldown': 'Please wait 1 minute before requesting a new code',

      // Login error translations
      'auth.login.error.profileNotFound': 'User profile not found',
      'auth.login.error.otpSendFailed': 'Failed to send verification code',
      'auth.login.error.unexpected': 'An unexpected error occurred',

      // Forget Password translations
      'auth.forgetPassword.title': 'Forgot Password',
      'auth.forgetPassword.emailLabel': 'Email',
      'auth.forgetPassword.emailPlaceholder': 'Enter your email',
      'auth.forgetPassword.resetButton': 'Send Reset Link',
      'auth.forgetPassword.backToLogin': 'Back to Login',
      
      'auth.forgetPassword.success.title': 'Reset Link Sent',
      'auth.forgetPassword.success.description': 'We have sent a password reset link to your email. Please check your inbox.',
      'auth.forgetPassword.success.backToLogin': 'Back to Login',
      
      'auth.forgetPassword.error.failed': 'Failed to Send Reset Link',
      'auth.forgetPassword.error.unexpected': 'An unexpected error occurred',
      
      auth: {
        resetPassword: {
          title: 'Reset Password',
          identifierLabel: 'Username / e-Mail / Phone Number',
          identifierPlaceholder: 'Enter username, or e-mail, or phone number',
          submitButton: 'Send Reset Link',
          backToLogin: 'Back to Login',
          forgotEmail: 'Forgot email address?',
          error: {
            failed: 'Failed to send password reset link',
            unexpected: 'An unexpected error occurred'
          },
          success: {
            sent: 'Password reset link has been sent to your email'
          }
        }
      }
    }
  },
  id: {
    translation: {
      auth: {
        login: {
          identifierLabel: 'Username / e-Mail / Nomor HP',
          identifierPlaceholder: 'Masukkan username, atau e-mail, atau nomor HP',
          // ... other existing translations
        }
      },
      common: {
        loading: 'Memuat...'
      },
      // Validation Error Messages
      'Nama pengguna harus diisi': 'Nama pengguna harus diisi',
      'Nama pengguna minimal 3 karakter': 'Nama pengguna minimal 3 karakter',
      'Nama lengkap harus diisi': 'Nama lengkap harus diisi',
      'Nama lengkap minimal 3 karakter': 'Nama lengkap minimal 3 karakter',
      'Email harus diisi': 'Email harus diisi',
      'Format email tidak valid': 'Format email tidak valid',
      'Nomor telepon harus diisi': 'Nomor telepon harus diisi',
      'Nomor telepon harus diawali 0 dan 10-13 digit': 'Nomor telepon harus diawali 0 dan 10-13 digit',
      'Kata sandi harus diisi': 'Kata sandi harus diisi',
      'Kata sandi minimal 6 karakter': 'Kata sandi minimal 6 karakter',
      'Kata sandi harus mengandung huruf besar, huruf kecil, dan angka': 'Kata sandi harus mengandung huruf besar, huruf kecil, dan angka',
      'Konfirmasi kata sandi tidak cocok': 'Konfirmasi kata sandi tidak cocok',
      'Gagal membuat profil: Masalah dengan autentikasi': 'Gagal membuat profil: Masalah dengan autentikasi',

      // Authentication translations
      'Masuk': 'Masuk',
      'Email': 'Email',
      'Masukkan email': 'Masukkan email',
      'Kata Sandi': 'Kata Sandi',
      'Masukkan kata sandi': 'Masukkan kata sandi',

      'Lupa Kata Sandi?': 'Lupa Kata Sandi?',
      'Masuk': 'Masuk',
      'Belum memiliki akun?': 'Belum memiliki akun?',
      'Buat Akun': 'Buat Akun',

      // Login translations
      'Masuk': 'Masuk',
      'Email': 'Email',
      'Masukkan email': 'Masukkan email',
      'Kata Sandi': 'Kata Sandi',
      'Masukkan kata sandi': 'Masukkan kata sandi',

      'Lupa Kata Sandi?': 'Lupa Kata Sandi?',
      'Belum memiliki akun?': 'Belum memiliki akun?',
      'Buat Akun': 'Buat Akun',

      // Detailed login translations
      'auth.login.title': 'Masuk',
      'auth.login.identifierLabel': 'Username / e-Mail / Nomor HP',
      'auth.login.identifierPlaceholder': 'Masukkan username, atau e-mail, atau nomor HP',
      'auth.login.passwordLabel': 'Kata Sandi',
      'auth.login.passwordPlaceholder': 'Masukkan kata sandi',

      'auth.login.forgotPassword': 'Lupa Kata Sandi?',
      'auth.login.loginButton': 'Masuk',
      'auth.login.noAccount': 'Belum memiliki akun?',
      'auth.login.registerLink': 'Buat Akun',

      // Registration translations
      'auth.register.title': 'Buat Akun',
      'auth.register.username': 'Username',
      'auth.register.fullName': 'Nama Lengkap',
      'auth.register.email': 'Alamat Email',
      'auth.register.phoneNumber': 'Nomor Telepon',
      'auth.register.selectLanguage': 'Pilih Bahasa',
      'auth.register.password': 'Kata Sandi',
      'auth.register.confirmPassword': 'Konfirmasi Kata Sandi',
      'auth.register.submit': 'Buat Akun',
      'auth.register.alreadyHaveAccount': 'Sudah memiliki akun?',
      'auth.register.signIn': 'Masuk',
      'auth.register.verificationSent': 'Kode verifikasi telah dikirim ke {{email}}',
      'auth.register.enterVerificationCode': 'Masukkan kode verifikasi',
      'auth.register.verifyEmail': 'Verifikasi Email',
      'auth.register.resendCode': 'Kirim Ulang Kode',

      // Registration validation translations
      'auth.register.validation.usernameTooShort': 'Username harus minimal 3 karakter',
      'auth.register.validation.fullNameTooShort': 'Nama lengkap harus minimal 3 karakter',
      'auth.register.validation.invalidEmail': 'Silakan masukkan alamat email yang valid',
      'auth.register.validation.invalidPhoneNumber': 'Nomor telepon harus diawali 08 dan minimal 10 digit',
      'auth.register.validation.passwordTooShort': 'Kata sandi harus minimal 8 karakter dengan huruf besar, huruf kecil, dan angka',
      'auth.register.validation.passwordComplexity': 'Kata sandi harus minimal 8 karakter dengan huruf besar, huruf kecil, dan angka',
      'auth.register.validation.passwordMismatch': 'Konfirmasi kata sandi tidak cocok',
      'auth.register.validation.passwordRequirements': 'Kata sandi harus minimal 8 karakter dengan huruf besar, huruf kecil, angka, dan karakter khusus',

      // Registration error translations
      'auth.register.error.clientInitFailed': 'Gagal menginisialisasi klien. Silakan muat ulang halaman.',
      'auth.register.error.clientInitFailedDescription': 'Terjadi masalah saat menyiapkan koneksi. Periksa pengaturan jaringan Anda.',
      'auth.register.error.missingUrl': 'Konfigurasi URL Supabase tidak valid.',
      'auth.register.error.userExists': 'Pengguna sudah terdaftar',
      'auth.register.error.rateLimitExceeded': 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
      'auth.register.error.signupFailed': 'Pendaftaran gagal. Silakan coba lagi.',
      'auth.register.error.signupFailedDescription': 'Terjadi kesalahan saat mendaftarkan pengguna. Periksa kembali informasi Anda.',
      'auth.register.error.databaseError': 'Kesalahan basis data saat membuat pengguna.',
      'auth.register.error.userCreationFailed': 'Gagal membuat pengguna.',
      'auth.register.error.userCreationFailedDescription': 'Sistem tidak dapat membuat akun Anda saat ini. Silakan coba lagi atau hubungi dukungan.',
      'auth.register.error.profileCreationFailed': 'Gagal membuat profil. Silakan hubungi dukungan.',
      'auth.register.error.profileCreationFailedDescription': 'Tidak dapat menyimpan detail profil Anda. Silakan periksa kembali informasi yang Anda masukkan.',
      'auth.register.error.networkError': 'Masalah jaringan. Periksa koneksi internet Anda.',
      'auth.register.error.networkErrorDescription': 'Tidak dapat terhubung ke server. Pastikan Anda memiliki koneksi internet yang stabil.',
      'auth.register.error.unexpectedError': 'Terjadi kesalahan tidak terduga. Silakan coba lagi.',
      'auth.register.error.unexpectedErrorDescription': 'Terjadi kesalahan yang tidak diharapkan. Silakan coba lagi atau hubungi tim dukungan.',
      'auth.register.error.diagnosticsFailed': 'Konfigurasi Supabase tidak valid.',
      'auth.register.error.diagnosticsFailedDescription': 'Terjadi masalah dengan konfigurasi proyek. Silakan hubungi administrator.',
      'auth.register.error.renderError': 'Terjadi Kesalahan Rendering',
      'auth.register.error.renderErrorDescription': 'Maaf, terjadi masalah saat memuat halaman. Silakan muat ulang atau hubungi dukungan.',

      // Registration success translations
      'auth.register.success.title': 'Pendaftaran Berhasil',
      'auth.register.success.description': 'Akun Anda telah dibuat. Silakan verifikasi email Anda.',

      // Reset Password translations
      'Atur Ulang Kata Sandi': 'Atur Ulang Kata Sandi',
      'Masukkan email untuk mengatur ulang kata sandi': 'Masukkan email untuk mengatur ulang kata sandi',
      'Email pengaturan ulang kata sandi telah dikirim. Silakan periksa kotak masuk Anda.': 'Email pengaturan ulang kata sandi telah dikirim. Silakan periksa kotak masuk Anda.',
      'Kirim Tautan Atur Ulang': 'Kirim Tautan Atur Ulang',
      'Mengirim...': 'Mengirim...',
      'Kembali ke Masuk': 'Kembali ke Masuk',

      // Error translations
      'Kesalahan saat mencari pengguna': 'Kesalahan saat mencari pengguna',
      'Pengguna tidak ditemukan': 'Pengguna tidak ditemukan',

      // Login email verification translations
      'auth.login.emailVerification.title': 'Verifikasi Email',
      'auth.login.emailVerification.otpLabel': 'Masukkan Kode OTP',
      'auth.login.emailVerification.otpPlaceholder': 'Masukkan 6 digit kode',
      'auth.login.emailVerification.verifyButton': 'Verifikasi',
      'auth.login.emailVerification.resendOTP': 'Kirim Ulang Kode',
      'auth.login.emailVerification.otpSent': 'Kode verifikasi telah dikirim ke email Anda',
      'auth.login.emailVerification.otpResent': 'Kode verifikasi telah dikirim ulang',
      'auth.login.emailVerification.verified': 'Email berhasil diverifikasi',
      'auth.login.emailVerification.invalidOTP': 'Kode OTP tidak valid atau sudah kadaluarsa',
      'auth.login.emailVerification.resendCooldown': 'Silakan tunggu 1 menit sebelum meminta kode baru',

      // Login error translations
      'auth.login.error.profileNotFound': 'Profil pengguna tidak ditemukan',
      'auth.login.error.otpSendFailed': 'Gagal mengirim kode verifikasi',
      'auth.login.error.unexpected': 'Terjadi kesalahan tidak terduga',

      // Forget Password translations
      'auth.forgetPassword.title': 'Lupa Kata Sandi',
      'auth.forgetPassword.emailLabel': 'Email',
      'auth.forgetPassword.emailPlaceholder': 'Masukkan email Anda',
      'auth.forgetPassword.resetButton': 'Kirim Tautan Reset',
      'auth.forgetPassword.backToLogin': 'Kembali ke Login',
      
      'auth.forgetPassword.success.title': 'Tautan Reset Terkirim',
      'auth.forgetPassword.success.description': 'Kami telah mengirimkan tautan reset kata sandi ke email Anda. Silakan periksa kotak masuk Anda.',
      'auth.forgetPassword.success.backToLogin': 'Kembali ke Login',
      
      'auth.forgetPassword.error.failed': 'Gagal Mengirim Tautan Reset',
      'auth.forgetPassword.error.unexpected': 'Terjadi kesalahan tidak terduga',
      
      auth: {
        resetPassword: {
          title: 'Atur Ulang Kata Sandi',
          identifierLabel: 'Username / e-Mail / Nomor HP',
          identifierPlaceholder: 'Masukkan username, atau e-mail, atau nomor HP',
          submitButton: 'Kirim Tautan Atur Ulang',
          backToLogin: 'Kembali ke Masuk',
          forgotEmail: 'Lupa alamat email?',
          error: {
            failed: 'Gagal mengirim tautan atur ulang kata sandi',
            unexpected: 'Terjadi kesalahan yang tidak terduga'
          },
          success: {
            sent: 'Tautan atur ulang kata sandi telah dikirim ke email Anda'
          }
        }
      }
    }
  }
};

// Get initial language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('language') || 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;