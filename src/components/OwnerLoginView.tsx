import { useState } from 'react';
import { useNavigationStore } from '../store';
import { Lock, ArrowLeft } from 'lucide-react';

export function OwnerLoginView() {
  const { navigate } = useNavigationStore();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });

      if (res.ok) {
        navigate('owner-dashboard');
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 relative z-10 w-full flex flex-col justify-center min-h-[60vh]">
      <button 
        onClick={() => navigate('home')}
        className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white mb-8 group transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4 mr-2 text-[#c5a059] group-hover:text-white transition-colors" /> Back to Home
      </button>

      <div className="bg-[#111] border border-white/5 rounded-xl shadow-sm p-8 text-center">
        <div className="w-12 h-12 bg-[#050505] rounded-full mx-auto mb-6 flex items-center justify-center border border-white/10">
           <Lock className="w-5 h-5 text-[#c5a059]" />
        </div>
        <h2 className="text-2xl font-serif text-white mb-2">Owner Login</h2>
        <p className="text-xs text-gray-400 font-sans mb-8">Access restricted to platform administrator.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              placeholder="Enter Access Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="block w-full text-center tracking-[0.3em] font-mono bg-[#050505] border border-white/10 py-4 px-4 rounded text-white shadow-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-colors"
              required
            />
          </div>
          {error && <p className="text-red-400 text-xs">Invalid passcode.</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c5a059] text-black px-6 py-4 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
