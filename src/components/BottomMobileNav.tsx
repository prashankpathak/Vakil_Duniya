import { Home, Scale, Users, CalendarCheck, LogIn } from 'lucide-react';
import { useNavigationStore } from '../store';

export function BottomMobileNav() {
  const { currentPage, navigate, user, openAuthModal } = useNavigationStore();

  const handleOpenAiChat = () => {
    const chatBtn = document.getElementById('nyaya-sakha-open-btn');
    if (chatBtn) {
      chatBtn.click();
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
      {/* Home */}
      <button
        onClick={() => navigate('home')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
          currentPage === 'home'
            ? 'text-[#c5a059]'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-medium tracking-tight">Home</span>
      </button>

      {/* Services */}
      <button
        onClick={() => navigate('services')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
          currentPage === 'services'
            ? 'text-[#c5a059]'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Scale className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-medium tracking-tight">Services</span>
      </button>

      {/* Nyaya Sakha AI - Center Highlight */}
      <button
        onClick={handleOpenAiChat}
        className="flex flex-col items-center justify-center -mt-4 group cursor-pointer"
        aria-label="Open AI Assistant"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1b1710] to-[#c5a059] border-2 border-black flex items-center justify-center shadow-lg group-active:scale-95 transition-transform text-black">
          <span className="text-xl">⚖️</span>
        </div>
        <span className="text-[9px] font-bold text-[#c5a059] mt-0.5 tracking-tight">AI सहायक</span>
      </button>

      {/* Find Lawyers */}
      <button
        onClick={() => navigate('lawyers')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
          currentPage === 'lawyers'
            ? 'text-[#c5a059]'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-medium tracking-tight">Lawyers</span>
      </button>

      {/* Consultations or Login */}
      <button
        onClick={() => {
          if (user) {
            navigate('my-bookings');
          } else {
            openAuthModal('login', 'Sign in to access your consultations and appointments.');
          }
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
          currentPage === 'my-bookings'
            ? 'text-[#c5a059]'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        {user ? (
          <>
            <CalendarCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Bookings</span>
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Login</span>
          </>
        )}
      </button>
    </div>
  );
}
