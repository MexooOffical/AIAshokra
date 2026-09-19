import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import {
  saveStoredAuthSession,
  registerStoredUser,
  authenticateStoredUser,
  saveStoredUserProfile,
} from '../../lib/storage';

interface AuthPageProps {
  onAuthSuccess: (session: {
    email: string;
    name?: string;
    phone?: string;
    provider?: 'google' | 'email';
  }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('fitforlifevitthal@gmail.com');
  const [password, setPassword] = useState('ashokra123');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup' && password.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      const displayName =
        normalizedEmail.split('@')[0].charAt(0).toUpperCase() +
        normalizedEmail.split('@')[0].slice(1) || 'User';

      if (mode === 'signup') {
        // Register locally in localStorage
        const account = registerStoredUser({
          email: normalizedEmail,
          password,
          name: displayName,
          phone: phone.trim(),
          provider: 'email',
        });

        const session = {
          isLoggedIn: true,
          email: account.email,
          name: account.name,
          phone: account.phone || '',
          provider: 'email' as const,
        };

        saveStoredAuthSession(session);
        saveStoredUserProfile({
          name: account.name,
          avatarLetter: account.name.charAt(0).toUpperCase(),
        });

        setIsLoading(false);
        onAuthSuccess(session);
      } else {
        // Login with localStorage
        const authResult = authenticateStoredUser(normalizedEmail, password);

        if (!authResult.success) {
          setIsLoading(false);
          setErrorMessage(authResult.error || 'Invalid credentials. Please try again.');
          return;
        }

        const account = authResult.account!;
        const session = {
          isLoggedIn: true,
          email: account.email,
          name: account.name,
          phone: account.phone || '',
          provider: 'email' as const,
        };

        saveStoredAuthSession(session);
        saveStoredUserProfile({
          name: account.name,
          avatarLetter: account.name.charAt(0).toUpperCase(),
        });

        setIsLoading(false);
        onAuthSuccess(session);
      }
    }, 350);
  };

  const handleGoogleSignIn = () => {
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      const defaultEmail = email.trim() || 'fitforlifevitthal@gmail.com';
      const displayName =
        defaultEmail.split('@')[0].charAt(0).toUpperCase() +
        defaultEmail.split('@')[0].slice(1) || 'Vitthal';

      const account = registerStoredUser({
        email: defaultEmail,
        name: displayName,
        phone: phone.trim(),
        provider: 'google',
      });

      const session = {
        isLoggedIn: true,
        email: account.email,
        name: account.name,
        phone: account.phone || '',
        provider: 'google' as const,
      };

      saveStoredAuthSession(session);
      saveStoredUserProfile({
        name: account.name,
        avatarLetter: account.name.charAt(0).toUpperCase(),
      });

      setIsLoading(false);
      onAuthSuccess(session);
    }, 350);
  };

  return (
    <div className="min-h-screen w-full bg-[#fdfdfe] sm:bg-[#fafbfc] flex flex-col justify-center items-center py-10 sm:py-14 px-4 sm:px-6 relative select-none">
      {/* Main Center Auth Container */}
      <div className="w-full max-w-[480px] my-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        {/* Colorful AI Ashokra Spiral Logo */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <img
            src="/assets/ai-ashokra-logo.png"
            alt="AI Ashokra Logo"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-xs"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.fallback-logo')) {
                const fallback = document.createElement('div');
                fallback.className =
                  'fallback-logo w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl shadow-md';
                fallback.innerText = 'A';
                parent.appendChild(fallback);
              }
            }}
          />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-[35px] font-bold text-[#0c1424] text-center tracking-tight leading-tight mb-2">
          Welcome to AI Ashokra
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-[15px] text-neutral-500 text-center mb-7 sm:mb-8 font-normal">
          {mode === 'login'
            ? 'Choose how you would like to sign in'
            : 'Create your local storage account'}
        </p>

        {/* Continue with Google Button */}
        <button
          type="button"
          id="auth-google-btn"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-[#1c1f26] hover:bg-[#111317] active:scale-[0.99] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer mb-7"
        >
          {/* Google G Logo */}
          <span className="w-5 h-5 flex items-center justify-center font-bold text-blue-400 text-base leading-none">
            G
          </span>
          <span>Continue with Google</span>
        </button>

        {/* Divider: OR CONTINUE WITH YOUR EMAIL */}
        <div className="relative flex py-2 items-center w-full mb-6 sm:mb-7">
          <div className="flex-grow border-t border-neutral-200/90" />
          <span className="flex-shrink mx-4 text-[10px] sm:text-[11px] font-semibold tracking-wider text-neutral-400 uppercase select-none">
            OR CONTINUE WITH YOUR EMAIL
          </span>
          <div className="flex-grow border-t border-neutral-200/90" />
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="w-full mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          {/* Email Address */}
          <div className="mb-4">
            <label
              htmlFor="auth-email-input"
              className="block text-xs sm:text-[13.5px] font-semibold text-neutral-900 mb-2"
            >
              Email Address
            </label>
            <input
              id="auth-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="name@example.com"
              className="w-full px-5 py-3.5 sm:py-4 rounded-2xl bg-[#edf3ff] border-2 border-transparent focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 text-[15px] sm:text-base text-neutral-900 placeholder:text-neutral-400 transition-all"
            />
          </div>

          {/* Password */}
          <div className={mode === 'signup' ? 'mb-4' : 'mb-6'}>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="auth-password-input"
                className="block text-xs sm:text-[13.5px] font-semibold text-neutral-900"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-neutral-500 hover:text-neutral-800 inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                id="auth-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter your password"
                className="w-full px-5 py-3.5 sm:py-4 rounded-2xl bg-[#edf3ff] border-2 border-transparent focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 text-[15px] sm:text-base text-neutral-900 placeholder:text-neutral-400 transition-all"
              />
            </div>
          </div>

          {/* Phone Number Field (Only present in Sign Up mode) */}
          {mode === 'signup' && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-150">
              <label
                htmlFor="auth-phone-input"
                className="block text-xs sm:text-[13.5px] font-semibold text-neutral-900 mb-2"
              >
                Phone Number (Optional)
              </label>
              <input
                id="auth-phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-5 py-3.5 sm:py-4 rounded-2xl bg-white border border-neutral-200 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 text-[15px] sm:text-base text-neutral-900 placeholder:text-neutral-400 transition-all"
              />
            </div>
          )}

          {/* Submit Action Button */}
          {mode === 'login' ? (
            <button
              type="submit"
              id="auth-login-submit-btn"
              disabled={isLoading || !email.trim() || !password}
              className="w-full py-4 px-6 rounded-full bg-[#1c1f26] hover:bg-black active:scale-[0.99] text-white font-semibold text-sm sm:text-base transition-all shadow-xs cursor-pointer mb-5 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Log in'}
            </button>
          ) : (
            <button
              type="submit"
              id="auth-signup-submit-btn"
              disabled={isLoading || !email.trim() || !password}
              className={`w-full py-4 px-6 rounded-full font-semibold text-sm sm:text-base transition-all shadow-xs cursor-pointer mb-5 active:scale-[0.99] ${
                email.trim() && password
                  ? 'bg-[#1c1f26] hover:bg-black text-white'
                  : 'bg-[#d7dce5] hover:bg-[#cbd2dc] text-[#8c96a6]'
              }`}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          )}

          {/* Switch Mode Link */}
          <div className="flex justify-center mb-8">
            {mode === 'login' ? (
              <button
                type="button"
                id="switch-to-signup-btn"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage('');
                }}
                className="text-xs sm:text-[13.5px] text-neutral-700 hover:text-neutral-950 underline underline-offset-4 font-medium cursor-pointer transition-colors"
              >
                Create a new account
              </button>
            ) : (
              <button
                type="button"
                id="switch-to-login-btn"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className="text-xs sm:text-[13.5px] text-neutral-700 hover:text-neutral-950 underline underline-offset-4 font-medium cursor-pointer transition-colors"
              >
                Already have an account? Log in
              </button>
            )}
          </div>
        </form>

        {/* Footer Terms & Policy */}
        <p className="text-xs sm:text-[13px] text-neutral-500 text-center leading-relaxed max-w-sm">
          By continuing, you agree to our{' '}
          <a
            href="#terms"
            onClick={(e) => e.preventDefault()}
            className="underline underline-offset-2 hover:text-neutral-800"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="#privacy"
            onClick={(e) => e.preventDefault()}
            className="underline underline-offset-2 hover:text-neutral-800"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>

      {/* Bottom Subtle copyright spacer */}
      <div className="h-4 shrink-0" />
    </div>
  );
};
