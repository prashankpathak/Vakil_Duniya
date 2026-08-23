import { ShieldCheck, Video, CreditCard, Clock, Scale } from 'lucide-react';
import { useNavigationStore } from '../store';
// @ts-ignore
import heroBg from '../assets/images/hero_lawyer_bg_1779709182651.png';

export function HomeView() {
  const { navigate } = useNavigationStore();

  const features = [
    { name: 'Verified Lawyers', description: 'Every lawyer on our platform goes through a strict verification process.', icon: <ShieldCheck className="w-5 h-5" /> },
    { name: 'Online/Offline Options', description: 'Choose between seamless video consultations or in-person chamber visits.', icon: <Video className="w-5 h-5" /> },
    { name: 'Direct Advisory', description: 'Direct legal guidance tailored to your specific case requirements.', icon: <Scale className="w-5 h-5" /> },
    { name: 'Fast Appointments', description: 'Find help when you need it without waiting weeks for an opening.', icon: <Clock className="w-5 h-5" /> },
  ];

  return (
    <div className="flex-1 flex flex-col w-full relative z-10">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Hero Section */}
      <div className="w-full flex flex-col xl:flex-row py-12 xl:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex-1 flex flex-col justify-center xl:pr-16 z-10">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-tighter text-[#c5a059] font-bold">Verified Professionals Only</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif leading-[1.1] text-white mb-6">
            Trusted Legal Help <br/> 
            <span className="italic text-[#c5a059]">at Your Fingertips.</span>
          </h1>
          <p className="text-[#c5a059] text-2xl sm:text-3xl font-hindi-display mb-4 tracking-wide">
            सच्चे वकील, सही सलाह।
          </p>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mb-10 font-light leading-relaxed">
            Expert legal consultation at your convenience. Book online appointments with verified specialists for civil, criminal, and family matters.<br/><br/>
            <span className="font-hindi text-lg">न्याय आपका अधिकार है, और सही वकील चुनना आपका फैसला। <strong>वकील दुनिया</strong> - भरोसेमंद कानूनी सलाह, अब आपके करीब।</span>
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={() => navigate('lawyers')}
              className="bg-[#c5a059] text-black px-8 py-4 font-bold text-sm tracking-widest uppercase hover:brightness-110 transition-all w-full sm:w-auto"
            >
              Find a Lawyer
            </button>
            <button
              onClick={() => navigate('services')}
              className="px-8 py-4 border border-white/20 text-white font-bold text-sm tracking-widest uppercase hover:text-[#c5a059] hover:border-[#c5a059] transition-all w-full sm:w-auto"
            >
              View Services
            </button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-l border-white/10 pl-4">
              <div className="text-[10px] uppercase text-gray-500 mb-1">Active Lawyers</div>
              <div className="text-lg sm:text-xl font-serif text-white">1,200+</div>
            </div>
            <div className="border-l border-white/10 pl-4">
              <div className="text-[10px] uppercase text-gray-500 mb-1">Consultations</div>
              <div className="text-lg sm:text-xl font-serif text-white">15k+</div>
            </div>
            <div className="border-l border-white/10 pl-4">
              <div className="text-[10px] uppercase text-gray-500 mb-1">Case Success</div>
              <div className="text-lg sm:text-xl font-serif text-white">98%</div>
            </div>
            <div className="border-l border-white/10 pl-4">
              <div className="text-[10px] uppercase text-gray-500 mb-1">City Support</div>
              <div className="text-lg sm:text-xl font-serif text-white">50+</div>
            </div>
          </div>
        </div>
        
        {/* Right decoration area - hidden on small, just spacing on large */}
        <div className="hidden xl:flex xl:w-5/12 ml-auto justify-end relative z-0 mt-12 xl:mt-0 opacity-20 pointer-events-none">
           <Scale className="w-full h-full text-[#c5a059] max-h-[500px]" />
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-24 bg-[#080808] border-y border-white/5 relative z-10 w-full mt-auto">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
             <div className="mb-4 text-[#c5a059]">
               <ShieldCheck className="w-10 h-10 mx-auto" />
             </div>
            <h2 className="text-3xl font-serif text-white sm:text-4xl">
              Why Choose Vakil Duniya?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-400 font-light">
              We make accessing quality legal advice simple, affordable, and transparent.<br/>
              <span className="text-[#c5a059] mt-3 block font-hindi text-xl">वकील दुनिया के साथ, हर कानूनी कदम आसान और सुरक्षित।</span>
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col bg-[#111] p-6 rounded-xl border border-white/5 hover:border-[#c5a059]/30 transition-colors">
                  <dt className="flex items-center gap-x-3 text-base font-semibold text-white font-sans">
                    <div className="flex h-10 w-10 items-center justify-center bg-[#050505] rounded border border-white/10 text-[#c5a059]">
                      {feature.icon}
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-sm text-gray-400 font-sans font-light">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
