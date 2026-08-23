import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  Gavel, 
  Home, 
  Users, 
  Briefcase, 
  FileText, 
  ShieldAlert, 
  Unlock, 
  Landmark, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  FileCheck,
  BookOpen,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INDIAN_LEGAL_SERVICES_DATA } from '../data/servicesData';
import { useNavigationStore } from '../store';

const iconMap: Record<string, React.ReactNode> = {
  Landmark: <Landmark className="w-6 h-6" />,
  Gavel: <Gavel className="w-6 h-6" />,
  Home: <Home className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Briefcase: <Briefcase className="w-6 h-6" />,
  FileText: <FileText className="w-6 h-6" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6" />,
  Unlock: <Unlock className="w-6 h-6" />,
  Scale: <Scale className="w-6 h-6" />
};

export function ServicesView() {
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'civil' | 'criminal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubCatId, setExpandedSubCatId] = useState<string | null>(null);

  const { navigate, setLawyerCategoryFilter, setSelectedCaseType } = useNavigationStore();

  const handleBookService = (serviceTitle: string, subCategoryTitle: string) => {
    setSelectedCaseType(`${subCategoryTitle} - ${serviceTitle}`);
    setLawyerCategoryFilter(subCategoryTitle);
    navigate('lawyers');
  };

  const handleFindLawyersForCategory = (filterName: string) => {
    setLawyerCategoryFilter(filterName);
    navigate('lawyers');
  };

  // Filtered categories based on active tab & search query
  const filteredData = useMemo(() => {
    return INDIAN_LEGAL_SERVICES_DATA.map(mainCat => {
      // Check tab filter
      if (activeCategoryTab !== 'all' && mainCat.id !== activeCategoryTab) {
        return null;
      }

      if (!searchQuery.trim()) {
        return mainCat;
      }

      const q = searchQuery.toLowerCase().trim();

      // Check main category matches
      const mainMatch = mainCat.titleHindi.toLowerCase().includes(q) || 
                         mainCat.titleEnglish.toLowerCase().includes(q) ||
                         mainCat.descriptionHindi.toLowerCase().includes(q);

      // Filter subcategories and items
      const matchingSubCats = mainCat.subCategories.map(subCat => {
        const subMatch = subCat.titleHindi.toLowerCase().includes(q) ||
                         subCat.titleEnglish.toLowerCase().includes(q) ||
                         subCat.descriptionHindi.toLowerCase().includes(q);

        const matchingItems = subCat.items.filter(item => 
          item.titleHindi.toLowerCase().includes(q) ||
          item.titleEnglish.toLowerCase().includes(q) ||
          (item.descriptionHindi && item.descriptionHindi.toLowerCase().includes(q)) ||
          (item.keyActsOrProvisions && item.keyActsOrProvisions.toLowerCase().includes(q))
        );

        if (mainMatch || subMatch || matchingItems.length > 0) {
          return {
            ...subCat,
            items: (subMatch || mainMatch) ? subCat.items : matchingItems
          };
        }
        return null;
      }).filter(Boolean);

      if (matchingSubCats.length > 0) {
        return {
          ...mainCat,
          subCategories: matchingSubCats as typeof mainCat.subCategories
        };
      }

      return null;
    }).filter(Boolean) as typeof INDIAN_LEGAL_SERVICES_DATA;
  }, [activeCategoryTab, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full">
      {/* Top Header Banner */}
      <div className="border-b border-white/10 pb-8 mb-8 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-full mb-4">
          <Scale className="w-4 h-4 text-[#c5a059]" />
          <span className="text-xs uppercase font-bold text-[#c5a059] tracking-widest">
            भारतीय कानून व न्याय सेवाएं (Legal Practice Matrix)
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
          ⚖️ भारतीय वकील की सेवाएं
        </h1>
        <p className="text-lg sm:text-xl text-[#c5a059] font-hindi mt-2 font-medium">
          सिविल (दीवानी) एवं क्रिमिनल (आपराधिक) मामलों में प्रामाणिक कानूनी समाधान व अनुभवी अधिवक्ता
        </p>
        <p className="mt-3 text-sm text-gray-400 font-sans font-light max-w-2xl mx-auto">
          Comprehensive legal consultation, court drafting, trial defense, and appellate representation under Code of Civil Procedure (CPC) and Criminal Law.
        </p>
      </div>

      {/* Control Bar: Search & Category Navigation Tabs */}
      <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0d0d0d] p-4 rounded-2xl border border-white/10 shadow-xl">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveCategoryTab('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeCategoryTab === 'all'
                ? 'bg-[#c5a059] text-black shadow-lg'
                : 'bg-[#181818] text-gray-300 hover:text-white hover:bg-[#222] border border-white/5'
            }`}
          >
            <span>सभी सेवाएं</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-mono">16+</span>
          </button>

          <button
            onClick={() => setActiveCategoryTab('civil')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeCategoryTab === 'civil'
                ? 'bg-[#c5a059] text-black shadow-lg'
                : 'bg-[#181818] text-gray-300 hover:text-white hover:bg-[#222] border border-white/5'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>🏛️ 1. सिविल मामले (दीवानी)</span>
          </button>

          <button
            onClick={() => setActiveCategoryTab('criminal')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeCategoryTab === 'criminal'
                ? 'bg-[#c5a059] text-black shadow-lg'
                : 'bg-[#181818] text-gray-300 hover:text-white hover:bg-[#222] border border-white/5'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>🚨 2. क्रिमिनल मामले (आपराधिक)</span>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search: स्टे, 156(3), जमानत, 482..."
            className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-gray-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Hierarchy Showcase */}
      {filteredData.length === 0 ? (
        <div className="text-center py-16 bg-[#0f0f0f] border border-white/5 rounded-2xl">
          <ShieldAlert className="w-12 h-12 text-[#c5a059] mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-white">No Matching Legal Services Found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            Try searching for &quot;बंटवारा&quot;, &quot;जमानत&quot;, &quot;तलाक&quot;, &quot;FIR&quot;, &quot;482&quot; or clear the search filter.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategoryTab('all'); }}
            className="mt-4 px-4 py-2 bg-[#c5a059] text-black font-bold text-xs uppercase rounded-lg hover:brightness-110"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {filteredData.map((mainCategory) => {
            const isCivil = mainCategory.id === 'civil';
            return (
              <div 
                key={mainCategory.id}
                className="relative bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden"
              >
                {/* Background Accent Glow */}
                <div 
                  className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-10 ${
                    isCivil ? 'bg-blue-500' : 'bg-red-500'
                  }`} 
                />

                {/* Section Main Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10 relative z-10">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#1c1c1c] border border-[#c5a059]/40 text-[#c5a059] flex items-center justify-center shrink-0 shadow-lg">
                      {iconMap[mainCategory.iconName] || <Scale className="w-7 h-7" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isCivil 
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          {mainCategory.badge}
                        </span>
                        <span className="text-xs text-gray-500 font-sans font-light">
                          {mainCategory.titleEnglish}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                        {mainCategory.titleHindi}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1 font-light max-w-2xl">
                        {mainCategory.descriptionHindi}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFindLawyersForCategory(isCivil ? 'Civil & Property Dispute' : 'Criminal & Bail Matter')}
                    className="self-start md:self-auto px-4 py-2.5 bg-[#181818] hover:bg-[#c5a059] text-gray-300 hover:text-black border border-white/10 hover:border-[#c5a059] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>विशेषज्ञ वकील खोजें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subcategories Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                  {mainCategory.subCategories.map((subCat, subIndex) => {
                    const isExpanded = expandedSubCatId === subCat.id;

                    return (
                      <motion.div
                        key={subCat.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: subIndex * 0.05 }}
                        className="bg-[#141414]/90 border border-white/5 hover:border-[#c5a059]/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl flex flex-col justify-between group"
                      >
                        <div>
                          {/* Subcategory Header */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] border border-white/10 text-[#c5a059] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                {iconMap[subCat.iconName] || <Scale className="w-5 h-5" />}
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block">
                                  {subCat.badge}
                                </span>
                                <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#c5a059] transition-colors">
                                  {subCat.titleHindi}
                                </h3>
                              </div>
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono bg-white/5 px-2.5 py-1 rounded-lg shrink-0 border border-white/5">
                              {subCat.titleEnglish}
                            </span>
                          </div>

                          <p className="text-xs text-gray-400 mb-5 leading-relaxed font-light">
                            {subCat.descriptionHindi}
                          </p>

                          {/* Sub-parts List */}
                          <div className="space-y-3 mb-6 bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                            <div className="text-[10px] uppercase tracking-widest text-[#c5a059] font-bold flex items-center gap-1.5 pb-1 border-b border-white/5">
                              <BookOpen className="w-3 h-3" />
                              <span>प्रमुख कानूनी सेवाएं एवं उपचार (Core Legal Parts):</span>
                            </div>

                            {subCat.items.map((item, idx) => (
                              <div 
                                key={item.id}
                                className="p-3 bg-[#121212] border border-white/5 rounded-lg hover:border-[#c5a059]/30 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-[#c5a059]/10 text-[#c5a059] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <div>
                                      <h4 className="text-xs font-bold text-white font-hindi">
                                        {item.titleHindi}
                                      </h4>
                                      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                                        {item.descriptionHindi}
                                      </p>
                                      {item.keyActsOrProvisions && (
                                        <span className="inline-block text-[10px] text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/20 px-2 py-0.5 rounded mt-1.5 font-mono">
                                          ⚖️ {item.keyActsOrProvisions}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card Bottom CTA */}
                        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="text-left w-full sm:w-auto">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">परामर्श व्यवस्था</span>
                            <span className="text-xs font-medium text-[#c5a059]">
                              फीस वकील द्वारा ऑफलाइन तय होगी
                            </span>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                              onClick={() => handleBookService(subCat.items[0]?.titleHindi || subCat.titleHindi, subCat.titleHindi)}
                              className="flex-1 sm:flex-none px-4 py-2 bg-[#c5a059] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>परामर्श बुक करें</span>
                            </button>
                            <button
                              onClick={() => handleFindLawyersForCategory(subCat.titleHindi)}
                              className="px-3 py-2 bg-[#222] hover:bg-[#2c2c2c] text-gray-300 hover:text-white text-xs font-medium rounded-lg transition-all border border-white/10 cursor-pointer"
                              title="इस सेवा हेतु वकील देखें"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust & Guarantee Banner */}
      <div className="mt-16 bg-[#0c0c0c] border border-[#c5a059]/30 rounded-3xl p-8 sm:p-10 text-center max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center mx-auto mb-4 border border-[#c5a059]/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-white mb-2">
            100% प्रामाणिक एवं बार काउंसिल सत्यापित अधिवक्ता
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-light mb-6">
            वकील दुनिया पर उपलब्ध सभी सिविल व क्रिमिनल वकील संबंधित स्टेट बार काउंसिल से सत्यापित हैं। 
            आपकी व्यक्तिगत जानकारी एवं केस दस्तावेज पूर्णतः गोपनीय एवं सुरक्षित रहते हैं।
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('lawyers')}
              className="px-6 py-3 bg-[#c5a059] text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg cursor-pointer"
            >
              सभी वकील सूची देखें (Browse All Lawyers)
            </button>
            <button
              onClick={() => navigate('lawyer-portal')}
              className="px-6 py-3 bg-[#181818] text-white border border-white/10 hover:border-[#c5a059] font-bold text-xs uppercase tracking-widest rounded-xl hover:text-[#c5a059] transition-all cursor-pointer"
            >
              वकील हैं? पोर्टल में जुड़ें (Advocate Registration)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

