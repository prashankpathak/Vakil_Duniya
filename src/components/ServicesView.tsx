import { useEffect, useState } from 'react';
import { Service } from '../types';
import { Scale, Gavel, Users, Home, FileText, Unlock } from 'lucide-react';
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
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } }
};

const iconMap: Record<string, any> = {
  Scale: <Scale className="w-8 h-8" />,
  Gavel: <Gavel className="w-8 h-8" />,
  Users: <Users className="w-8 h-8" />,
  Home: <Home className="w-8 h-8" />,
  FileText: <FileText className="w-8 h-8" />,
  Unlock: <Unlock className="w-8 h-8" />,
};

export function ServicesView() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching services:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
      <div className="border-b border-white/10 pb-5 mb-12 text-center max-w-3xl mx-auto mt-8">
        <h2 className="text-4xl font-serif text-white">Legal Services & Pricing</h2>
        <p className="mt-4 text-base text-gray-400 font-sans font-light">
          Transparent pricing for expert consultation. Minimum fees to ensure accessible legal help.
        </p>
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
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => (
            <motion.div 
              variants={item}
              key={service.id} 
              className="bg-[#111] border border-white/5 p-8 rounded-xl flex flex-col items-center text-center hover:border-[#c5a059]/30 transition-all group"
            >
              <div className="text-[#c5a059] mb-6 bg-[#050505] p-5 rounded-full border border-white/5 group-hover:scale-110 transition-transform">
                {iconMap[service.icon] || <Scale className="w-8 h-8" />}
              </div>
              <h3 className="text-xl font-serif text-white mb-4">{service.name}</h3>
              <div className="mt-auto pt-6 border-t border-white/5 w-full">
                 <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Starting Fee</p>
                 <p className="text-3xl font-serif text-[#c5a059]">₹{service.fee}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
