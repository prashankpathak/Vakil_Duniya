import { useState, useEffect } from 'react';
import { useNavigationStore } from '../store';
import { subscribeToUserBookings, FirestoreBookingData } from '../firebase';
import { Calendar, Clock, User, ArrowLeft, PlusCircle, CheckCircle2, MessageCircle, ShieldCheck, MapPin, AlertCircle, XCircle, Archive } from 'lucide-react';

export function MyBookingsView() {
  const { user, userProfile, navigate, openAuthModal } = useNavigationStore();
  const [bookings, setBookings] = useState<FirestoreBookingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserBookings(user.uid, (data) => {
      setBookings(data);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10 w-full">
        <div className="bg-[#111] border border-white/5 p-10 rounded-2xl max-w-lg mx-auto">
          <div className="w-12 h-12 bg-[#c5a059]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#c5a059]">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif text-white mb-2">Sign In Required</h2>
          <p className="text-gray-400 text-sm mb-6">
            Please sign in to view your scheduled legal consultations and appointment history.
          </p>
          <button
            onClick={() => openAuthModal('login', 'Sign in to access your consultations.')}
            className="bg-[#c5a059] text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded-lg"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <button 
            onClick={() => navigate('home')}
            className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white mb-3 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-[#c5a059] group-hover:text-white transition-colors" /> Back to Home
          </button>
          <h1 className="text-3xl font-serif text-white flex items-center gap-3">
            My Consultations <ShieldCheck className="w-6 h-6 text-[#c5a059]" />
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Logged in as <span className="text-[#c5a059] font-medium">{userProfile?.displayName || user.displayName || user.email}</span> ({user.email})
          </p>
        </div>

        <button
          onClick={() => navigate('lawyers')}
          className="inline-flex items-center justify-center gap-2 bg-[#c5a059] text-black px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Book New Consultation
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a059] mb-4"></div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Loading your bookings from Firestore...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-[#0e0e0e] border border-white/5 rounded-2xl p-12 text-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 bg-[#161616] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5 text-[#c5a059]">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif text-white mb-2">No Bookings Yet</h3>
          <p className="text-sm text-gray-400 font-light mb-6">
            You haven't scheduled any lawyer appointments yet. Find verified specialists in Civil, Criminal, Family, or Corporate law.
          </p>
          <button
            onClick={() => navigate('lawyers')}
            className="bg-[#c5a059] text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded-lg"
          >
            Explore Verified Lawyers
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((b) => {
            const waMessage = `*Booking Details:*\n• ID: ${b.id}\n• Client: ${b.name}\n• Lawyer: ${b.lawyer_name || b.lawyer_id}\n• Date: ${b.appointment_date}\n• Mode: ${b.consultation_mode}`;
            const waUrl = `https://api.whatsapp.com/send?phone=916263364561&text=${encodeURIComponent(waMessage)}`;

            return (
              <div 
                key={b.id} 
                className="bg-[#0d0d0d] border border-white/10 hover:border-[#c5a059]/40 rounded-xl p-6 relative flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Top Status & Date */}
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                      ID: {b.id?.slice(0, 10)}...
                    </span>
                    {b.status === 'Accepted' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Accepted / Confirmed
                      </span>
                    ) : b.status === 'Disposed' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Archive className="w-3 h-3" /> Case Disposed / Completed
                      </span>
                    ) : b.status === 'Cancelled' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                        <XCircle className="w-3 h-3" /> Cancelled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3 h-3" /> Pending Review
                      </span>
                    )}
                  </div>

                  {/* Lawyer Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-serif text-white group-hover:text-[#c5a059] transition-colors">
                      {b.lawyer_name || "Advocate Consultation"}
                    </h3>
                    <p className="text-xs font-medium text-[#c5a059] uppercase tracking-wider mt-0.5">
                      {b.case_type}
                    </p>
                    {b.lawyer_city && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-500" /> {b.lawyer_city}
                      </p>
                    )}
                  </div>

                  {/* Booking details grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#141414] p-3 rounded-lg border border-white/5 mb-4">
                    <div>
                      <span className="text-[10px] uppercase text-gray-500 block mb-0.5">Appointment Date</span>
                      <span className="text-white font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#c5a059]" /> {b.appointment_date}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-gray-500 block mb-0.5">Mode</span>
                      <span className="text-white font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#c5a059]" /> {b.consultation_mode || 'Online Consultation'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-gray-500 block mb-0.5">Client Mobile</span>
                      <span className="text-white font-mono">{b.mobile}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-gray-500 block mb-0.5">Booked On</span>
                      <span className="text-gray-400">
                        {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Support / WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
