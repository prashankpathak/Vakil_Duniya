import { Menu, X, User as UserIcon, LogOut, CalendarCheck, LogIn, Scale } from 'lucide-react';
import { useState } from 'react';
import { useNavigationStore } from '../store';
import { AnimatePresence, motion } from 'motion/react';
import { LanguageSelector } from './LanguageSelector';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const { currentPage, navigate, user, userProfile, openAuthModal, logout } = useNavigationStore();

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'lawyers', label: 'Find Lawyers' },
    { id: 'services', label: 'Services' },
  ] as const;

  const handleLogout = async () => {
    setUserDropdown(false);
    await logout();
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Client';

  return (
    <header className="h-16 sm:h-20 px-3 sm:px-6 lg:px-12 flex flex-col justify-center border-b border-white/10 z-50 bg-black shrink-0 sticky top-0">
      <div className="flex items-center justify-between bg-black">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => navigate('home')}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#c5a059] rounded-sm flex items-center justify-center rotate-45 shrink-0">
            <span className="text-black font-bold -rotate-45 text-base sm:text-xl">V</span>
          </div>
          <div className="flex flex-col ml-1">
            <span className="text-lg sm:text-2xl font-serif tracking-tight font-semibold text-white leading-none">
              Vakil Duniya<span className="text-[#c5a059]">.</span>
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.12em] sm:tracking-[0.15em] text-gray-500 mt-0.5 sm:mt-1.5 font-sans">
              By Prashank Pathak (SAMRAAT)
            </span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-6 xl:gap-8 text-xs xl:text-sm font-medium uppercase tracking-wider xl:tracking-widest text-gray-400 items-center">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => navigate(link.id)}
              className={`${
                currentPage === link.id
                  ? 'text-[#c5a059]'
                  : 'hover:text-white'
              } transition-colors cursor-pointer`}
            >
              {link.label}
            </button>
          ))}

          {user && (
            <button
              onClick={() => navigate('my-bookings')}
              className={`${
                currentPage === 'my-bookings'
                  ? 'text-[#c5a059]'
                  : 'hover:text-white'
              } transition-colors flex items-center gap-1.5 cursor-pointer`}
            >
              <CalendarCheck className="w-4 h-4 text-[#c5a059]" /> My Consultations
            </button>
          )}

          <div className="flex items-center gap-2 xl:gap-3">
            <LanguageSelector />
            
            {/* User Auth or Profile Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 bg-[#141414] hover:bg-[#1f1f1f] border border-[#c5a059]/40 text-white px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#c5a059] text-black flex items-center justify-center font-bold text-[10px]">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] xl:max-w-[130px] truncate">{displayName}</span>
                </button>

                <AnimatePresence>
                  {userDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-2 w-56 bg-[#0e0e0e] border border-[#c5a059]/30 rounded-xl shadow-2xl py-2 z-50 text-left"
                    >
                      <div className="px-4 py-2 border-b border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs text-white font-medium truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setUserDropdown(false);
                          navigate('my-bookings');
                        }}
                        className="w-full px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors uppercase tracking-wider"
                      >
                        <CalendarCheck className="w-4 h-4 text-[#c5a059]" /> My Consultations
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdown(false);
                          navigate('lawyer-portal');
                        }}
                        className="w-full px-4 py-2.5 text-xs text-[#c5a059] hover:bg-[#c5a059]/10 flex items-center gap-2 transition-colors uppercase tracking-wider font-semibold"
                      >
                        <Scale className="w-4 h-4 text-[#c5a059]" /> Advocate Portal
                      </button>

                      {user.email?.toLowerCase() === 'prashankpathak@gmail.com' && (
                        <button
                          onClick={() => {
                            setUserDropdown(false);
                            navigate('owner-dashboard');
                          }}
                          className="w-full px-4 py-2.5 text-xs text-[#c5a059] hover:bg-[#c5a059]/10 flex items-center gap-2 transition-colors uppercase tracking-wider font-semibold"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span> Admin Portal
                        </button>
                      )}

                      <div className="border-t border-white/5 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors uppercase tracking-wider"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('signup', 'Create an account to book and manage consultations.')}
                className="px-3.5 py-1.5 xl:px-4 xl:py-2 bg-[#c5a059] text-black text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all rounded whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
            )}

            <button
               onClick={() => {
                 const chatBtn = document.getElementById('nyaya-sakha-open-btn');
                 if (chatBtn) chatBtn.click();
               }}
               className="px-3 py-1.5 bg-[#c5a059]/15 hover:bg-[#c5a059]/30 border border-[#c5a059]/50 text-[#c5a059] text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap rounded flex items-center gap-1.5 cursor-pointer"
               title="Open Nyaya Sakha AI Assistant"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span>AI सहायक</span>
            </button>

            <button
               onClick={() => navigate('lawyer-portal')}
               className="px-3 py-1.5 xl:px-4 xl:py-2 border border-[#c5a059]/40 text-[#c5a059] text-xs font-bold uppercase tracking-wider hover:bg-[#c5a059] hover:text-black transition-all whitespace-nowrap rounded flex items-center gap-1.5 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" /> Lawyer Portal
            </button>
          </div>
        </nav>

        {/* Mobile menu trigger and quick actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:hidden">
          <LanguageSelector />

          {/* Quick Mobile Login / User Profile Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-1.5 bg-[#141414] hover:bg-[#1f1f1f] border border-[#c5a059]/40 text-white px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                title={displayName}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#c5a059] text-black flex items-center justify-center font-bold text-[9px] sm:text-[10px]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[65px] sm:max-w-[90px] truncate text-[11px] sm:text-xs">{displayName}</span>
              </button>

              <AnimatePresence>
                {userDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-56 bg-[#0e0e0e] border border-[#c5a059]/30 rounded-xl shadow-2xl py-2 z-50 text-left"
                  >
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs text-white font-medium truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        navigate('my-bookings');
                      }}
                      className="w-full px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors uppercase tracking-wider"
                    >
                      <CalendarCheck className="w-4 h-4 text-[#c5a059]" /> My Consultations
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        navigate('lawyer-portal');
                      }}
                      className="w-full px-4 py-2.5 text-xs text-[#c5a059] hover:bg-[#c5a059]/10 flex items-center gap-2 transition-colors uppercase tracking-wider font-semibold"
                    >
                      <Scale className="w-4 h-4 text-[#c5a059]" /> Advocate Portal
                    </button>

                    {user.email?.toLowerCase() === 'prashankpathak@gmail.com' && (
                      <button
                        onClick={() => {
                          setUserDropdown(false);
                          navigate('owner-dashboard');
                        }}
                        className="w-full px-4 py-2.5 text-xs text-[#c5a059] hover:bg-[#c5a059]/10 flex items-center gap-2 transition-colors uppercase tracking-wider font-semibold"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span> Admin Portal
                      </button>
                    )}

                    <div className="border-t border-white/5 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors uppercase tracking-wider"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login', 'Log in to book and manage consultations.')}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-[#c5a059] text-black text-[11px] sm:text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all rounded whitespace-nowrap flex items-center gap-1 cursor-pointer shadow-md"
              aria-label="Login"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-md text-gray-400 hover:text-white focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="block h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="block h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'calc(100vh - 4rem)' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-white/10 bg-black fixed w-full left-0 top-16 sm:top-20 shadow-2xl overflow-y-auto z-50 pb-20"
          >
            {/* User Mobile Status Banner */}
            <div className="p-4 bg-[#111] border-b border-white/5 flex items-center justify-between">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#c5a059] text-black flex items-center justify-center font-bold text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs text-white font-medium">{displayName}</div>
                    <div className="text-[10px] text-gray-500 truncate max-w-[180px]">{user.email}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-xs text-gray-400">Guest Client (अतिथि)</span>
                </div>
              )}

              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded cursor-pointer"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    openAuthModal('signup');
                    setIsOpen(false);
                  }}
                  className="text-[10px] uppercase font-bold text-black bg-[#c5a059] px-3.5 py-1.5 rounded cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>

            <div className="pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    navigate(link.id);
                    setIsOpen(false);
                  }}
                  className={`${
                    currentPage === link.id
                      ? 'bg-white/5 border-[#c5a059] text-[#c5a059]'
                      : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                  } block pl-4 pr-4 py-3.5 border-l-4 text-xs font-medium uppercase tracking-widest transition-colors w-full text-left cursor-pointer`}
                >
                  {link.label}
                </button>
              ))}

              {user && (
                <button
                  onClick={() => {
                    navigate('my-bookings');
                    setIsOpen(false);
                  }}
                  className={`${
                    currentPage === 'my-bookings'
                      ? 'bg-white/5 border-[#c5a059] text-[#c5a059]'
                      : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                  } block pl-4 pr-4 py-3.5 border-l-4 text-xs font-medium uppercase tracking-widest transition-colors w-full text-left cursor-pointer`}
                >
                  My Consultations (मेरी बुकिंग्स)
                </button>
              )}

              <div className="px-4 mt-6 mb-4 space-y-3">
                <button
                   onClick={() => {
                     setIsOpen(false);
                     setTimeout(() => {
                       const chatBtn = document.getElementById('nyaya-sakha-open-btn');
                       if (chatBtn) chatBtn.click();
                     }, 100);
                   }}
                   className="w-full min-h-[44px] px-4 py-3 bg-gradient-to-r from-[#1b1710] to-[#121212] border border-[#c5a059] text-[#c5a059] text-xs font-bold uppercase tracking-wider hover:brightness-125 transition-all text-center rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  ⚖️ AI कानूनी सहायक (Nyaya Sakha)
                </button>

                {!user && (
                  <button
                    onClick={() => {
                      openAuthModal('signup');
                      setIsOpen(false);
                    }}
                    className="w-full min-h-[44px] px-4 py-3 bg-[#c5a059] text-black text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all text-center rounded-lg cursor-pointer"
                  >
                    Sign In / Register
                  </button>
                )}
                <button
                   onClick={() => {
                     navigate('lawyer-portal');
                     setIsOpen(false);
                   }}
                   className="w-full min-h-[44px] px-4 py-3 border border-[#c5a059] text-[#c5a059] text-xs font-bold uppercase tracking-wider hover:bg-[#c5a059] hover:text-black transition-all text-center rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Scale className="w-4 h-4" /> Lawyer Portal (वकील पोर्टल)
                </button>
                <button
                   onClick={() => {
                     navigate('owner-login');
                     setIsOpen(false);
                   }}
                   className="w-full min-h-[40px] px-4 py-2.5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all text-center rounded-lg cursor-pointer"
                >
                  Owner / Admin Login
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
