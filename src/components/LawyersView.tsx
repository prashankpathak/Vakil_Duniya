import { useEffect, useState } from 'react';
import { ShieldCheck, MapPin, Languages, Star, User } from 'lucide-react';
import { Lawyer } from '../types';
import { useNavigationStore } from '../store';
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
  const { bookLawyer } = useNavigationStore();

  useEffect(() => {
    fetch('/api/lawyers')
      .then(res => res.json())
      .then(data => {
        setLawyers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching lawyers:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
      <div className="border-b border-white/10 pb-5 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-white">Find Verified Lawyers</h2>
          <p className="mt-2 max-w-4xl text-sm text-gray-400 font-sans font-light">
            Browse our network of experienced legal professionals and book a consultation today.
          </p>
        </div>
        <span className="text-[10px] text-[#c5a059] underline underline-offset-4 cursor-pointer uppercase tracking-[0.2em] font-bold">Search Filter</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a059]"></div>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {lawyers.map((lawyer) => (
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
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-0.5">Fee</span>
                  <div className="text-[#c5a059] font-serif font-bold text-xl">₹{lawyer.consultation_fee}</div>
                </div>
                <button
                  onClick={() => bookLawyer(lawyer.id)}
                  className="bg-transparent border border-[#c5a059] text-[#c5a059] px-4 py-1.5 text-xs font-bold uppercase tracking-widest hover:bg-[#c5a059] hover:text-black transition-colors rounded-sm"
                >
                  Book
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
