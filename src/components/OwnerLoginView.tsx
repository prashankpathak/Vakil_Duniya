import React, { useState } from 'react';
import { useNavigationStore } from '../store';
import { ShieldCheck, ArrowLeft, Mail, Lock, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { loginWithGoogle } from '../firebase';

export function OwnerLoginView() {
  const { navigate, setUser } = useNavigationStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail !== 'prashankpathak@gmail.com') {
      setErrorMsg('Access Denied: Unauthorized administrative access.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('vd_admin_auth', JSON.stringify({ email: trimmedEmail, timestamp: Date.now() }));
        navigate('owner-dashboard');
      } else {
        setErrorMsg(data.error || 'Invalid administrator credentials.');
      }
    } catch (err: any) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAdminLogin = async () => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const { user } = await loginWithGoogle();
      if (user.email?.toLowerCase() === 'prashankpathak@gmail.com') {
        setUser(user);
        localStorage.setItem('vd_admin_auth', JSON.stringify({ email: user.email, timestamp: Date.now() }));
        navigate('owner-dashboard');
      } else {
        setErrorMsg('Access Denied: This account is not registered as Platform Administrator.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 relative z-10 w-full flex flex-col justify-center min-h-[75vh]">
      <button 
        onClick={() => navigate('home')}
        className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white mb-8 group transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4 mr-2 text-[#c5a059] group-hover:text-white transition-colors" /> Back to Platform
      </button>

      <div className="bg-[#111] border border-[#c5a059]/30 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent"></div>

        <div className="w-14 h-14 bg-[#0a0a0a] rounded-2xl mx-auto mb-5 flex items-center justify-center border border-[#c5a059]/40 text-[#c5a059] shadow-lg">
           <ShieldCheck className="w-7 h-7" />
        </div>
        
        <h2 className="text-2xl font-serif text-white text-center">Admin Portal Login</h2>
        <p className="text-xs text-gray-400 font-sans text-center mt-1 mb-6">
          Authorized administrative access only.
        </p>

        {/* Google One-Click Admin Sign-In */}
        <button
          type="button"
          onClick={handleGoogleAdminLogin}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-white/15 hover:border-[#c5a059]/50 text-white font-sans text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all mb-6 disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {googleLoading ? 'Verifying Admin Account...' : 'Continue with Google as Admin'}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">or enter credentials</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-mono mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#c5a059]" /> Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Admin Email"
              className="block w-full font-mono text-sm bg-[#050505] border border-white/10 py-3 px-3.5 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-mono mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#c5a059]" /> Admin Password
            </label>
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full text-sm font-sans bg-[#050505] border border-white/10 py-3 px-3.5 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-colors"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-[#c5a059] text-black px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded-lg disabled:opacity-50 mt-2 shadow-lg shadow-[#c5a059]/10"
          >
            {loading ? 'Authenticating Admin...' : 'Open Admin Portal'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <p className="text-[11px] text-gray-500">
            Vakil Duniya Internal Administration
          </p>
        </div>
      </div>
    </div>
  );
}
