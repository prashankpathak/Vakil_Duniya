import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigationStore } from '../store';
import { AnimatePresence, motion } from 'motion/react';
import { LanguageSelector } from './LanguageSelector';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentPage, navigate } = useNavigationStore();

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'lawyers', label: 'Find Lawyers' },
    { id: 'services', label: 'Services' },
  ] as const;

  return (
    <header className="h-20 px-4 sm:px-6 lg:px-12 flex flex-col justify-center border-b border-white/10 z-10 bg-[#050505] shrink-0 sticky top-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => navigate('home')}>
          <div className="w-10 h-10 bg-[#c5a059] rounded-sm flex items-center justify-center rotate-45 shrink-0">
            <span className="text-black font-bold -rotate-45 text-xl">V</span>
          </div>
          <div className="hidden sm:flex flex-col ml-1">
            <span className="text-2xl font-serif tracking-tight font-semibold text-white leading-none">
              Vakil Duniya<span className="text-[#c5a059]">.</span>
            </span>
            <span className="text-[9px] uppercase tracking-[0.15em] text-gray-500 mt-1.5 font-sans">
              By Prashank Pathak
            </span>
          </div>
        </div>
        
        <nav className="hidden lg:flex gap-10 text-sm font-medium uppercase tracking-widest text-gray-400 items-center">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => navigate(link.id)}
              className={`${
                currentPage === link.id
                  ? 'text-[#c5a059]'
                  : 'hover:text-white'
              } transition-colors`}
            >
              {link.label}
            </button>
          ))}
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button
               onClick={() => navigate('admin')}
               className="px-6 py-2 border border-[#c5a059] text-[#c5a059] text-xs uppercase tracking-widest hover:bg-[#c5a059] hover:text-black transition-all whitespace-nowrap"
            >
              Owner Portal
            </button>
          </div>
        </nav>

        <div className="flex items-center gap-4 lg:hidden">
          <LanguageSelector />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden border-t border-white/10 bg-[#080808] absolute w-full left-0 top-20 shadow-xl overflow-hidden"
          >
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
                  } block pl-3 pr-4 py-3 border-l-4 text-xs font-medium uppercase tracking-widest transition-colors w-full text-left`}
                >
                  {link.label}
                </button>
              ))}
              <div className="px-4 mt-4 mb-2">
                <button
                   onClick={() => {
                     navigate('admin');
                     setIsOpen(false);
                   }}
                   className="w-full px-6 py-3 border border-[#c5a059] text-[#c5a059] text-xs uppercase tracking-widest hover:bg-[#c5a059] hover:text-black transition-all text-center"
                >
                  Lawyer Portal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
