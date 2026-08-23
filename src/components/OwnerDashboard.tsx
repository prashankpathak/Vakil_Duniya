import React, { useState, useEffect } from 'react';
import { useNavigationStore } from '../store';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Trash2, 
  Calendar, 
  Scale, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Archive, 
  Plus, 
  Search, 
  Filter, 
  MessageCircle, 
  Phone, 
  Mail, 
  LogOut, 
  AlertCircle,
  BarChart3,
  UserPlus,
  RefreshCw,
  Eye
} from 'lucide-react';
import { 
  updateBookingStatus,
  fetchLawyersFromFirestore,
  saveLawyerToFirestore,
  deleteLawyerFromFirestore,
  updateLawyerApprovalStatus,
  fetchUsersFromFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore,
  fetchAllBookingsFromFirestore,
  deleteBookingFromFirestore
} from '../firebase';
import { AppointmentStatus, PlatformUser, Lawyer } from '../types';

interface Booking {
  id: string;
  name: string;
  mobile: string;
  userEmail?: string;
  userId?: string;
  case_type: string;
  appointment_date: string;
  status: AppointmentStatus;
  remarks?: string;
  lawyer_id: string;
  payment_status: string;
  consultation_mode?: string;
  created_at: string;
}

export function OwnerDashboard() {
  const { navigate, user, logout } = useNavigationStore();
  const [activeTab, setActiveTab] = useState<'appointments' | 'lawyers' | 'users'>('appointments');
  const [lawyerApprovalFilter, setLawyerApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  // Data states
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [usersList, setUsersList] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals / forms
  const [isAddingLawyer, setIsAddingLawyer] = useState(false);
  const [newLawyer, setNewLawyer] = useState({
    name: '',
    specialization: 'Civil & Property Dispute',
    experience: '5 Years',
    city: 'Jabalpur',
    language: 'Hindi, English',
    consultation_fee: 599,
    mobile_number: '',
    consultation_mode: 'Online Consultation',
    bar_enrollment: '',
    image: ''
  });

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'client' as 'admin' | 'client'
  });

  // Admin access validation
  const checkAdminAuth = () => {
    if (user?.email?.toLowerCase() === 'prashankpathak@gmail.com') return true;
    try {
      const stored = localStorage.getItem('vd_admin_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email === 'prashankpathak@gmail.com') return true;
      }
    } catch (e) {}
    return false;
  };

  const isAdmin = checkAdminAuth();

  const handleAdminLogout = () => {
    localStorage.removeItem('vd_admin_auth');
    if (user) logout();
    navigate('owner-login');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch from Firestore first for durable persistence
      const [fbLawyers, fbBookings, fbUsers] = await Promise.all([
        fetchLawyersFromFirestore(),
        fetchAllBookingsFromFirestore(),
        fetchUsersFromFirestore()
      ]);

      if (fbLawyers && fbLawyers.length > 0) {
        setLawyers(fbLawyers);
      }
      if (fbBookings && fbBookings.length > 0) {
        const normalized = fbBookings.map((b: any) => ({
          ...b,
          status: (b.status as AppointmentStatus) || 'Pending'
        }));
        setBookings(normalized);
      }
      if (fbUsers && fbUsers.length > 0) {
        setUsersList(fbUsers);
      }

      // 2. Also query backend API
      const [lawyersRes, bookingsRes, usersRes] = await Promise.all([
        fetch('/api/lawyers'),
        fetch('/api/bookings'),
        fetch('/api/users')
      ]);

      if (lawyersRes.ok) {
        const data = await lawyersRes.json();
        if (Array.isArray(data) && data.length > 0) setLawyers(data);
      }

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map((b: any) => ({
            ...b,
            status: (b.status as AppointmentStatus) || 'Pending'
          }));
          setBookings(normalized);
        }
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        if (Array.isArray(data) && data.length > 0) setUsersList(data);
      }
    } catch (e) {
      console.error("Error fetching admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // --- APPOINTMENT STATUS ACTIONS ---
  const handleUpdateStatus = async (bookingId: string, newStatus: AppointmentStatus, remarks?: string) => {
    try {
      // Optimistic update
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus, remarks: remarks || b.remarks } : b));
      
      const success = await updateBookingStatus(bookingId, newStatus, remarks);
      if (success) {
        showNotification(`Appointment status updated to ${newStatus}`);
      } else {
        fetchData();
      }
    } catch (err) {
      console.error(err);
      fetchData();
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this appointment record?")) return;
    try {
      // Delete from Firestore
      await deleteBookingFromFirestore(id);
      
      // Delete from API
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      setBookings(prev => prev.filter(b => b.id !== id));
      showNotification("Appointment deleted successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  // --- LAWYERS ACTIONS ---
  const handleAddLawyer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lawyerToSave: Lawyer = {
        id: `l${Date.now()}`,
        name: newLawyer.name,
        specialization: newLawyer.specialization,
        experience: newLawyer.experience,
        city: newLawyer.city,
        language: newLawyer.language.split(',').map(l => l.trim()),
        consultation_fee: Number(newLawyer.consultation_fee || 599),
        mobile_number: newLawyer.mobile_number,
        consultation_mode: newLawyer.consultation_mode,
        bar_enrollment: newLawyer.bar_enrollment,
        image: newLawyer.image,
        rating: 5.0
      };

      // 1. Save to Firestore
      await saveLawyerToFirestore(lawyerToSave);

      // 2. Save to API
      await fetch('/api/lawyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lawyerToSave)
      });

      setIsAddingLawyer(false);
      setNewLawyer({
        name: '',
        specialization: 'Civil & Property Dispute',
        experience: '5 Years',
        city: 'Jabalpur',
        language: 'Hindi, English',
        consultation_fee: 599,
        mobile_number: '',
        consultation_mode: 'Online Consultation',
        bar_enrollment: '',
        image: ''
      });
      fetchData();
      showNotification("Lawyer registered and saved to Firebase successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLawyer = async (id: string) => {
    if (!confirm("Are you sure you want to remove this lawyer from Vakil Duniya?")) return;
    try {
      // Delete from Firestore
      await deleteLawyerFromFirestore(id);
      
      // Delete from API
      await fetch(`/api/lawyers/${id}`, { method: 'DELETE' });
      setLawyers(prev => prev.filter(l => l.id !== id));
      showNotification("Lawyer removed from database successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveLawyer = async (id: string, name: string) => {
    try {
      const ok = await updateLawyerApprovalStatus(id, 'approved');
      if (ok) {
        setLawyers(prev => prev.map(l => l.id === id ? { ...l, approval_status: 'approved', is_verified: true } : l));
        showNotification(`Advocate ${name} has been APPROVED and activated on Vakil Duniya.`);
      } else {
        showNotification(`Failed to approve advocate. Please try again.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectLawyer = async (id: string, name: string) => {
    const reason = prompt(`Enter rejection reason for Advocate ${name}:`, "Bar Council enrollment verification unsuccessful or incomplete details");
    if (reason === null) return;
    try {
      const ok = await updateLawyerApprovalStatus(id, 'rejected', reason);
      if (ok) {
        setLawyers(prev => prev.map(l => l.id === id ? { ...l, approval_status: 'rejected', is_verified: false, approval_remarks: reason } : l));
        showNotification(`Advocate ${name} marked as REJECTED.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetPendingLawyer = async (id: string, name: string) => {
    try {
      const ok = await updateLawyerApprovalStatus(id, 'pending');
      if (ok) {
        setLawyers(prev => prev.map(l => l.id === id ? { ...l, approval_status: 'pending', is_verified: false } : l));
        showNotification(`Advocate ${name} status changed to PENDING review.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- USERS ACTIONS ---
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userToSave: PlatformUser = {
        id: `u${Date.now()}`,
        name: newUser.name || newUser.email.split('@')[0],
        email: newUser.email,
        mobile: newUser.mobile,
        role: newUser.role,
        created_at: new Date().toISOString()
      };

      // 1. Save to Firestore
      await saveUserToFirestore(userToSave);

      // 2. Save to API
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userToSave)
      });

      setIsAddingUser(false);
      setNewUser({ name: '', email: '', mobile: '', role: 'client' });
      fetchData();
      showNotification("User account saved to Firebase successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (email?.toLowerCase() === 'prashankpathak@gmail.com') {
      alert("Cannot delete the Super Administrator account.");
      return;
    }
    if (!confirm(`Are you sure you want to remove user "${email}"?`)) return;
    try {
      // Delete from Firestore
      await deleteUserFromFirestore(id);

      // Delete from API
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      setUsersList(prev => prev.filter(u => u.id !== id && u.email !== id));
      showNotification("User removed successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  // If not authenticated as admin, prompt login
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center relative z-10 w-full">
        <div className="bg-[#111] border border-red-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20 text-red-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif text-white mb-2">Admin Access Required</h2>
          <p className="text-xs text-gray-400 font-sans mb-6">
            This dashboard is restricted to authorized platform administrators only.
          </p>
          <button
            onClick={() => navigate('owner-login')}
            className="w-full bg-[#c5a059] text-black px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded-lg"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.mobile.includes(searchTerm) ||
      (b.userEmail && b.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      b.case_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Lawyers
  const filteredLawyers = lawyers.filter(l => {
    const matchesSearch = searchTerm === '' ||
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.bar_enrollment && l.bar_enrollment.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.mobile_number && l.mobile_number.includes(searchTerm));

    const isPending = l.approval_status === 'pending' || (l.is_verified === false && l.approval_status !== 'rejected');
    const isApproved = l.approval_status === 'approved' || (l.is_verified === true && l.approval_status !== 'pending' && l.approval_status !== 'rejected');
    const isRejected = l.approval_status === 'rejected';

    if (lawyerApprovalFilter === 'pending') return matchesSearch && isPending;
    if (lawyerApprovalFilter === 'approved') return matchesSearch && isApproved;
    if (lawyerApprovalFilter === 'rejected') return matchesSearch && isRejected;
    return matchesSearch;
  });

  // Filtered Users
  const filteredUsers = usersList.filter(u =>
    searchTerm === '' ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.mobile && u.mobile.includes(searchTerm))
  );

  // Statistics calculation
  const totalPending = bookings.filter(b => b.status === 'Pending').length;
  const totalAccepted = bookings.filter(b => b.status === 'Accepted').length;
  const totalDisposed = bookings.filter(b => b.status === 'Disposed').length;
  const totalCancelled = bookings.filter(b => b.status === 'Cancelled').length;

  const pendingLawyersCount = lawyers.filter(l => l.approval_status === 'pending' || (l.is_verified === false && l.approval_status !== 'rejected')).length;
  const approvedLawyersCount = lawyers.filter(l => l.approval_status === 'approved' || (l.is_verified === true && l.approval_status !== 'pending' && l.approval_status !== 'rejected')).length;
  const rejectedLawyersCount = lawyers.filter(l => l.approval_status === 'rejected').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161616] border border-[#c5a059] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-[#c5a059]" />
          <span className="text-xs font-sans tracking-wide">{actionMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#c5a059] mb-1">
            <ShieldCheck className="w-4 h-4" /> Vakil Duniya Platform Admin
          </div>
          <h1 className="text-3xl font-serif text-white">Administrator Control Panel</h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Role: <span className="text-[#c5a059] font-medium">Super Administrator</span> (Prashank Pathak)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#161616] hover:bg-[#222] border border-white/10 text-gray-300 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh All Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#c5a059] ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="bg-[#0e0e0e] border border-white/5 p-4 rounded-xl">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1">All Bookings</span>
          <span className="text-2xl font-serif text-white">{bookings.length}</span>
        </div>
        <div className="bg-[#0e0e0e] border border-amber-500/20 p-4 rounded-xl">
          <span className="text-[10px] uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3" /> Pending Cases
          </span>
          <span className="text-2xl font-serif text-amber-400">{totalPending}</span>
        </div>
        <div 
          onClick={() => {
            setActiveTab('lawyers');
            setLawyerApprovalFilter('pending');
          }}
          className="bg-[#0e0e0e] border border-amber-500/40 p-4 rounded-xl cursor-pointer hover:border-amber-400 transition-all relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
          <span className="text-[10px] uppercase tracking-wider text-amber-300 flex items-center gap-1 mb-1 font-semibold">
            <AlertCircle className="w-3 h-3 text-amber-400" /> Pending Lawyers
          </span>
          <span className="text-2xl font-serif text-amber-300 font-bold">{pendingLawyersCount}</span>
        </div>
        <div className="bg-[#0e0e0e] border border-green-500/20 p-4 rounded-xl">
          <span className="text-[10px] uppercase tracking-wider text-green-400 flex items-center gap-1 mb-1">
            <CheckCircle2 className="w-3 h-3" /> Active Lawyers
          </span>
          <span className="text-2xl font-serif text-green-400">{approvedLawyersCount}</span>
        </div>
        <div className="bg-[#0e0e0e] border border-white/5 p-4 rounded-xl">
          <span className="text-[10px] uppercase tracking-wider text-[#c5a059] flex items-center gap-1 mb-1">
            <Scale className="w-3 h-3" /> Total Lawyers
          </span>
          <span className="text-2xl font-serif text-white">{lawyers.length}</span>
        </div>
        <div className="bg-[#0e0e0e] border border-white/5 p-4 rounded-xl">
          <span className="text-[10px] uppercase tracking-wider text-purple-400 flex items-center gap-1 mb-1">
            <Users className="w-3 h-3" /> Users
          </span>
          <span className="text-2xl font-serif text-white">{usersList.length}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveTab('appointments'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'appointments'
                ? 'bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20'
                : 'bg-[#111] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" /> Appointments ({bookings.length})
          </button>

          <button
            onClick={() => { setActiveTab('lawyers'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'lawyers'
                ? 'bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20'
                : 'bg-[#111] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Scale className="w-4 h-4" /> Lawyers ({lawyers.length})
          </button>

          <button
            onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'users'
                ? 'bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20'
                : 'bg-[#111] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Users className="w-4 h-4" /> Users ({usersList.length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a059] mx-auto mb-4"></div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Loading Administrator Data...</p>
        </div>
      ) : (
        <>
          {/* ================= APPOINTMENTS TAB ================= */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {/* Status Filter Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-gray-500 mr-2 flex items-center gap-1 font-mono">
                  <Filter className="w-3.5 h-3.5 text-[#c5a059]" /> Filter Status:
                </span>
                {(['all', 'Pending', 'Accepted', 'Disposed', 'Cancelled'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                      statusFilter === status
                        ? 'bg-white text-black font-bold'
                        : 'bg-[#111] text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {status === 'all' ? `All (${bookings.length})` : `${status} (${bookings.filter(b => b.status === status).length})`}
                  </button>
                ))}
              </div>

              {filteredBookings.length === 0 ? (
                <div className="bg-[#0e0e0e] border border-white/5 rounded-2xl p-12 text-center text-gray-500 text-sm">
                  No appointments match the selected filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredBookings.map((b) => {
                    const lawyerName = lawyers.find(l => l.id === b.lawyer_id)?.name || b.lawyer_id;
                    const waStatusMsg = `Namaste ${b.name}, this is an update regarding your Vakil Duniya consultation for "${b.case_type}" scheduled on ${b.appointment_date} with ${lawyerName}. Current Status: ${b.status.toUpperCase()}.`;
                    const waUrl = `https://api.whatsapp.com/send?phone=91${b.mobile.replace(/\D/g, '')}&text=${encodeURIComponent(waStatusMsg)}`;

                    return (
                      <div 
                        key={b.id} 
                        className={`bg-[#0d0d0d] border rounded-xl p-5 transition-all ${
                          b.status === 'Pending' ? 'border-amber-500/30' :
                          b.status === 'Accepted' ? 'border-green-500/30' :
                          b.status === 'Disposed' ? 'border-blue-500/30' : 'border-red-500/20'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Client & Booking Info */}
                          <div className="flex-1 min-w-[280px]">
                            <div className="flex items-center gap-3 mb-1.5">
                              <span className="font-serif text-lg text-white font-medium">{b.name}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                b.status === 'Accepted' ? 'bg-green-500/15 text-green-400 border border-green-500/30' :
                                b.status === 'Disposed' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                                b.status === 'Cancelled' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                                'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              }`}>
                                {b.status}
                              </span>
                              <span className="text-[10px] font-mono text-gray-500">ID: {b.id}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 font-sans">
                              <span className="text-[#c5a059] font-mono flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {b.mobile}
                              </span>
                              {b.userEmail && (
                                <span className="text-gray-400 font-mono flex items-center gap-1">
                                  <Mail className="w-3 h-3" /> {b.userEmail}
                                </span>
                              )}
                              <span className="text-white">Case: <span className="text-gray-300 font-medium">{b.case_type}</span></span>
                              <span className="text-gray-400">Date: <span className="text-white font-mono">{b.appointment_date}</span></span>
                              <span className="text-gray-400">Mode: <span className="text-white">{b.consultation_mode || 'Online Consultation'}</span></span>
                              <span className="text-[#c5a059]">Lawyer: <span className="text-white font-medium">{lawyerName}</span></span>
                            </div>

                            {b.remarks && (
                              <p className="mt-2 text-xs text-gray-400 italic bg-[#141414] px-3 py-1.5 rounded border border-white/5">
                                Admin Remarks: {b.remarks}
                              </p>
                            )}
                          </div>

                          {/* Status Management Buttons (Admin Action Suite) */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-mono mr-1">
                              Action:
                            </span>

                            {/* Pending Button */}
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'Pending')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1 ${
                                b.status === 'Pending'
                                  ? 'bg-amber-500 text-black font-bold'
                                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20'
                              }`}
                              title="Mark as Pending Review"
                            >
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </button>

                            {/* Accept Button */}
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'Accepted')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1 ${
                                b.status === 'Accepted'
                                  ? 'bg-green-500 text-black font-bold'
                                  : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'
                              }`}
                              title="Accept & Confirm Appointment"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                            </button>

                            {/* Dispose Button */}
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'Disposed')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1 ${
                                b.status === 'Disposed'
                                  ? 'bg-blue-500 text-white font-bold'
                                  : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
                              }`}
                              title="Mark as Disposed / Hearing Completed"
                            >
                              <Archive className="w-3.5 h-3.5" /> Dispose
                            </button>

                            {/* Cancel Button */}
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1 ${
                                b.status === 'Cancelled'
                                  ? 'bg-red-500 text-white font-bold'
                                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                              }`}
                              title="Cancel Consultation"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancel
                            </button>

                            {/* WhatsApp Direct Notify */}
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-colors"
                              title="WhatsApp Notify Client"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>

                            {/* Delete Record */}
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/20 transition-colors"
                              title="Delete Booking Record"
                            >
                              <Trash2 className="w-4 h-4" />
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

          {/* ================= LAWYERS TAB ================= */}
          {activeTab === 'lawyers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-serif text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-[#c5a059]" /> Advocate Verification & Approvals
                  </h3>
                  <p className="text-xs text-gray-400">Review newly registered advocates, verify Bar Council registration, and approve or reject portal access.</p>
                </div>

                <button
                  onClick={() => setIsAddingLawyer(!isAddingLawyer)}
                  className="bg-[#c5a059] text-black px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> {isAddingLawyer ? 'Cancel' : 'Add New Lawyer'}
                </button>
              </div>

              {/* Sub-Filter Tabs for Lawyer Approval Status */}
              <div className="flex flex-wrap items-center gap-2 bg-[#0c0c0c] p-1.5 rounded-xl border border-white/5">
                <button
                  onClick={() => setLawyerApprovalFilter('all')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    lawyerApprovalFilter === 'all'
                      ? 'bg-[#c5a059] text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All Advocates ({lawyers.length})
                </button>

                <button
                  onClick={() => setLawyerApprovalFilter('pending')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    lawyerApprovalFilter === 'pending'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Review ({pendingLawyersCount})</span>
                  {pendingLawyersCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  )}
                </button>

                <button
                  onClick={() => setLawyerApprovalFilter('approved')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    lawyerApprovalFilter === 'approved'
                      ? 'bg-green-500 text-black shadow-md'
                      : 'text-green-400 hover:text-green-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approved & Active ({approvedLawyersCount})</span>
                </button>

                <button
                  onClick={() => setLawyerApprovalFilter('rejected')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    lawyerApprovalFilter === 'rejected'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'text-red-400 hover:text-red-300'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Rejected ({rejectedLawyersCount})</span>
                </button>
              </div>

              {/* Add Lawyer Form */}
              {isAddingLawyer && (
                <form onSubmit={handleAddLawyer} className="bg-[#111] border border-[#c5a059]/40 rounded-2xl p-6 shadow-2xl relative">
                  <h4 className="text-lg font-serif text-[#c5a059] mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5" /> Register New Advocate Directly
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Full Name</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="Advocate Full Name" 
                        className="w-full bg-[#050505] border border-white/10 p-3 text-sm text-white focus:border-[#c5a059] rounded-lg outline-none" 
                        value={newLawyer.name} 
                        onChange={e => setNewLawyer({...newLawyer, name: e.target.value})} 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Specialization</label>
                      <select 
                        required 
                        className="w-full bg-[#050505] border border-white/10 p-3 text-sm text-white focus:border-[#c5a059] rounded-lg outline-none" 
                        value={newLawyer.specialization} 
                        onChange={e => setNewLawyer({...newLawyer, specialization: e.target.value})}
                      >
                        <option value="Civil & Property Dispute">Civil & Property Dispute</option>
                        <option value="Criminal Law">Criminal Law</option>
                        <option value="Family Matter">Family Matter</option>
                        <option value="Corporate Law">Corporate Law</option>
                        <option value="Constitutional & High Court">Constitutional & High Court</option>
                        <option value="Bail & Cheque Bounce">Bail & Cheque Bounce</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Experience</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="e.g. 10 Years" 
                        className="w-full bg-[#050505] border border-white/10 p-3 text-sm text-white focus:border-[#c5a059] rounded-lg outline-none" 
                        value={newLawyer.experience} 
                        onChange={e => setNewLawyer({...newLawyer, experience: e.target.value})} 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">City / Court Location</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="e.g. Jabalpur / Delhi / Mumbai" 
                        className="w-full bg-[#050505] border border-white/10 p-3 text-sm text-white focus:border-[#c5a059] rounded-lg outline-none" 
                        value={newLawyer.city} 
                        onChange={e => setNewLawyer({...newLawyer, city: e.target.value})} 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Mobile Number</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="10 digit mobile" 
                        className="w-full bg-[#050505] border border-white/10 p-3 text-sm text-white focus:border-[#c5a059] rounded-lg outline-none" 
                        value={newLawyer.mobile_number} 
                        onChange={e => setNewLawyer({...newLawyer, mobile_number: e.target.value})} 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Bar Enrollment No.</label>
                      <input 
                        type="text" 
                        placeholder="e.g. MP/1042/2019" 
                        className="w-full bg-[#050505] border border-white/10 p-3 text-sm text-white focus:border-[#c5a059] rounded-lg outline-none" 
                        value={newLawyer.bar_enrollment} 
                        onChange={e => setNewLawyer({...newLawyer, bar_enrollment: e.target.value})} 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Consultation Mode</label>
                      <select 
                        className="w-full bg-[#050505] border border-white/10 p-3 text-sm text-white focus:border-[#c5a059] rounded-lg outline-none" 
                        value={newLawyer.consultation_mode} 
                        onChange={e => setNewLawyer({...newLawyer, consultation_mode: e.target.value})}
                      >
                        <option value="Online Consultation">Online Consultation</option>
                        <option value="Offline Consultation">Offline Consultation</option>
                        <option value="Both (Online & Offline)">Both (Online & Offline)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Languages</label>
                      <input 
                        type="text" 
                        placeholder="Hindi, English" 
                        className="w-full bg-[#050505] border border-white/10 p-3 text-sm text-white focus:border-[#c5a059] rounded-lg outline-none" 
                        value={newLawyer.language} 
                        onChange={e => setNewLawyer({...newLawyer, language: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <button 
                      type="submit" 
                      className="bg-[#c5a059] text-black px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-colors shadow-lg cursor-pointer"
                    >
                      Save & Approve Lawyer
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingLawyer(false)}
                      className="bg-[#222] text-gray-300 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Lawyers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLawyers.map(lawyer => {
                  const isPending = lawyer.approval_status === 'pending' || (lawyer.is_verified === false && lawyer.approval_status !== 'rejected');
                  const isApproved = lawyer.approval_status === 'approved' || (lawyer.is_verified === true && lawyer.approval_status !== 'pending' && lawyer.approval_status !== 'rejected');
                  const isRejected = lawyer.approval_status === 'rejected';

                  return (
                    <div 
                      key={lawyer.id} 
                      className={`bg-[#111] rounded-2xl p-6 relative group transition-all flex flex-col justify-between border ${
                        isPending 
                          ? 'border-amber-500/50 shadow-lg shadow-amber-500/5' 
                          : isRejected
                          ? 'border-red-500/40 opacity-75'
                          : 'border-white/10 hover:border-[#c5a059]/40'
                      }`}
                    >
                      <div>
                        {/* Status Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                <Clock className="w-3 h-3 text-amber-400" /> Pending Admin Approval
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-300 border border-green-500/40">
                                <CheckCircle2 className="w-3 h-3 text-green-400" /> Verified & Active
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40">
                                <XCircle className="w-3 h-3 text-red-400" /> Rejected
                              </span>
                            )}
                          </div>

                          <button 
                            onClick={() => handleDeleteLawyer(lawyer.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Lawyer Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Advocate Info */}
                        <div className="flex items-start gap-3">
                          {lawyer.image ? (
                            <img src={lawyer.image} alt={lawyer.name} className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[#222] border border-white/10 flex items-center justify-center text-[#c5a059] font-serif font-bold text-lg shrink-0">
                              {lawyer.name.charAt(0)}
                            </div>
                          )}

                          <div className="overflow-hidden">
                            <h4 className="text-lg font-serif text-white font-semibold truncate">{lawyer.name}</h4>
                            <p className="text-xs tracking-wider uppercase text-[#c5a059] font-medium truncate">{lawyer.specialization}</p>
                            {lawyer.email && <p className="text-[11px] text-gray-400 truncate">{lawyer.email}</p>}
                          </div>
                        </div>

                        {/* Detailed Specs */}
                        <div className="mt-4 space-y-1.5 text-xs text-gray-400 font-sans border-t border-white/5 pt-3">
                          <p className="flex justify-between">
                            <span>Bar Council Reg:</span> 
                            <span className="text-white font-mono font-semibold">{lawyer.bar_enrollment || 'Not Provided'}</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Practice City / State:</span> 
                            <span className="text-white">{lawyer.city}{lawyer.state ? `, ${lawyer.state}` : ''}</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Experience:</span> 
                            <span className="text-white">{lawyer.experience}</span>
                          </p>
                          {lawyer.mobile_number && (
                            <p className="flex justify-between items-center">
                              <span>Mobile:</span> 
                              <span className="text-[#c5a059] font-mono font-semibold">{lawyer.mobile_number}</span>
                            </p>
                          )}
                          {lawyer.approval_remarks && isRejected && (
                            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-[11px] text-red-300">
                              <span className="font-semibold block">Rejection Remarks:</span>
                              {lawyer.approval_remarks}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="mt-5 pt-3 border-t border-white/5 flex flex-col gap-2">
                        {/* Quick Contact buttons */}
                        {lawyer.mobile_number && (
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${lawyer.mobile_number}`}
                              className="flex-1 py-2 px-3 bg-[#181818] hover:bg-[#252525] text-gray-300 text-[11px] font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-white/5"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#c5a059]" /> Call
                            </a>
                            <a
                              href={`https://wa.me/91${lawyer.mobile_number.replace(/\D/g, '')}?text=Hello%20Advocate%20${encodeURIComponent(lawyer.name)},%20regarding%20your%20Vakil%20Duniya%20registration`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-2 px-3 bg-[#181818] hover:bg-[#252525] text-green-400 text-[11px] font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-white/5"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                          </div>
                        )}

                        {/* Approval Controls */}
                        {isPending && (
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => handleApproveLawyer(lawyer.id, lawyer.name)}
                              className="flex-1 py-2.5 px-3 bg-green-500 hover:bg-green-400 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve (स्वीकृत)
                            </button>
                            <button
                              onClick={() => handleRejectLawyer(lawyer.id, lawyer.name)}
                              className="py-2.5 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </button>
                          </div>
                        )}

                        {isApproved && (
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => handleSetPendingLawyer(lawyer.id, lawyer.name)}
                              className="flex-1 py-2 px-3 bg-[#1c1c1c] hover:bg-[#262626] text-amber-400 border border-amber-500/20 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" /> Set to Pending
                            </button>
                            <button
                              onClick={() => handleRejectLawyer(lawyer.id, lawyer.name)}
                              className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {isRejected && (
                          <div className="mt-1">
                            <button
                              onClick={() => handleApproveLawyer(lawyer.id, lawyer.name)}
                              className="w-full py-2.5 px-3 bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Re-Approve Advocate
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredLawyers.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-[#0c0c0c] border border-white/5 rounded-2xl">
                    <Scale className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-medium">No advocates found matching your filter.</p>
                    <p className="text-gray-600 text-xs mt-1">Try switching tabs or clearing your search term.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= USERS TAB ================= */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif text-white">Registered Users & Clients</h3>
                  <p className="text-xs text-gray-400">View, onboard, and manage platform user accounts.</p>
                </div>

                <button
                  onClick={() => setIsAddingUser(!isAddingUser)}
                  className="bg-[#c5a059] text-black px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" /> {isAddingUser ? 'Cancel' : 'Add New User'}
                </button>
              </div>

              {/* Add User Modal / Inline Form */}
              {isAddingUser && (
                <form onSubmit={handleAddUser} className="bg-[#111] border border-[#c5a059]/40 rounded-2xl p-6 shadow-2xl relative">
                  <h4 className="text-lg font-serif text-[#c5a059] mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5" /> Add Platform User
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">User Full Name</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="Client / User Name" 
                        className="w-full bg-[#050505] border border-white/10 p-3 text-sm text-white focus:border-[#c5a059] rounded-lg outline-none" 
                        value={newUser.name} 
                        onChange={e => setNewUser({...newUser, name: e.target.value})} 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                      <input 
                        required 
                        type="email" 
                        placeholder="user@example.com" 
                        className="w-full bg-[#050505] border border-white/10 p-3 text-sm text-white focus:border-[#c5a059] rounded-lg outline-none font-mono" 
                        value={newUser.email} 
                        onChange={e => setNewUser({...newUser, email: e.target.value})} 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Mobile Number</label>
                      <input 
                        type="text" 
                        placeholder="10 digit mobile" 
                        className="w-full bg-[#050505] border border-white/10 p-3 text-sm text-white focus:border-[#c5a059] rounded-lg outline-none font-mono" 
                        value={newUser.mobile} 
                        onChange={e => setNewUser({...newUser, mobile: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <button 
                      type="submit" 
                      className="bg-[#c5a059] text-black px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-colors"
                    >
                      Save User Account
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingUser(false)}
                      className="bg-[#222] text-gray-300 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Users Table */}
              <div className="overflow-x-auto bg-[#0d0d0d] border border-white/5 rounded-xl">
                <table className="w-full text-left text-xs text-gray-400 border-collapse">
                  <thead className="bg-[#141414] text-[10px] uppercase tracking-widest text-[#c5a059] border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3.5 font-semibold">User</th>
                      <th className="px-4 py-3.5 font-semibold">Contact</th>
                      <th className="px-4 py-3.5 font-semibold">Role</th>
                      <th className="px-4 py-3.5 font-semibold">Bookings</th>
                      <th className="px-4 py-3.5 font-semibold">Joined</th>
                      <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((u) => {
                      const userBookingsCount = bookings.filter(b => b.userId === u.id || b.userEmail === u.email).length;
                      const isSuperAdmin = u.email?.toLowerCase() === 'prashankpathak@gmail.com';

                      return (
                        <tr key={u.id || u.email} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-4">
                            <div className="text-white font-medium text-sm">{u.name || 'Anonymous User'}</div>
                            <div className="text-[11px] font-mono text-gray-500">{u.id}</div>
                          </td>

                          <td className="px-4 py-4 font-mono">
                            <div className="text-gray-300 flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-[#c5a059]" /> {u.email}
                            </div>
                            {u.mobile && (
                              <div className="text-[#c5a059] flex items-center gap-1.5 mt-0.5">
                                <Phone className="w-3 h-3" /> {u.mobile}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {isSuperAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40">
                                <ShieldCheck className="w-3 h-3" /> Super Admin
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-white/10 text-gray-300">
                                Client
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 font-mono text-white">
                            {userBookingsCount} Consultations
                          </td>

                          <td className="px-4 py-4 text-gray-500">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                          </td>

                          <td className="px-4 py-4 text-right">
                            {!isSuperAdmin && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No users found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
