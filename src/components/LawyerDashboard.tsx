import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Award, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  DollarSign, 
  Send, 
  LogOut, 
  ExternalLink,
  Camera,
  Check,
  RefreshCw,
  Sparkles,
  Building,
  Languages,
  TrendingUp,
  AlertCircle,
  Upload,
  PhoneCall,
  MessageCircle,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lawyer, AppointmentStatus } from '../types';
import { 
  FirestoreBookingData, 
  subscribeToLawyerBookings, 
  updateBookingStatus, 
  updateLawyerProfileInFirestore 
} from '../firebase';
import { useNavigationStore } from '../store';

interface LawyerDashboardProps {
  lawyer: Lawyer | null;
  onUpdateProfile: (lawyer: Lawyer) => void;
  onLogout: () => void;
}

export function LawyerDashboard({ lawyer, onUpdateProfile, onLogout }: LawyerDashboardProps) {
  const { user, userProfile, logout } = useNavigationStore();
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'certificate'>('bookings');
  const [bookings, setBookings] = useState<FirestoreBookingData[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Accepted' | 'Disposed' | 'Cancelled'>('ALL');
  
  // Status update modal / remark state
  const [selectedBooking, setSelectedBooking] = useState<FirestoreBookingData | null>(null);
  const [newStatus, setNewStatus] = useState<AppointmentStatus>('Accepted');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [notification, setNotification] = useState('');

  // Profile edit form state
  const [editPhone, setEditPhone] = useState(lawyer?.mobile_number || '');
  const [editWhatsapp, setEditWhatsapp] = useState(lawyer?.whatsapp_number || lawyer?.mobile_number || '');
  const [editOfficePhone, setEditOfficePhone] = useState(lawyer?.office_phone || '');
  const [editCity, setEditCity] = useState(lawyer?.city || '');
  const [editAddress, setEditAddress] = useState(lawyer?.address || '');
  const [editBio, setEditBio] = useState(lawyer?.bio || '');
  const [editMode, setEditMode] = useState(lawyer?.consultation_mode || 'Online Consultation');
  const [editImage, setEditImage] = useState(lawyer?.image || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Availability status toggle
  const [isAvailable, setIsAvailable] = useState(true);

  const lawyerId = lawyer?.id || (user ? `l_${user.uid}` : '');
  const lawyerName = lawyer?.name || user?.displayName || 'Advocate';

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Real-time booking subscription
  useEffect(() => {
    if (!lawyerId) return;
    setLoadingBookings(true);

    const unsubscribe = subscribeToLawyerBookings(lawyerId, lawyerName, (updatedList) => {
      setBookings(updatedList);
      setLoadingBookings(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [lawyerId, lawyerName]);

  // Sync edit form if lawyer prop changes
  useEffect(() => {
    if (lawyer) {
      setEditPhone(lawyer.mobile_number || '');
      setEditWhatsapp(lawyer.whatsapp_number || lawyer.mobile_number || '');
      setEditOfficePhone(lawyer.office_phone || '');
      setEditCity(lawyer.city || '');
      setEditAddress(lawyer.address || '');
      setEditBio(lawyer.bio || '');
      setEditMode(lawyer.consultation_mode || 'Online Consultation');
      setEditImage(lawyer.image || '');
    }
  }, [lawyer]);

  // Photo upload handler
  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file (JPG, PNG, WEBP)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditImage(event.target.result as string);
          showNotification('Photo uploaded! Click "Save Changes" to save to Firebase.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle status update
  const handleSaveStatus = async () => {
    if (!selectedBooking?.id) return;
    setIsUpdatingStatus(true);
    try {
      await updateBookingStatus(selectedBooking.id, newStatus, statusRemarks);
      showNotification(`Appointment marked as ${newStatus}`);
      setSelectedBooking(null);
      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: newStatus, remarks: statusRemarks } : b));
    } catch (e) {
      console.error(e);
      showNotification("Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle profile update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lawyerId) return;
    setSavingProfile(true);

    const updates: Partial<Lawyer> = {
      mobile_number: editPhone,
      whatsapp_number: editWhatsapp,
      office_phone: editOfficePhone,
      city: editCity,
      address: editAddress,
      bio: editBio,
      consultation_mode: editMode,
      image: editImage
    };

    try {
      const success = await updateLawyerProfileInFirestore(lawyerId, updates);
      if (success) {
        const updatedLawyer = { ...(lawyer || {}), ...updates } as Lawyer;
        onUpdateProfile(updatedLawyer);
        showNotification("Advocate Profile updated successfully in Firebase!");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error saving profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Open WhatsApp to client
  const handleWhatsAppClient = (booking: FirestoreBookingData) => {
    const clientPhone = booking.mobile.replace(/\D/g, '');
    const cleanPhone = clientPhone.startsWith('91') ? clientPhone : `91${clientPhone}`;
    const text = encodeURIComponent(
      `Namaste ${booking.name}, I am ${lawyerName} from Vakil Duniya regarding your legal consultation request for "${booking.case_type}" on ${booking.appointment_date}. Please let me know if this time works for you.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const acceptedCount = bookings.filter(b => b.status === 'Accepted').length;
  const completedCount = bookings.filter(b => b.status === 'Disposed').length;
  const totalRevenue = bookings.filter(b => b.status !== 'Cancelled').length * (lawyer?.consultation_fee || 599);

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-[#c5a059] text-black font-semibold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Advocate Banner */}
      <div className="bg-[#0e0e0e] border border-[#c5a059]/40 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#c5a059] shadow-lg shrink-0">
              <img 
                src={lawyer?.image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80"} 
                alt={lawyerName} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
                  {lawyerName}
                </h1>
                <span className="inline-flex items-center gap-1 bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> Bar Verified Advocate
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-1.5 font-sans">
                <span className="font-mono text-[#c5a059]">Enrollment: {lawyer?.bar_enrollment || 'MP/1024/2021'}</span>
                <span>•</span>
                <span>{lawyer?.specialization || 'Civil & Property Dispute'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-500" /> {lawyer?.city || 'Jabalpur'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                isAvailable 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {isAvailable ? 'Available for Consultations' : 'In Court (Busy)'}
            </button>

            <button
              onClick={async () => {
                await logout();
                onLogout();
              }}
              className="px-3.5 py-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/40 text-gray-400 hover:text-red-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span className="uppercase tracking-wider">Total Consultations</span>
            <Calendar className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="text-2xl font-bold text-white">{bookings.length}</div>
          <p className="text-[11px] text-gray-500 mt-1">All time bookings</p>
        </div>

        <div className="bg-[#0e0e0e] border border-amber-500/30 rounded-2xl p-5">
          <div className="flex items-center justify-between text-amber-400 text-xs mb-2">
            <span className="uppercase tracking-wider">Pending Action</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{pendingCount}</div>
          <p className="text-[11px] text-gray-500 mt-1">Needs review</p>
        </div>

        <div className="bg-[#0e0e0e] border border-green-500/30 rounded-2xl p-5">
          <div className="flex items-center justify-between text-green-400 text-xs mb-2">
            <span className="uppercase tracking-wider">Completed / Disposed</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-300">{completedCount}</div>
          <p className="text-[11px] text-gray-500 mt-1">Consultation completed</p>
        </div>

        <div className="bg-[#0e0e0e] border border-[#c5a059]/40 rounded-2xl p-5">
          <div className="flex items-center justify-between text-[#c5a059] text-xs mb-2">
            <span className="uppercase tracking-wider">Practice Mode</span>
            <Scale className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="text-base font-bold text-white truncate">{lawyer?.consultation_mode || 'Online & Chamber'}</div>
          <p className="text-[11px] text-gray-500 mt-1">Direct Consultation</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 mb-6 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'border-[#c5a059] text-[#c5a059]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Client Appointments ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#c5a059] text-[#c5a059]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Chamber & Profile Settings
        </button>

        <button
          onClick={() => setActiveTab('certificate')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'certificate'
              ? 'border-[#c5a059] text-[#c5a059]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          Digital Advocate ID Card
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CLIENT APPOINTMENTS                                                */}
      {/* ========================================================================= */}
      {activeTab === 'bookings' && (
        <div>
          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'Pending', 'Accepted', 'Disposed', 'Cancelled'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                    statusFilter === filter
                      ? 'bg-[#c5a059] text-black font-bold'
                      : 'bg-[#141414] text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-400">
              Showing <span className="text-white font-bold">{filteredBookings.length}</span> consultations
            </div>
          </div>

          {/* Bookings List */}
          {loadingBookings ? (
            <div className="text-center py-16 bg-[#0e0e0e] border border-white/10 rounded-2xl">
              <RefreshCw className="w-8 h-8 text-[#c5a059] animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-400">Syncing consultations with Firestore...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-[#0e0e0e] border border-white/10 rounded-2xl p-6">
              <Scale className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Consultations Found</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                {statusFilter === 'ALL' 
                  ? 'No clients have booked an appointment with you yet. Once a client books on Vakil Duniya, it will appear here in real time.'
                  : `No appointments with status "${statusFilter}".`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredBookings.map((booking) => {
                const isPending = booking.status === 'Pending';
                const isAccepted = booking.status === 'Accepted';
                const isDisposed = booking.status === 'Disposed';
                const isCancelled = booking.status === 'Cancelled';

                return (
                  <div
                    key={booking.id}
                    className="bg-[#0e0e0e] border border-white/10 hover:border-[#c5a059]/40 rounded-2xl p-5 transition-all shadow-lg"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Client Details */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1c1c1c] text-[#c5a059] border border-[#c5a059]/40 flex items-center justify-center font-bold text-sm">
                            {booking.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white">{booking.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span className="font-mono text-gray-300">{booking.mobile}</span>
                              {booking.userEmail && <span>• {booking.userEmail}</span>}
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            isPending ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                            isAccepted ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                            isDisposed ? 'bg-green-500/20 text-green-300 border-green-500/40' :
                            'bg-red-500/20 text-red-300 border-red-500/40'
                          }`}>
                            {booking.status || 'Pending'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-300 pt-1">
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span>Matter: <strong className="text-white">{booking.case_type}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span>Date: <strong className="text-white">{booking.appointment_date}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span>Mode: <strong className="text-white">{booking.consultation_mode || 'Online Consultation'}</strong></span>
                          </div>
                        </div>

                        {booking.remarks && (
                          <div className="p-2.5 bg-[#141414] rounded-lg text-xs text-gray-400 border border-white/5">
                            <span className="text-[#c5a059] font-semibold">Remarks/Notes:</span> {booking.remarks}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                        {/* Direct WhatsApp button */}
                        <button
                          onClick={() => handleWhatsAppClient(booking)}
                          className="px-3.5 py-2 bg-green-600/20 hover:bg-green-600 border border-green-500/40 text-green-300 hover:text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                          title="Message on WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" /> WhatsApp
                        </button>

                        {/* Direct Call button */}
                        <a
                          href={`tel:${booking.mobile}`}
                          className="px-3.5 py-2 bg-[#1c1c1c] hover:bg-[#252525] border border-white/10 text-gray-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>

                        {/* Update Status Button */}
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setNewStatus((booking.status as AppointmentStatus) || 'Accepted');
                            setStatusRemarks(booking.remarks || '');
                          }}
                          className="px-4 py-2 bg-[#c5a059] hover:brightness-110 text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CHAMBER & PROFILE SETTINGS                                         */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white mb-1">Chamber & Advocate Profile</h3>
            <p className="text-xs text-gray-400 mb-6">Updates are synced directly into Firebase Firestore</p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Photo Upload Section */}
              <div className="p-4 bg-[#141414] border border-[#c5a059]/30 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#c5a059] shrink-0 shadow-md">
                  <img src={editImage || lawyer?.image} alt={lawyerName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block mb-1">
                    Advocate Profile Photo (तस्वीर बदलें)
                  </span>
                  <p className="text-[11px] text-gray-400 mb-2">Upload a professional portrait or chamber attire photo</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoFile}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#c5a059]/20 border border-[#c5a059]/50 text-[#c5a059] hover:bg-[#c5a059] hover:text-black rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload New Photo
                  </button>
                </div>
              </div>

              {/* Consultation Mode */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Consultation Mode & Practice Availability</label>
                <select
                  value={editMode}
                  onChange={(e) => setEditMode(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="Online Consultation" className="bg-[#111]">Online Video & Phone</option>
                  <option value="Chamber Consultation" className="bg-[#111]">Chamber / In-Office</option>
                  <option value="Online & Chamber Consultation" className="bg-[#111]">Both Online & Chamber</option>
                </select>
              </div>

              {/* Contact Numbers (Calling, WhatsApp, Office) */}
              <div className="p-3.5 bg-[#141414] border border-white/10 rounded-xl space-y-3">
                <span className="text-[11px] font-bold text-[#c5a059] uppercase tracking-wider block">
                  Contact Information (संपर्क विवरण)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">Primary Calling Mobile *</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-green-400" /> WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-[#c5a059]" /> Chamber / Office No.
                    </label>
                    <input
                      type="tel"
                      value={editOfficePhone}
                      onChange={(e) => setEditOfficePhone(e.target.value)}
                      placeholder="0761-2458900"
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>
              </div>

              {/* City & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">City of Practice</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Chamber / Office Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Chamber No., Court Complex or Landmark"
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Legal Bio & Practice Summary</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="py-3.5 px-6 bg-[#c5a059] hover:brightness-110 text-black font-bold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes to Firebase
              </button>
            </form>
          </div>

          {/* Right: Live Preview */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Live Card Preview for Clients</h4>
            <div className="bg-[#0e0e0e] border border-[#c5a059]/40 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#c5a059] mx-auto mb-4">
                <img src={editImage || lawyer?.image} alt={lawyerName} className="w-full h-full object-cover" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">{lawyerName}</h3>
                <span className="text-xs text-[#c5a059] font-medium block mt-0.5">{lawyer?.specialization}</span>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{editBio || lawyer?.bio}</p>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-400">{editCity}</span>
                  <span className="text-[#c5a059] font-medium">{editMode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DIGITAL ADVOCATE ID CARD & CERTIFICATE                             */}
      {/* ========================================================================= */}
      {activeTab === 'certificate' && (
        <div className="max-w-xl mx-auto">
          <div className="bg-gradient-to-b from-[#161616] to-[#0a0a0a] border-2 border-[#c5a059] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#c5a059]/30 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#c5a059] rounded flex items-center justify-center font-bold text-black text-xl">
                  V
                </div>
                <div>
                  <h4 className="text-lg font-serif font-bold text-white tracking-wide">VAKIL DUNIYA</h4>
                  <p className="text-[9px] uppercase tracking-widest text-[#c5a059]">Verified Advocate Credential</p>
                </div>
              </div>
              <ShieldCheck className="w-8 h-8 text-[#c5a059]" />
            </div>

            {/* Advocate Details */}
            <div className="flex items-center gap-5 mb-6">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#c5a059] shrink-0 shadow-lg">
                <img src={lawyer?.image} alt={lawyerName} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-white">{lawyerName}</h3>
                <div className="inline-block bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 text-xs font-mono font-bold px-2.5 py-0.5 rounded my-1">
                  Bar Reg: {lawyer?.bar_enrollment || 'MP/1024/2021'}
                </div>
                <p className="text-xs text-gray-300">{lawyer?.specialization}</p>
                <p className="text-xs text-gray-400 mt-0.5">{lawyer?.city}, {lawyer?.state || 'India'}</p>
              </div>
            </div>

            {/* QR & Verification info */}
            <div className="bg-[#111] border border-white/10 rounded-xl p-4 flex items-center justify-between text-xs mb-4">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Verification Status</span>
                <span className="text-green-400 font-bold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Bar Council Verified
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">Portal Fee: Paid (₹199)</span>
              </div>
              <div className="w-16 h-16 bg-white p-1 rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://vakilduniya.in/lawyer/${lawyerId}`} 
                  alt="QR" 
                  className="w-full h-full"
                />
              </div>
            </div>

            <p className="text-center text-[10px] text-gray-500 italic">
              Official Digital Identity issued by Vakil Duniya Legal Network
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATUS UPDATE MODAL                                                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111] border border-[#c5a059]/40 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-1">Update Appointment Status</h3>
              <p className="text-xs text-gray-400 mb-4">
                Client: <strong className="text-white">{selectedBooking.name}</strong> • Matter: {selectedBooking.case_type}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Select New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as AppointmentStatus)}
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="Accepted">Accepted (स्वीकार करें)</option>
                    <option value="Disposed">Disposed / Completed (परामर्श संपन्न)</option>
                    <option value="Cancelled">Cancelled (रद्द करें)</option>
                    <option value="Pending">Pending (लंबित)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Hearing / Advocate Remarks</label>
                  <textarea
                    rows={3}
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    placeholder="e.g. Consulted via Google Meet. Advised on filing legal notice under Section 138."
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    className="flex-1 py-3 border border-white/20 text-gray-400 hover:text-white text-xs font-bold uppercase rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveStatus}
                    disabled={isUpdatingStatus}
                    className="flex-1 py-3 bg-[#c5a059] hover:brightness-110 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isUpdatingStatus ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save in Firestore
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
