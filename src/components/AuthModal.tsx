import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigationStore } from '../store';
import { registerWithEmail, loginWithEmail, loginWithGoogle, sendUserPasswordReset } from '../firebase';

export function AuthModal() {
  const { 
    isAuthModalOpen, 
    authModalMode, 
    authModalMessage, 
    closeAuthModal, 
    openAuthModal, 
    setUser 
  } = useNavigationStore();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(authModalMode || 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync mode if changed by store
  if (isAuthModalOpen && mode !== authModalMode && (authModalMode === 'login' || authModalMode === 'signup' || authModalMode === 'forgot')) {
    setMode(authModalMode);
  }

  const handleClose = () => {
    setError(null);
    setResetSent(false);
    closeAuthModal();
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { user, profile } = await loginWithGoogle();
      setUser(user, profile);
      handleClose();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user') || err?.code === 'auth/cancelled-popup-request') {
        console.log("Google sign-in popup closed by user.");
        setError("Sign-in popup was closed. Click Google Sign In to continue.");
      } else {
        console.error("Google sign in error:", err);
        setError(err?.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSent(false);

    if (mode === 'forgot') {
      if (!email) {
        setError("Please enter your email address.");
        return;
      }
      setLoading(true);
      try {
        await sendUserPasswordReset(email);
        setResetSent(true);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          setError("No account found with this email address.");
        } else {
          setError(err.message || "Failed to send password reset email.");
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setLoading(true);
      try {
        const { user, profile } = await registerWithEmail(email, password, name, phone);
        setUser(user, profile);
        handleClose();
      } catch (err: any) {
        console.error("Signup error:", err);
        if (err.code === 'auth/email-already-in-use') {
          setError("An account already exists with this email. Please sign in instead.");
        } else if (err.code === 'auth/invalid-email') {
          setError("Please enter a valid email address.");
        } else if (err.code === 'auth/weak-password') {
          setError("Password is too weak. Choose at least 6 characters.");
        } else {
          setError(err.message || "Registration failed. Please try again.");
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'login') {
      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }
      setLoading(true);
      try {
        const { user, profile } = await loginWithEmail(email, password);
        setUser(user, profile);
        handleClose();
      } catch (err: any) {
        console.error("Login error:", err);
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          setError("Invalid email or password. Please check your credentials.");
        } else if (err.code === 'auth/too-many-requests') {
          setError("Too many failed attempts. Please try again later or reset password.");
        } else {
          setError(err.message || "Failed to sign in. Please verify your credentials.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#0a0a0a] border border-[#c5a059]/30 rounded-2xl shadow-2xl overflow-hidden z-10 my-auto"
        >
          {/* Top Gold Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#9a7b38] via-[#c5a059] to-[#f4d38c]"></div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8">
            {/* Header / Logo */}
            <div className="text-center mb-6">
              <div className="w-10 h-10 bg-[#c5a059] rounded-sm flex items-center justify-center rotate-45 mx-auto mb-3">
                <span className="text-black font-bold -rotate-45 text-lg">V</span>
              </div>
              <h3 className="text-2xl font-serif font-semibold text-white tracking-tight">
                {mode === 'signup' && 'Create Your Account'}
                {mode === 'login' && 'Welcome Back'}
                {mode === 'forgot' && 'Reset Password'}
              </h3>
              <p className="text-xs text-gray-400 mt-1 font-light">
                {authModalMessage || (
                  mode === 'signup' 
                    ? 'Register to book lawyer consultations and track case appointments.'
                    : mode === 'login'
                    ? 'Sign in to access your appointments and legal consultations.'
                    : 'Enter your registered email to receive a recovery link.'
                )}
              </p>
            </div>

            {/* Google Sign In Button */}
            {mode !== 'forgot' && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-[#161616] hover:bg-[#202020] text-white border border-white/10 hover:border-white/20 py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center my-5">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="px-3 text-[10px] uppercase tracking-widest text-gray-500 font-medium">Or continue with Email</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Reset Sent Message */}
            {resetSent && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400 text-xs">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Password reset link sent to your email. Please check your inbox.</span>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      Mobile Number (For Appointment Updates)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        maxLength={10}
                        className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-colors font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-colors"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError(null);
                        }}
                        className="text-[10px] text-[#c5a059] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-colors"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c5a059] text-black font-bold uppercase tracking-widest text-xs py-3 px-4 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-black border-r-transparent"></span>
                ) : (
                  <>
                    <span>
                      {mode === 'signup' && 'Sign Up & Continue'}
                      {mode === 'login' && 'Sign In'}
                      {mode === 'forgot' && 'Send Reset Link'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Mode Switch Footer */}
            <div className="mt-6 pt-4 border-t border-white/5 text-center text-xs text-gray-400">
              {mode === 'signup' && (
                <p>
                  Already have a client account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-[#c5a059] font-semibold hover:underline ml-1 cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}

              {mode === 'login' && (
                <p>
                  Don't have a client account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className="text-[#c5a059] font-semibold hover:underline ml-1 cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              )}

              {mode === 'forgot' && (
                <p>
                  Remembered your credentials?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setResetSent(false);
                    }}
                    className="text-[#c5a059] font-semibold hover:underline ml-1 cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </p>
              )}
            </div>

            {/* Separate Advocate Portal Bridge */}
            <div className="mt-5 p-3.5 bg-[#141414] border border-[#c5a059]/30 rounded-xl flex items-center justify-between gap-3">
              <div className="text-left">
                <p className="text-[11px] font-bold text-[#c5a059] uppercase tracking-wider">Are you a practicing Advocate?</p>
                <p className="text-[10px] text-gray-400">Lawyer login and Bar Council registration portal</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  useNavigationStore.getState().navigate('lawyer-portal');
                }}
                className="px-3 py-1.5 bg-[#c5a059]/20 hover:bg-[#c5a059] text-[#c5a059] hover:text-black border border-[#c5a059]/40 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap cursor-pointer"
              >
                Advocate Portal
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
