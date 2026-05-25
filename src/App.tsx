import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { LawyersView } from './components/LawyersView';
import { ServicesView } from './components/ServicesView';
import { BookingView } from './components/BookingView';
import { AdminView } from './components/AdminView';
import { OwnerLoginView } from './components/OwnerLoginView';
import { OwnerDashboard } from './components/OwnerDashboard';
import { ChatBot } from './components/ChatBot';
import { useNavigationStore } from './store';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const { currentPage, navigate } = useNavigationStore();

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
              {currentPage === 'admin' && <AdminView />}
              {currentPage === 'owner-login' && <OwnerLoginView />}
              {currentPage === 'owner-dashboard' && <OwnerDashboard />}
            </motion.div>
          </AnimatePresence>
        </main>
        
        <ChatBot />

        <div className="fixed bottom-6 left-4 sm:left-6 z-50 flex flex-col gap-3 items-start">
          <button
            onClick={() => navigate('lawyers')}
            className="bg-[#111] border border-[#c5a059] text-[#c5a059] px-4 py-3 rounded-full shadow-lg flex items-center justify-center hover:bg-[#c5a059] hover:text-black transition-colors font-bold uppercase tracking-widest text-[10px] sm:text-xs"
          >
            <span className="mr-2">🔍</span> Find Lawyers
          </button>
          
          <button
            onClick={() => navigate('services')}
            className="bg-[#111] border border-[#c5a059] text-[#c5a059] px-4 py-3 rounded-full shadow-lg flex items-center justify-center hover:bg-[#c5a059] hover:text-black transition-colors font-bold uppercase tracking-widest text-[10px] sm:text-xs"
          >
            <span className="mr-2">🏛️</span> Services
          </button>

          <button
            onClick={() => navigate('admin')}
            className="bg-[#111] border border-[#c5a059] text-[#c5a059] px-4 py-3 rounded-full shadow-lg flex items-center justify-center hover:bg-[#c5a059] hover:text-black transition-colors font-bold uppercase tracking-widest text-[10px] sm:text-xs"
          >
            <span className="mr-2">⚖️</span> Lawyer Portal
          </button>
        </div>
        
        {/* Bottom Bar Info / Footer */}
        <footer className="h-auto min-h-16 border-t border-white/5 px-4 sm:px-6 lg:px-12 py-4 flex flex-col lg:flex-row items-center justify-between bg-[#050505] mt-auto shrink-0 gap-4 lg:gap-0">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Secure UPI</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 tracking-widest uppercase">
               <span className="text-white/40 hidden sm:inline">WhatsApp / Call:</span>
               <span className="text-white/40 sm:hidden">Contact:</span>
               <a href="tel:6263364561" className="hover:text-[#c5a059] transition-colors font-mono">6263364561</a>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 tracking-widest uppercase">
               <span className="text-white/40 hidden sm:inline">Email:</span>
               <a href="mailto:prashankpathak@gmail.com" className="hover:text-[#c5a059] transition-colors lowercase tracking-normal">prashankpathak@gmail.com</a>
            </div>
          </div>
          <div className="flex gap-4 sm:gap-6 items-center text-[10px] text-gray-500 uppercase tracking-[0.2em] flex-wrap justify-center mt-4 lg:mt-0">
            <button className="hover:text-[#c5a059] cursor-pointer transition-colors">Policy</button>
            <button className="hover:text-[#c5a059] cursor-pointer transition-colors">Terms</button>
            <button onClick={() => navigate('owner-login')} className="hover:text-[#c5a059] cursor-pointer transition-colors font-bold text-[#c5a059]/50">Owner</button>
            <span className="text-white/40 italic">© 2026 Vakil Duniya</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

