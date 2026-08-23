import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Home, 
  Scale, 
  Users, 
  CalendarCheck, 
  LogIn, 
  LogOut, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Bot,
  Sparkles,
  ChevronRight,
  User as UserIcon,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { useNavigationStore } from '../store';

export function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    currentPage, 
    navigate, 
    user, 
    userProfile, 
    openAuthModal, 
    logout 
  } = useNavigationStore();

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Client';

  const closeMenu = () => setIsOpen(false);

  const handleNav = (page: any) => {
    navigate(page);
    closeMenu();
  };

  const handleOpenAi = () => {
    closeMenu();
    setTimeout(() => {
      const chatBtn = document.getElementById('nyaya-sakha-open-btn');
      if (chatBtn) chatBtn.click();
    }, 100);
  };

  const handleAuth = (mode: 'login' | 'signup') => {
    closeMenu();
    openAuthModal(mode);
  };

  const handleLogout = async () => {
    await logout();
    closeMenu();
  };

  return (
    <>
      {/* Floating Action Moveable Trigger Button */}
      {!isOpen && (
        <motion.div
          id="floating-menu-trigger-container"
          drag
          dragMomentum={false}
          dragElastic={0.15}
          whileDrag={{ scale: 1.12, cursor: 'grabbing' }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-50 flex items-center touch-none cursor-grab active:cursor-grabbing select-none"
        >
          <motion.button
            id="floating-menu-open-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(true)}
            className="relative bg-gradient-to-tr from-[#161616] via-[#222222] to-[#2a2a2a] text-[#c5a059] border-2 border-[#c5a059]/60 hover:border-[#c5a059] p-3.5 sm:p-4 rounded-full shadow-[0_0_25px_rgba(197,160,89,0.25)] hover:shadow-[0_0_35px_rgba(197,160,89,0.45)] flex items-center justify-center cursor-pointer transition-all"
            title="Menu & Login (Drag to move)"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none text-[#c5a059]" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#c5a059] border-2 border-[#050505] rounded-full flex items-center justify-center pointer-events-none">
              <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Main Menu Modal Sheet & Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - Click outside to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[3px] cursor-pointer"
              title="Click outside to close menu"
            />

            {/* Menu Container Card */}
            <motion.div
              id="floating-menu-box"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed z-50 bottom-0 left-0 right-0 sm:left-6 sm:right-auto sm:bottom-6 w-full sm:w-[400px] max-h-[88vh] bg-[#0c0c0c] border border-white/15 sm:rounded-2xl rounded-t-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-[#141414] border-b border-white/10 px-4 py-3.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-sm bg-[#c5a059] flex items-center justify-center rotate-45 shrink-0">
                    <span className="text-black font-bold -rotate-45 text-sm">V</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-white font-bold text-base leading-tight">
                      Vakil Duniya<span className="text-[#c5a059]">.</span>
                    </h3>
                    <p className="text-[9px] uppercase tracking-wider text-gray-400">Quick Access & Services</p>
                  </div>
                </div>

                <button
                  onClick={closeMenu}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
                {/* 1. User Profile or Quick Login Card */}
                <div className="bg-gradient-to-br from-[#181510] to-[#121212] border border-[#c5a059]/40 rounded-xl p-3.5">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#c5a059] text-black font-bold text-sm flex items-center justify-center shadow">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white leading-tight truncate max-w-[170px]">{displayName}</p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[170px]">{user.email}</p>
                          </div>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30 font-semibold uppercase tracking-wider">
                          Active
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                        <button
                          onClick={() => handleNav('my-bookings')}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#c5a059]/15 hover:bg-[#c5a059]/25 border border-[#c5a059]/30 text-[#c5a059] rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" /> My Bookings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-[#c5a059]" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">Account Access</span>
                        </div>
                        <span className="text-[9px] text-gray-400">Guest Client (अतिथि)</span>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-relaxed">
                        लॉगिन करके अपनी वकील सलाह, केस डिटेल्स और अपॉइंटमेंट्स आसानी से ट्रैक करें।
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleAuth('login')}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#c5a059] hover:brightness-110 text-black rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        >
                          <LogIn className="w-3.5 h-3.5" /> Login (लॉगिन)
                        </button>
                        <button
                          onClick={() => handleAuth('signup')}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-[#c5a059]/60 hover:bg-[#c5a059]/15 text-[#c5a059] rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Sign Up (रजिस्टर)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Core Navigation Links */}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-1 mb-1.5">
                    Navigation Menu (मुख्य विकल्प)
                  </p>

                  {/* Home */}
                  <button
                    onClick={() => handleNav('home')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      currentPage === 'home'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-[#c5a059]'
                        : 'bg-[#141414] hover:bg-[#1a1a1a] border-white/5 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Home className="w-4 h-4 text-[#c5a059]" />
                      <div className="text-left">
                        <div className="text-xs font-semibold">Home (होम)</div>
                        <div className="text-[10px] text-gray-400">मुख्य पृष्ठ व जानकारी</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Find Lawyers */}
                  <button
                    onClick={() => handleNav('lawyers')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      currentPage === 'lawyers'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-[#c5a059]'
                        : 'bg-[#141414] hover:bg-[#1a1a1a] border-white/5 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-[#c5a059]" />
                      <div className="text-left">
                        <div className="text-xs font-semibold">Find Lawyers (वकील खोजें)</div>
                        <div className="text-[10px] text-gray-400">1,200+ सत्यापित अधिवक्ता</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Legal Services */}
                  <button
                    onClick={() => handleNav('services')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      currentPage === 'services'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-[#c5a059]'
                        : 'bg-[#141414] hover:bg-[#1a1a1a] border-white/5 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Scale className="w-4 h-4 text-[#c5a059]" />
                      <div className="text-left">
                        <div className="text-xs font-semibold">Legal Services (कानूनी सेवाएं)</div>
                        <div className="text-[10px] text-gray-400">सिविल, क्रिमिनल, पारिवारिक, आदि</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Nyaya Sakha AI */}
                  <button
                    onClick={handleOpenAi}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#c5a059]/40 bg-gradient-to-r from-[#1c1810] to-[#141414] hover:border-[#c5a059] text-white transition-all cursor-pointer shadow-md group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#c5a059] text-black flex items-center justify-center text-xs">
                        ⚖️
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-[#c5a059] flex items-center gap-1.5">
                          <span>न्याय सखा AI (Nyaya Sakha)</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        </div>
                        <div className="text-[10px] text-gray-400">24x7 निःशुल्क कानूनी सहायता</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#c5a059] font-semibold group-hover:translate-x-0.5 transition-transform">
                      Open →
                    </span>
                  </button>

                  {/* Lawyer Portal */}
                  <button
                    onClick={() => handleNav('lawyer-portal')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      currentPage === 'lawyer-portal' || currentPage === 'admin'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-[#c5a059]'
                        : 'bg-[#141414] hover:bg-[#1a1a1a] border-white/5 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-[#c5a059]" />
                      <div className="text-left">
                        <div className="text-xs font-semibold">Advocate Portal (वकील साथी पोर्टल)</div>
                        <div className="text-[10px] text-gray-400">वकील लॉगिन व रजिस्ट्रेशन</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* 3. Direct Contact & Support */}
                <div className="bg-[#111] border border-white/5 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Direct Helpline (मदद)</span>
                    <span className="text-[9px] text-[#c5a059]">24x7 Support</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <a
                      href="tel:6263364561"
                      className="flex items-center gap-1.5 p-2 rounded-lg bg-black/40 hover:bg-black/80 border border-white/5 text-gray-300 hover:text-[#c5a059] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span className="font-mono text-[11px]">6263364561</span>
                    </a>
                    <a
                      href="mailto:vakilduniya.in@gmail.com"
                      className="flex items-center gap-1.5 p-2 rounded-lg bg-black/40 hover:bg-black/80 border border-white/5 text-gray-300 hover:text-[#c5a059] transition-colors truncate"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span className="text-[11px] truncate">Email Help</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Footer Bar */}
              <div className="bg-[#101010] border-t border-white/5 px-4 py-2 flex items-center justify-between text-[10px] text-gray-500">
                <span>Vakil Duniya • By Prashank Pathak</span>
                <button
                  onClick={() => handleNav('owner-login')}
                  className="hover:text-gray-400 cursor-pointer"
                >
                  Admin
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
