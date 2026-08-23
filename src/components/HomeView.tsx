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
      <div className="w-full flex flex-col xl:flex-row py-8 sm:py-12 xl:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex-1 flex flex-col justify-center xl:pr-12 z-10">
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 px-3 py-1 bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse"></span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#c5a059] font-bold">Verified Professionals Only</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.15] text-white mb-4 sm:mb-6">
            Trusted Legal Help <br/> 
            <span className="italic text-[#c5a059]">at Your Fingertips.</span>
          </h1>
          <p className="text-[#c5a059] text-xl sm:text-2xl md:text-3xl font-hindi-display mb-3 sm:mb-4 tracking-wide">
            सच्चे वकील, सही सलाह।
          </p>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl mb-8 sm:mb-10 font-light leading-relaxed">
            Expert legal consultation at your convenience. Book online appointments with verified specialists for civil, criminal, and family matters.<br/><br/>
            <span className="font-hindi text-base sm:text-lg text-gray-300">न्याय आपका अधिकार है, और सही वकील चुनना आपका फैसला। <strong>वकील दुनिया</strong> - भरोसेमंद कानूनी सलाह, अब आपके करीब।</span>
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('lawyers')}
              className="bg-[#c5a059] text-black px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-xs sm:text-sm tracking-widest uppercase hover:brightness-110 transition-all text-center rounded-lg sm:rounded-none cursor-pointer shadow-lg"
            >
              Find a Lawyer (वकील खोजें)
            </button>
            <button
              onClick={() => navigate('services')}
              className="px-6 sm:px-8 py-3.5 sm:py-4 border border-white/20 text-white font-bold text-xs sm:text-sm tracking-widest uppercase hover:text-[#c5a059] hover:border-[#c5a059] transition-all text-center rounded-lg sm:rounded-none cursor-pointer"
            >
              ⚖️ View Services (वकील सेवाएं)
            </button>
          </div>

          <div className="mt-10 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="border-l border-white/10 pl-3 sm:pl-4">
              <div className="text-[10px] uppercase text-gray-500 mb-0.5 sm:mb-1">Active Lawyers</div>
              <div className="text-base sm:text-xl font-serif text-white">1,200+</div>
            </div>
            <div className="border-l border-white/10 pl-3 sm:pl-4">
              <div className="text-[10px] uppercase text-gray-500 mb-0.5 sm:mb-1">Consultations</div>
              <div className="text-base sm:text-xl font-serif text-white">15k+</div>
            </div>
            <div className="border-l border-white/10 pl-3 sm:pl-4">
              <div className="text-[10px] uppercase text-gray-500 mb-0.5 sm:mb-1">Case Success</div>
              <div className="text-base sm:text-xl font-serif text-white">98%</div>
            </div>
            <div className="border-l border-white/10 pl-3 sm:pl-4">
              <div className="text-[10px] uppercase text-gray-500 mb-0.5 sm:mb-1">City Support</div>
              <div className="text-base sm:text-xl font-serif text-white">50+</div>
            </div>
          </div>
        </div>
        
        {/* Right decoration area - interactive service preview cards & AI Assistant */}
        <div className="w-full xl:w-5/12 flex flex-col gap-4 mt-8 xl:mt-0 relative z-10">
          {/* AI Legal Assistant Featured Card */}
          <div 
            onClick={() => {
              const chatBtn = document.getElementById('nyaya-sakha-open-btn');
              if (chatBtn) chatBtn.click();
            }}
            className="bg-gradient-to-r from-[#17150f] via-[#1a1710] to-[#121212] hover:border-[#c5a059] border border-[#c5a059]/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 cursor-pointer shadow-2xl group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2 sm:mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/50 text-[#c5a059] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  24x7 AI Legal Help
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400">Gemini 3.5</span>
              </div>
              <span className="text-xs text-[#c5a059] font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                चैट शुरू करें →
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2">
              ⚖️ न्याय सखा (Nyaya Sakha AI)
            </h3>
            <p className="text-xs text-gray-300 mb-3 leading-relaxed">
              सिविल, क्रिमिनल, स्टे आर्डर, जमानत व कोर्ट प्रक्रियाओं पर तुरंत स्पष्ट कानूनी सलाह व मार्गदर्शन प्राप्त करें।
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-[11px] text-gray-300">
              <span className="bg-black/60 px-2 py-0.5 rounded border border-[#c5a059]/30 text-[#e4c478]">🎙️ बोलकर पूछें (Voice)</span>
              <span className="bg-black/60 px-2 py-0.5 rounded border border-white/10">🏛️ CPC / CrPC / BNS</span>
              <span className="bg-black/60 px-2 py-0.5 rounded border border-white/10">📜 तुरंत समाधान</span>
            </div>
          </div>

          <div 
            onClick={() => navigate('services')} 
            className="bg-[#111] hover:bg-[#161616] border border-blue-500/20 hover:border-blue-500/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 cursor-pointer shadow-xl group"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  दीवानी कानून
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400">Civil Law</span>
              </div>
              <span className="text-xs text-[#c5a059] group-hover:translate-x-1 transition-transform">पूरी सूची देखें →</span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-white mb-1.5 sm:mb-2">🏛️ 1. सिविल मामले (दीवानी)</h3>
            <p className="text-xs text-gray-400 mb-3">
              संपत्ति विवाद (पैतृक बंटवारा, कब्जा, स्टे ऑर्डर), पारिवारिक व तलाक, अनुबंध, धन वसूली, वसीयत व कोर्ट ड्राफ्टिंग।
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-[11px] text-gray-300">
              <span className="bg-[#1e1e1e] px-2 py-0.5 rounded border border-white/5">🏠 संपत्ति विवाद</span>
              <span className="bg-[#1e1e1e] px-2 py-0.5 rounded border border-white/5">👨‍👩‍👦 पारिवारिक</span>
              <span className="bg-[#1e1e1e] px-2 py-0.5 rounded border border-white/5">📝 अनुबंध व रिकवरी</span>
              <span className="bg-[#1e1e1e] px-2 py-0.5 rounded border border-white/5">📜 वसीयत व Plaint</span>
            </div>
          </div>

          <div 
            onClick={() => navigate('services')} 
            className="bg-[#111] hover:bg-[#161616] border border-red-500/20 hover:border-red-500/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 cursor-pointer shadow-xl group"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
                  आपराधिक कानून
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400">Criminal Law</span>
              </div>
              <span className="text-xs text-[#c5a059] group-hover:translate-x-1 transition-transform">पूरी सूची देखें →</span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-white mb-1.5 sm:mb-2">🚨 2. क्रिमिनल मामले (आपराधिक)</h3>
            <p className="text-xs text-gray-400 mb-3">
              एफआईआर दर्ज कराना, 156(3) CrPC, अग्रिम व नियमित जमानत, 482 Quashing, डिस्चार्ज बहस एवं हाई कोर्ट अपील।
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-[11px] text-gray-300">
              <span className="bg-[#1e1e1e] px-2 py-0.5 rounded border border-white/5">🚓 एफआईआर & 156(3)</span>
              <span className="bg-[#1e1e1e] px-2 py-0.5 rounded border border-white/5">🔓 अग्रिम व नियमित जमानत</span>
              <span className="bg-[#1e1e1e] px-2 py-0.5 rounded border border-white/5">🛡️ 482 Quashing</span>
              <span className="bg-[#1e1e1e] px-2 py-0.5 rounded border border-white/5">⚖️ हाई कोर्ट अपील</span>
            </div>
          </div>
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
