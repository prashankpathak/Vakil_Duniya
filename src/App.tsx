import { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { LawyersView } from './components/LawyersView';
import { ServicesView } from './components/ServicesView';
import { BookingView } from './components/BookingView';
import { MyBookingsView } from './components/MyBookingsView';
import { AdminView } from './components/AdminView';
import { LawyerPortalView } from './components/LawyerPortalView';
import { OwnerLoginView } from './components/OwnerLoginView';
import { OwnerDashboard } from './components/OwnerDashboard';
import { ChatBot } from './components/ChatBot';
import { AuthModal } from './components/AuthModal';
import { useNavigationStore } from './store';
import { AnimatePresence, motion } from 'motion/react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, fetchUserProfile } from './firebase';

export default function App() {
  const { currentPage, navigate, setUser, setAuthLoading } = useNavigationStore();

  // Listen to Firebase Auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid, firebaseUser);
        setUser(firebaseUser, profile);
      } else {
        setUser(null, null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading]);

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-[#e0e0e0] flex flex-col relative">
      {/* Background Subtle Texture */}
      <div className="fixed inset-0 opacity-5 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#c5a059 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      </div>
      
      <div className="relative z-10 flex flex-col flex-grow w-full">
        <Navbar />
        <main className="flex-grow flex flex-col relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-grow flex flex-col"
            >
              {currentPage === 'home' && <HomeView />}
              {currentPage === 'lawyers' && <LawyersView />}
              {currentPage === 'services' && <ServicesView />}
              {currentPage === 'book' && <BookingView />}
              {currentPage === 'my-bookings' && <MyBookingsView />}
              {(currentPage === 'admin' || currentPage === 'lawyer-portal' || currentPage === 'lawyer-dashboard') && <LawyerPortalView />}
              {currentPage === 'owner-login' && <OwnerLoginView />}
              {currentPage === 'owner-dashboard' && <OwnerDashboard />}
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* Global Auth Modal */}
        <AuthModal />

        <ChatBot />
        
        {/* Bottom Bar Info / Footer */}
        <footer className="h-auto min-h-16 border-t border-white/5 px-4 sm:px-6 lg:px-12 py-4 flex flex-col lg:flex-row items-center justify-between bg-[#050505] mt-auto shrink-0 gap-4 lg:gap-0">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Secure Firebase Auth & Firestore</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 tracking-widest uppercase">
               <span className="text-white/40 hidden sm:inline">WhatsApp / Call:</span>
               <span className="text-white/40 sm:hidden">Contact:</span>
               <a href="tel:6263364561" className="hover:text-[#c5a059] transition-colors font-mono">6263364561</a>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 tracking-widest uppercase">
               <span className="text-white/40 hidden sm:inline">Support:</span>
               <a href="mailto:vakilduniya.in@gmail.com" className="hover:text-[#c5a059] transition-colors lowercase tracking-normal">vakilduniya.in@gmail.com</a>
            </div>
          </div>
          <div className="flex gap-4 sm:gap-6 items-center text-[10px] text-gray-500 uppercase tracking-[0.2em] flex-wrap justify-center mt-4 lg:mt-0">
            <button className="hover:text-[#c5a059] cursor-pointer transition-colors">Policy</button>
            <button className="hover:text-[#c5a059] cursor-pointer transition-colors">Terms</button>
            <span className="text-white/40 italic">© 2026 Vakil Duniya</span>
            {/* Discreet subtle admin link tucked quietly at the bottom */}
            <button 
              onClick={() => navigate('owner-login')} 
              title="Admin Portal"
              className="text-gray-800 hover:text-gray-500 text-[9px] transition-colors px-1 py-0.5 rounded cursor-pointer select-none"
            >
              •
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
