import { useEffect, useState } from 'react';
import { ShieldCheck, MapPin, Languages, Star, User } from 'lucide-react';
import { Lawyer } from '../types';
import { useNavigationStore } from '../store';
import { subscribeToLawyers, fetchLawyersFromFirestore } from '../firebase';
import { motion } from 'motion/react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export function LawyersView() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const { bookLawyer } = useNavigationStore();

  useEffect(() => {
    // Initial fetch from Firestore / server
    fetchLawyersFromFirestore().then(data => {
      if (data && data.length > 0) {
        setLawyers(data);
      }
      setLoading(false);
    });

    // Real-time Firestore sync
    const unsubscribe = subscribeToLawyers((updatedLawyers) => {
      if (updatedLawyers && updatedLawyers.length > 0) {
        setLawyers(updatedLawyers);
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const approvedLawyers = lawyers.filter(lawyer => {
    if (lawyer.approval_status === 'rejected') return false;
    if (lawyer.approval_status === 'pending') return false;
    if (lawyer.is_verified === false) return false;
    return true;
  });

  const uniqueCities = Array.from(new Set(approvedLawyers.map(l => l.city))).sort();
  const uniqueSpecializations = Array.from(new Set(approvedLawyers.map(l => l.specialization))).sort();

  const filteredLawyers = approvedLawyers.filter(lawyer => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = searchQuery ? (
      lawyer.name.toLowerCase().includes(query) ||
      lawyer.specialization.toLowerCase().includes(query) ||
      lawyer.city.toLowerCase().includes(query) ||
      lawyer.experience.toLowerCase().includes(query) ||
      (lawyer.bar_enrollment && lawyer.bar_enrollment.toLowerCase().includes(query)) ||
      lawyer.language.some(lang => lang.toLowerCase().includes(query))
    ) : true;
    const matchesCity = selectedCity ? lawyer.city === selectedCity : true;
    const matchesSpec = selectedSpecialization ? lawyer.specialization === selectedSpecialization : true;
    return matchesSearch && matchesCity && matchesSpec;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
      <div className="border-b border-white/10 pb-5 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-white">Find Verified Lawyers</h2>
          <p className="mt-2 max-w-4xl text-sm text-gray-400 font-sans font-light">
            Browse our network of experienced legal professionals and book a consultation today.
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
         <input 
           type="text" 
           placeholder="Search by name, specialization, city, language..." 
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors"
         />
         <select
           value={selectedCity}
           onChange={(e) => setSelectedCity(e.target.value)}
           className="bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors"
         >
           <option value="">All Cities</option>
           {uniqueCities.map(city => (
             <option key={city} value={city}>{city}</option>
           ))}
         </select>
         <select
           value={selectedSpecialization}
           onChange={(e) => setSelectedSpecialization(e.target.value)}
           className="bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors"
         >
           <option value="">All Specializations</option>
           {uniqueSpecializations.map(spec => (
             <option key={spec} value={spec}>{spec}</option>
           ))}
         </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a059]"></div>
        </div>
      ) : filteredLawyers.length === 0 ? (
        <div className="text-center py-20 bg-[#111] border border-white/5 rounded-xl">
           <h3 className="text-[#c5a059] font-serif text-xl mb-2">No Lawyers Found</h3>
           <p className="text-gray-400 text-sm font-light">Try adjusting your search criteria or resetting filters.</p>
           <button 
             onClick={() => { setSearchQuery(''); setSelectedCity(''); setSelectedSpecialization(''); }}
             className="mt-6 text-xs text-[#c5a059] uppercase tracking-widest font-bold border border-[#c5a059] px-6 py-2 hover:bg-[#c5a059] hover:text-black transition-colors"
           >
             Reset Filters
           </button>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredLawyers.map((lawyer) => (
            <motion.div 
              variants={item}
              key={lawyer.id} 
              className="bg-[#111] border border-white/5 p-5 rounded-xl flex flex-col group transition-all hover:border-[#c5a059]/30"
            >
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white/20">
                     {lawyer.image ? (
                        <img src={lawyer.image} alt={lawyer.name} className="w-full h-full object-cover" />
                     ) : (
                       <User className="w-8 h-8" />
                     )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#111] text-[#c5a059] text-[10px] flex items-center font-bold px-1 rounded-sm border border-white/10">
                    <Star className="w-3 h-3 fill-[#c5a059] mr-0.5" />{lawyer.rating}
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-serif text-lg leading-tight">{lawyer.name}</h4>
                  <p className="text-[#c5a059] text-[10px] font-bold uppercase tracking-wider mt-1">{lawyer.specialization}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6 flex-1 text-xs text-gray-400 font-sans font-light border-y border-white/5 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-300 w-16">Exp:</span> {lawyer.experience}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-300 w-16 invisible sm:hidden xl:inline-block hidden">Loc:</span>
                  <MapPin className="w-3 h-3 text-gray-500 xl:hidden inline" />
                  {lawyer.city}
                </div>
                <div className="flex items-center gap-2">
                   <span className="font-semibold text-gray-300 w-16 invisible sm:hidden xl:inline-block hidden">Lang:</span>
                   <Languages className="w-3 h-3 text-gray-500 xl:hidden inline" />
                  {lawyer.language.join(', ')}
                </div>
                {lawyer.consultation_mode && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-300 w-16">Mode:</span> {lawyer.consultation_mode}
                  </div>
                )}
                {lawyer.bar_enrollment && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-300 w-16">Bar Reg:</span> <span className="text-[#c5a059] font-mono">{lawyer.bar_enrollment}</span>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4">
                <button
                  onClick={() => bookLawyer(lawyer.id)}
                  className="w-full bg-transparent border border-[#c5a059] text-[#c5a059] py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#c5a059] hover:text-black transition-colors rounded-sm text-center"
                >
                  Book Consultation
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
