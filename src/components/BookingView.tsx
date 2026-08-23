import React, { useState, useEffect } from 'react';
import { useNavigationStore } from '../store';
import { Lawyer, BookingRequest } from '../types';
import { saveBookingToFirestore, loginWithGoogle } from '../firebase';
import { ArrowLeft, CheckCircle2, User, ShieldCheck, Lock, LogIn, Calendar, Phone, Sparkles } from 'lucide-react';

export function BookingView() {
  const { selectedLawyerId, selectedCaseType, navigate, user, userProfile, openAuthModal, setUser } = useNavigationStore();
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    case_type: selectedCaseType || 'Civil Consultation',
    appointment_date: '',
    consultation_mode: 'Online Consultation'
  });

  // Auto-fill from user profile when logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || userProfile?.displayName || user.displayName || '',
        mobile: prev.mobile || userProfile?.phone || ''
      }));
    }
  }, [user, userProfile]);

  useEffect(() => {
    if (!selectedLawyerId) {
      navigate('lawyers');
      return;
    }

    fetch('/api/lawyers')
      .then(res => res.json())
      .then(data => {
        const found = data.find((l: Lawyer) => l.id === selectedLawyerId);
        setLawyer(found || null);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching lawyer:", err);
        setLoading(false);
      });
  }, [selectedLawyerId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLawyerId || !lawyer) return;

    if (!user) {
      openAuthModal('signup', 'Please sign in or create an account to confirm your appointment.');
      return;
    }

    setSubmitting(true);
    await finalizeBooking();
  };

  const handleQuickGoogleSignIn = async () => {
    try {
      const { user: authedUser, profile } = await loginWithGoogle();
      setUser(authedUser, profile);
    } catch (err: any) {
      console.error("Quick Google sign-in failed:", err);
      openAuthModal('signup', 'Please sign in to proceed with your booking.');
    }
  };

  const finalizeBooking = async () => {
    try {
      if (!user || !lawyer) return;

      // 1. Save to Firebase Firestore
      let savedDocId = '';
      try {
        savedDocId = await saveBookingToFirestore({
          userId: user.uid,
          userEmail: user.email || '',
          name: formData.name,
          mobile: formData.mobile,
          case_type: formData.case_type,
          appointment_date: formData.appointment_date,
          lawyer_id: lawyer.id,
          lawyer_name: lawyer.name,
          lawyer_city: lawyer.city,
          lawyer_specialization: lawyer.specialization,
          consultation_mode: formData.consultation_mode,
          payment_status: 'Paid',
          created_at: new Date().toISOString()
        });
        setBookingId(savedDocId);
      } catch (fbErr) {
        console.warn("Firestore save warning, continuing to server sync:", fbErr);
      }

      // 2. Also sync to backend API
      const payload: BookingRequest = {
        ...formData,
        lawyer_id: lawyer.id,
        userId: user.uid,
        userEmail: user.email || ''
      };

      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok || savedDocId) {
        setSuccess(true);
        const text = `*New Booking on Vakil Duniya!*\n\n*Client:* ${formData.name}\n*User Email:* ${user.email}\n*Mobile:* ${formData.mobile}\n*Case Type:* ${formData.case_type}\n*Appointment Date:* ${formData.appointment_date}\n*Consultation Mode:* ${formData.consultation_mode}\n*Lawyer:* ${lawyer?.name}\n*Booking ID:* ${savedDocId || 'Confirmed'}`;
        const waLink = `https://api.whatsapp.com/send?phone=916263364561&text=${encodeURIComponent(text)}`;
        window.open(waLink, '_blank');
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="flex justify-center flex-1 py-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a059]"></div></div>;
  if (!lawyer) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
      <button 
        onClick={() => navigate('lawyers')}
        className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white mb-8 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2 text-[#c5a059] group-hover:text-white transition-colors" /> Back to Lawyers
      </button>

      {success ? (
        <div className="bg-[#111] border border-white/5 p-8 sm:p-12 text-center rounded-2xl shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <h2 className="text-3xl font-serif text-white mb-2">Appointment Scheduled!</h2>
          <p className="text-xs font-mono text-[#c5a059] uppercase tracking-widest mb-4">
            Saved to your Firebase account {bookingId ? `(Ref: ${bookingId})` : ''}
          </p>
          <p className="text-gray-400 font-sans font-light mb-8 max-w-xl mx-auto text-sm leading-relaxed">
            Your appointment with <span className="text-white font-medium">{lawyer.name}</span> on <span className="text-white font-medium">{formData.appointment_date}</span> has been securely recorded. 
            You can track this anytime in your account.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('my-bookings')}
              className="w-full sm:w-auto bg-[#c5a059] text-black px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded-lg"
            >
              View in My Consultations
            </button>
            <a 
              href={`https://api.whatsapp.com/send?phone=916263364561&text=${encodeURIComponent(`*New Booking Confirmation*\n\n*Client:* ${formData.name}\n*Lawyer:* ${lawyer.name}\n*Date:* ${formData.appointment_date}\n*Mode:* ${formData.consultation_mode}`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-green-600 text-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-green-500 transition-all rounded-lg inline-flex items-center justify-center gap-2"
            >
              WhatsApp Confirmation
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-[#111] border border-white/5 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
          {/* Summary Section */}
          <div className="p-8 md:p-10 bg-[#080808] border-b md:border-b-0 md:border-r border-white/5 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">Consultation Details</h3>
              <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 font-bold uppercase">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gray-800 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
                 {lawyer.image ? (
                   <img src={lawyer.image} alt={lawyer.name} className="w-full h-full object-cover" />
                 ) : (
                   <User className="w-8 h-8 text-white/50" />
                 )}
              </div>
              <div>
                <h4 className="font-serif text-lg text-white">{lawyer.name}</h4>
                <p className="text-[#c5a059] text-[11px] font-bold uppercase tracking-wider mt-0.5">{lawyer.specialization}</p>
                <p className="text-xs text-gray-400">{lawyer.city} • {lawyer.experience}</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-gray-400 mb-8 flex-grow">
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span className="text-xs uppercase text-gray-500">Location</span>
                 <span className="font-medium text-white">{lawyer.city}</span>
               </div>
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span className="text-xs uppercase text-gray-500">Experience</span>
                 <span className="font-medium text-white">{lawyer.experience}</span>
               </div>
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span className="text-xs uppercase text-gray-500">Languages</span>
                 <span className="font-medium text-white">{lawyer.language.join(', ')}</span>
               </div>
               {lawyer.bar_enrollment && (
                 <div className="flex justify-between border-b border-white/5 pb-2">
                   <span className="text-xs uppercase text-gray-500">Bar Enrollment</span>
                   <span className="font-mono text-[#c5a059] text-xs">{lawyer.bar_enrollment}</span>
                 </div>
               )}
            </div>

            <div className="mt-auto">
              <div className="bg-[#111] border border-white/5 p-4 rounded-xl">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Selected Mode</p>
                <p className="text-lg font-serif text-[#c5a059]">{formData.consultation_mode}</p>
                <p className="text-[11px] text-gray-500 mt-1">Direct scheduling with immediate WhatsApp notification.</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-serif text-white">Client Details</h3>
                {user && (
                  <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Signed In
                  </span>
                )}
              </div>

              {/* Notice when not signed in */}
              {!user && (
                <div className="mb-6 p-4 bg-[#18150f] border border-[#c5a059]/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#c5a059]/10 rounded-lg text-[#c5a059] shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#c5a059] mb-1">
                        Sign In Required Before Booking
                      </h4>
                      <p className="text-xs text-gray-400 mb-3">
                        Create an account or sign in so your appointment is securely stored and trackable in your portal.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openAuthModal('signup', 'Sign up or sign in to book your appointment with ' + lawyer.name)}
                          className="bg-[#c5a059] text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1.5"
                        >
                          <LogIn className="w-3.5 h-3.5" /> Sign In / Sign Up
                        </button>
                        <button
                          type="button"
                          onClick={handleQuickGoogleSignIn}
                          className="bg-[#222] text-white border border-white/10 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-[#282828] transition-all flex items-center gap-1.5"
                        >
                          Google 1-Click
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user && (
                <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 flex items-center justify-between">
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Booking as</span>
                    <span className="text-white font-medium">{userProfile?.displayName || user.displayName || user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="text-[10px] text-[#c5a059] hover:underline uppercase tracking-wider font-semibold"
                  >
                    Switch User
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">
                    Client Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full bg-[#050505] border border-white/10 py-2.5 px-3.5 rounded-lg text-white shadow-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] text-sm transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">
                    Mobile Number (10 Digits)
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    id="mobile"
                    required
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={handleChange}
                    maxLength={10}
                    className="block w-full bg-[#050505] border border-white/10 py-2.5 px-3.5 rounded-lg text-white shadow-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] text-sm transition-colors font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="case_type" className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">
                      Case Type
                    </label>
                    <select
                      id="case_type"
                      name="case_type"
                      value={formData.case_type}
                      onChange={handleChange}
                      className="block w-full bg-[#050505] border border-white/10 py-2.5 px-3 rounded-lg text-white shadow-sm focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] text-xs sm:text-sm transition-colors"
                    >
                      <optgroup label="🏛️ 1. सिविल मामले (Civil Law - दीवानी)">
                        <option value="संपत्ति विवाद - पैतृक बंटवारा व कब्जा">संपत्ति विवाद - पैतृक बंटवारा व कब्जा</option>
                        <option value="संपत्ति विवाद - स्टे ऑर्डर व टाइटल सूट">संपत्ति विवाद - स्टे ऑर्डर व टाइटल सूट</option>
                        <option value="पारिवारिक - तलाक व भरण-पोषण (गुजारा भत्ता)">पारिवारिक - तलाक व भरण-पोषण (गुजारा भत्ता)</option>
                        <option value="पारिवारिक - बच्चों की कस्टडी व गार्जियनशिप">पारिवारिक - बच्चों की कस्टडी व गार्जियनशिप</option>
                        <option value="अनुबंध व व्यापार - धन वसूली व हर्जाना वाद">अनुबंध व व्यापार - धन वसूली व हर्जाना वाद</option>
                        <option value="अनुबंध व व्यापार - एग्रीमेंट व पार्टनरशिप विवाद">अनुबंध व व्यापार - एग्रीमेंट व पार्टनरशिप विवाद</option>
                        <option value="वसीयत व ड्राफ्टिंग - उत्तराधिकार प्रमाण पत्र">वसीयत व ड्राफ्टिंग - उत्तराधिकार प्रमाण पत्र</option>
                        <option value="वसीयत व ड्राफ्टिंग - वाद पत्र (Plaint) व लिखित कथन (WS)">वसीयत व ड्राफ्टिंग - वाद पत्र (Plaint) व लिखित कथन</option>
                      </optgroup>
                      <optgroup label="🚨 2. क्रिमिनल मामले (Criminal Law - आपराधिक)">
                        <option value="एफआईआर व जांच - एफआईआर दर्ज / जीरो एफआईआर">एफआईआर व जांच - एफआईआर दर्ज / जीरो एफआईआर</option>
                        <option value="एफआईआर व जांच - धारा 156(3) CrPC मजिस्ट्रेट आवेदन">एफआईआर व जांच - धारा 156(3) CrPC आवेदन</option>
                        <option value="जमानत - अग्रिम जमानत (Anticipatory Bail - Sec 438)">जमानत - अग्रिम जमानत (Anticipatory Bail)</option>
                        <option value="जमानत - नियमित जमानत (Regular Bail - Sec 439)">जमानत - नियमित जमानत (Regular Bail)</option>
                        <option value="ट्रायल व राहत - झूठी FIR रद्द (Quashing Sec 482 CrPC)">ट्रायल व राहत - झूठी FIR रद्द (Quashing Sec 482)</option>
                        <option value="ट्रायल व राहत - डिस्चार्ज एप्लीकेशन व जिरह">ट्रायल व राहत - डिस्चार्ज एप्लीकेशन व जिरह</option>
                        <option value="अपील व सजा - हाई कोर्ट में आपराधिक अपील">अपील व सजा - हाई कोर्ट में आपराधिक अपील</option>
                      </optgroup>
                      <optgroup label="अन्य सामान्य कानूनी परामर्श (General)">
                        <option value="Civil Consultation">सामान्य सिविल परामर्श (General Civil)</option>
                        <option value="Criminal Defense">सामान्य आपराधिक परामर्श (General Criminal)</option>
                        <option value="Corporate / Startup">कॉर्पोरेट / स्टार्टअप व कंपनी लॉ</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="consultation_mode" className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">
                      Mode
                    </label>
                    <select
                      id="consultation_mode"
                      name="consultation_mode"
                      value={formData.consultation_mode}
                      onChange={handleChange}
                      className="block w-full bg-[#050505] border border-white/10 py-2.5 px-3 rounded-lg text-white shadow-sm focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] text-sm transition-colors"
                    >
                      <option value="Online Consultation">Online Consultation</option>
                      <option value="Offline Consultation">Offline Consultation</option>
                      <option value="Both (Online & Offline)">Both (Online & Offline)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="appointment_date" className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">
                    Preferred Appointment Date
                  </label>
                  <input
                    type="date"
                    name="appointment_date"
                    id="appointment_date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.appointment_date}
                    onChange={handleChange}
                    className="block w-full bg-[#050505] border border-white/10 py-2.5 px-3.5 rounded-lg text-white shadow-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] text-sm transition-colors"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#c5a059] text-black px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg relative overflow-hidden group"
                  >
                    {submitting ? 'Confirming with Firebase...' : (user ? 'Confirm & Book Appointment' : 'Sign In & Book Appointment')}
                  </button>
                  <p className="mt-3 text-[10px] text-center text-gray-500 uppercase tracking-wider">
                    Instant confirmation • Synced to Firebase Firestore
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
