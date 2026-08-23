import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Award, 
  QrCode, 
  Copy, 
  Calendar, 
  Camera, 
  Check, 
  ChevronRight, 
  ArrowLeft,
  Sparkles,
  RefreshCw,
  FileCheck,
  UserCheck,
  Building,
  Languages,
  Upload,
  Image as ImageIcon,
  Trash2,
  PhoneCall,
  MessageCircle,
  CheckSquare,
  Square,
  Clock,
  AlertCircle,
  XCircle,
  LogOut,
  User,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigationStore } from '../store';
import { 
  auth, 
  loginWithGoogle, 
  registerWithEmail, 
  loginWithEmail, 
  fetchLawyerByUidOrEmail,
  completeLawyerOnboarding,
  LawyerOnboardingData
} from '../firebase';
import { Lawyer } from '../types';
import { LawyerDashboard } from './LawyerDashboard';

const SPECIALIZATIONS = [
  "Civil & Property Dispute",
  "Criminal & Bail Matter",
  "Family & Divorce Law",
  "Corporate & Business Law",
  "Constitutional & High Court",
  "Consumer Forum & Banking",
  "Labour & Employment Law",
  "Cyber Crime & IT Law",
  "Motor Accident Claims (MACT)",
  "Taxation & GST Litigation"
];

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
  "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
];

export function LawyerPortalView() {
  const { user, userProfile, setUser, navigate, openAuthModal } = useNavigationStore();
  const [currentView, setCurrentView] = useState<'login' | 'register_step1' | 'register_step2' | 'register_step3' | 'dashboard'>('login');
  
  // Lawyer state
  const [existingLawyer, setExistingLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Status check state for pending reviews
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusCheckMsg, setStatusCheckMsg] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration form states - Step 1
  const [regAuthMode, setRegAuthMode] = useState<'google' | 'email'>('google');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [regOfficePhone, setRegOfficePhone] = useState('');

  // Professional profile state (Step 2)
  const [barEnrollment, setBarEnrollment] = useState('');
  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0]);
  const [experience, setExperience] = useState('5 Years');
  const [consultationFee, setConsultationFee] = useState<number>(599);
  const [consultationMode, setConsultationMode] = useState('Online & Chamber Consultation');
  const [city, setCity] = useState('Jabalpur');
  const [stateName, setStateName] = useState('Madhya Pradesh');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Hindi', 'English']);
  
  // Photo Upload State (Base64 dataUrl or preset)
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState('');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState('');

  // Payment state (Step 3)
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Check if currently authenticated user is already an onboarded lawyer
  useEffect(() => {
    async function checkLawyerStatus() {
      if (user) {
        setLoading(true);
        try {
          const lawyer = await fetchLawyerByUidOrEmail(user.uid, user.email || undefined);
          if (lawyer) {
            setExistingLawyer(lawyer);
            setCurrentView('dashboard');
          } else if (userProfile?.role === 'lawyer' || userProfile?.isVerifiedLawyer) {
            setCurrentView('dashboard');
          } else {
            // User is signed in but hasn't completed lawyer onboarding
            setRegName(user.displayName || userProfile?.displayName || '');
            setRegEmail(user.email || '');
            const phone = userProfile?.phone || '';
            setRegPhone(phone);
            if (sameAsMobile) {
              setRegWhatsapp(phone);
            }
            setCurrentView('register_step2');
          }
        } catch (e) {
          console.error("Error checking lawyer profile:", e);
        } finally {
          setLoading(false);
        }
      }
    }
    checkLawyerStatus();
  }, [user, userProfile]);

  // Sync WhatsApp with mobile when sameAsMobile is checked
  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setRegPhone(clean);
    if (sameAsMobile) {
      setRegWhatsapp(clean);
    }
  };

  // Status refresh handler
  const handleRefreshStatus = async () => {
    setCheckingStatus(true);
    setStatusCheckMsg('');
    try {
      const currentUid = user?.uid || existingLawyer?.uid || '';
      const currentEmail = user?.email || existingLawyer?.email || '';
      const freshLawyer = await fetchLawyerByUidOrEmail(currentUid, currentEmail);
      if (freshLawyer) {
        setExistingLawyer(freshLawyer);
        const isApproved = freshLawyer.approval_status === 'approved' || (freshLawyer.is_verified === true && freshLawyer.approval_status !== 'pending' && freshLawyer.approval_status !== 'rejected');
        if (isApproved) {
          setStatusCheckMsg('Congratulations! Your Advocate account has been approved by Administrator.');
        } else if (freshLawyer.approval_status === 'rejected') {
          setStatusCheckMsg('Your application was not approved. Please see remarks below or contact Admin.');
        } else {
          setStatusCheckMsg('Your profile is currently under review by Super Admin (Prashank Pathak).');
        }
      } else {
        setStatusCheckMsg('Account record located. Verification still pending.');
      }
    } catch (err: any) {
      console.error("Status check failed:", err);
      setStatusCheckMsg('Unable to refresh status at the moment. Please try again.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleToggleSameAsMobile = () => {
    const nextState = !sameAsMobile;
    setSameAsMobile(nextState);
    if (nextState) {
      setRegWhatsapp(regPhone);
    }
  };

  // Handle Photo File Upload
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size should be under 5 MB');
      return;
    }

    setErrorMsg('');
    setPhotoFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadedPhoto(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Google Sign In for Lawyers
  const handleGoogleAuth = async (targetStep: 'login' | 'register') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { user: authedUser, profile } = await loginWithGoogle();
      setUser(authedUser, profile);
      
      const lawyer = await fetchLawyerByUidOrEmail(authedUser.uid, authedUser.email || undefined);
      if (lawyer) {
        setExistingLawyer(lawyer);
        setCurrentView('dashboard');
      } else {
        setRegName(authedUser.displayName || '');
        setRegEmail(authedUser.email || '');
        setRegPhone(profile.phone || '');
        setRegWhatsapp(profile.phone || '');
        setCurrentView('register_step2');
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user') || err?.code === 'auth/cancelled-popup-request') {
        // User closed or cancelled popup window - handle gently without error clutter
        console.log("Google sign-in popup closed by user.");
        setErrorMsg('Sign-in was cancelled or the popup was closed. Click Google Sign In whenever you are ready.');
      } else {
        console.error("Google sign-in error:", err);
        setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Login for existing Lawyers
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const { user: authedUser, profile } = await loginWithEmail(loginEmail, loginPassword);
      setUser(authedUser, profile);
      
      const lawyer = await fetchLawyerByUidOrEmail(authedUser.uid, authedUser.email || undefined);
      if (lawyer) {
        setExistingLawyer(lawyer);
        setCurrentView('dashboard');
      } else {
        setRegEmail(authedUser.email || '');
        setRegName(profile.displayName || '');
        setRegPhone(profile.phone || '');
        setRegWhatsapp(profile.phone || '');
        setCurrentView('register_step2');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Proceed from Step 1 to Step 2 (No OTP check needed, just direct field validation)
  const handleProceedToStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!regName.trim()) {
      setErrorMsg('Please enter your full Advocate name');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Please enter your email address');
      return;
    }
    if (!regPhone || regPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!user && regAuthMode === 'email') {
      if (!regPassword || regPassword.length < 6) {
        setErrorMsg('Please create a password of at least 6 characters');
        return;
      }
      setLoading(true);
      try {
        const { user: newUser, profile } = await registerWithEmail(regEmail, regPassword, regName, regPhone);
        setUser(newUser, profile);
      } catch (err: any) {
        setErrorMsg(err.message || 'Account creation notice. Please try signing in or use Google.');
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    setCurrentView('register_step2');
  };

  // Proceed from Step 2 to Step 3 (Payment)
  const handleProceedToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!barEnrollment.trim()) {
      setErrorMsg('Bar Council Enrollment Number is mandatory (e.g., MP/1420/2021)');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('Please enter your city of practice');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your chamber / office address');
      return;
    }

    setCurrentView('register_step3');
  };

  // Copy UPI ID
  const handleCopyUpi = () => {
    navigator.clipboard.writeText('prashankpathak@fam');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Step 3: Complete Payment & Onboarding
  const handleFinalizeOnboarding = async () => {
    setVerifyingPayment(true);
    setErrorMsg('');

    const activeImage = uploadedPhoto || PRESET_AVATARS[0];
    const currentUid = user?.uid || `adv_${Date.now()}`;
    const currentEmail = user?.email || regEmail;

    const onboardingPayload: LawyerOnboardingData = {
      uid: currentUid,
      email: currentEmail,
      name: regName,
      mobile: regPhone,
      whatsappNumber: regWhatsapp || regPhone,
      officePhone: regOfficePhone || '',
      barEnrollment: barEnrollment.toUpperCase().trim(),
      specialization,
      experience,
      consultationFee: Number(consultationFee || 599),
      consultationMode,
      city,
      state: stateName,
      address,
      pincode,
      language: selectedLanguages,
      image: activeImage,
      bio: bio || `Senior practicing advocate specializing in ${specialization} with ${experience} of legal practice.`,
      portalFeePaid: true,
      transactionId: transactionId || `TXN_VD_${Date.now()}`,
      upiId: 'prashankpathak@fam'
    };

    try {
      const res = await completeLawyerOnboarding(onboardingPayload);
      if (res.success) {
        setPaymentConfirmed(true);
        setTimeout(async () => {
          const freshLawyer = await fetchLawyerByUidOrEmail(currentUid, currentEmail);
          if (freshLawyer) setExistingLawyer(freshLawyer);
          setCurrentView('dashboard');
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Failed to finalize registration. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while finalizing lawyer onboarding.');
    } finally {
      setVerifyingPayment(false);
    }
  };

  // If dashboard view and lawyer exists
  if (currentView === 'dashboard') {
    const isApproved = existingLawyer?.approval_status === 'approved' || (existingLawyer?.is_verified === true && existingLawyer?.approval_status !== 'pending' && existingLawyer?.approval_status !== 'rejected');
    const isRejected = existingLawyer?.approval_status === 'rejected';

    if (isApproved && existingLawyer) {
      return (
        <LawyerDashboard 
          lawyer={existingLawyer} 
          onUpdateProfile={(updated) => setExistingLawyer(updated)}
          onLogout={() => {
            setExistingLawyer(null);
            setCurrentView('login');
          }}
        />
      );
    }

    // Pending or Rejected Approval Screen
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-[#0e0e0e] border border-[#c5a059]/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm text-center"
        >
          {/* Subtle golden glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Status Icon */}
          <div className="relative inline-block mb-6">
            <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center border ${
              isRejected 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {isRejected ? (
                <XCircle className="w-10 h-10" />
              ) : (
                <Clock className="w-10 h-10 animate-pulse" />
              )}
            </div>
            {!isRejected && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
              </span>
            )}
          </div>

          {/* Header Title */}
          {isRejected ? (
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 mb-3">
                <XCircle className="w-3.5 h-3.5" /> Verification Declined • सत्यापन अस्वीकृत
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                Advocate Application Not Approved
              </h2>
              <p className="text-sm text-gray-400 mt-2 max-w-lg mx-auto">
                Your submitted details could not be verified with Bar Council records or require clarification.
              </p>
              {existingLawyer?.approval_remarks && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 text-left max-w-lg mx-auto">
                  <span className="font-bold block mb-1">Remarks from Super Admin:</span>
                  {existingLawyer.approval_remarks}
                </div>
              )}
            </div>
          ) : (
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending Admin Review • सत्यापन प्रक्रियाधीन
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                Welcome, {existingLawyer?.name || 'Advocate'}
              </h2>
              <p className="text-sm text-gray-300 mt-2 max-w-lg mx-auto">
                Your registration application and Bar Council details are currently under review by Super Administrator <span className="text-[#c5a059] font-semibold">(Prashank Pathak)</span>.
              </p>
            </div>
          )}

          {/* Stepper Pipeline */}
          <div className="mt-8 mb-8 p-5 bg-[#141414] border border-white/5 rounded-2xl text-left">
            <h4 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#c5a059]" /> Advocate Onboarding Status
            </h4>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">1. Application & Bar Details Submitted</p>
                  <p className="text-[11px] text-gray-400">Profile data and Bar registration details uploaded.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                  isRejected 
                    ? 'bg-red-500/20 border-red-500/40 text-red-400' 
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                }`}>
                  {isRejected ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 animate-spin" />}
                </div>
                <div>
                  <p className={`text-xs font-semibold ${isRejected ? 'text-red-400' : 'text-amber-300'}`}>
                    2. Bar Council & Identity Verification
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {isRejected ? 'Application failed verification.' : 'Super Admin is reviewing Bar Council enrollment records.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-gray-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">3. Portal Activation & Public Listing</p>
                  <p className="text-[11px] text-gray-500">Unlocks full advocate portal, client case manager, and listing on Vakil Duniya.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submitted Profile Details Box */}
          {existingLawyer && (
            <div className="mb-8 p-5 bg-[#111] border border-white/5 rounded-2xl text-left text-xs">
              <h5 className="font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-between">
                <span>Submitted Registration Profile</span>
                <span className="text-[#c5a059] font-mono">{existingLawyer.bar_enrollment || 'Bar ID Pending'}</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-300">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Advocate Name</span>
                  <span className="font-semibold text-white">{existingLawyer.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Specialization</span>
                  <span className="font-semibold text-white">{existingLawyer.specialization}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Practice Location</span>
                  <span className="font-semibold text-white">{existingLawyer.city}{existingLawyer.state ? `, ${existingLawyer.state}` : ''}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Contact Number</span>
                  <span className="font-mono text-[#c5a059]">{existingLawyer.mobile_number || 'Not Provided'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Status Message Notification if any */}
          {statusCheckMsg && (
            <div className="mb-6 p-3.5 bg-[#181818] border border-[#c5a059]/40 rounded-xl text-xs text-[#c5a059] flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{statusCheckMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRefreshStatus}
              disabled={checkingStatus}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#c5a059] hover:brightness-110 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
              {checkingStatus ? 'Checking Status...' : 'Refresh Status (स्थिति रिफ्रेश करें)'}
            </button>

            <a
              href="https://wa.me/916263364561?text=Hello%20Prashank%20Ji,%20I%20have%20registered%20as%20an%20Advocate%20on%20Vakil%20Duniya%20and%20request%20verification."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#181818] hover:bg-[#222] border border-green-500/40 text-green-400 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-green-400" /> WhatsApp Super Admin
            </a>

            <a
              href="tel:6263364561"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#181818] hover:bg-[#222] border border-white/10 text-gray-300 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#c5a059]" /> Call Admin
            </a>
          </div>

          {/* Bottom Switcher / Logout */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
            <button
              onClick={() => setCurrentView('register_step2')}
              className="hover:text-white underline cursor-pointer"
            >
              Edit Submitted Details
            </button>

            <button
              onClick={() => {
                setExistingLawyer(null);
                setCurrentView('login');
              }}
              className="hover:text-red-400 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out from Advocate Portal
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      {/* Header Banner */}
      <div className="text-center mb-8 w-full">
        <div className="inline-flex items-center gap-2 bg-[#c5a059]/10 border border-[#c5a059]/30 px-3.5 py-1.5 rounded-full mb-3">
          <Scale className="w-4 h-4 text-[#c5a059]" />
          <span className="text-xs font-semibold text-[#c5a059] uppercase tracking-wider">
            Verified Advocate Network • वकील पोर्टल
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Vakil Duniya <span className="text-[#c5a059]">Lawyer Portal</span>
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
          Join India's premier verified legal consultation network. Connect with thousands of clients, manage appointments, and grow your legal practice.
        </p>

        {/* Client / User Bridge Banner */}
        <div className="mt-4 p-3 bg-[#111] border border-white/10 rounded-xl max-w-md mx-auto flex items-center justify-between gap-3 text-left">
          <div>
            <p className="text-[11px] font-bold text-gray-300">Are you a Client seeking legal help?</p>
            <p className="text-[10px] text-gray-500">Book consultations & consult with verified advocates</p>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('login', 'Sign in as a client to book and manage consultations.')}
            className="px-3 py-1.5 bg-white/10 hover:bg-[#c5a059] text-gray-200 hover:text-black text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap cursor-pointer"
          >
            Client Login
          </button>
        </div>

        {/* Top Switcher Tabs between Login and Register */}
        <div className="flex justify-center mt-6">
          <div className="bg-[#111] p-1 rounded-lg border border-white/10 inline-flex">
            <button
              onClick={() => {
                setCurrentView('login');
                setErrorMsg('');
              }}
              className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentView === 'login'
                  ? 'bg-[#c5a059] text-black shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Advocate Login
            </button>
            <button
              onClick={() => {
                setCurrentView('register_step1');
                setErrorMsg('');
              }}
              className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentView.startsWith('register')
                  ? 'bg-[#c5a059] text-black shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              New Registration (वकील पंजीकरण)
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="w-full bg-[#0e0e0e] border border-[#c5a059]/30 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/40 rounded-xl text-green-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: LAWYER LOGIN                                                      */}
        {/* ========================================================================= */}
        {currentView === 'login' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">Advocate Sign In</h2>
              <p className="text-xs text-gray-400 mt-1">Access your consultation dashboard and appointments</p>
            </div>

            {/* Google One-Click Login */}
            <button
              type="button"
              onClick={() => handleGoogleAuth('login')}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm rounded-xl flex items-center justify-center gap-3 transition-all shadow-md mb-6 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-grow h-px bg-white/10"></div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Or with Email & Password</span>
              <div className="flex-grow h-px bg-white/10"></div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="advocate@vakilduniya.in"
                    className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#c5a059] hover:brightness-110 text-black font-bold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Sign In to Lawyer Dashboard
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-gray-400">
                New Advocate on Vakil Duniya?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('register_step1')}
                  className="text-[#c5a059] font-bold hover:underline cursor-pointer"
                >
                  Register & Get Verified
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: STEP 1 - IDENTITY & CONTACT DETAILS (NO OTP REQUIRED)              */}
        {/* ========================================================================= */}
        {currentView === 'register_step1' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold text-[#c5a059]">
                <span className="w-6 h-6 rounded-full bg-[#c5a059] text-black flex items-center justify-center text-xs">1</span>
                <span>Identity & Contacts</span>
              </div>
              <div className="h-0.5 w-12 bg-white/10"></div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <span className="w-6 h-6 rounded-full bg-white/5 text-gray-500 flex items-center justify-center text-xs">2</span>
                <span>Bar & Photo Upload</span>
              </div>
              <div className="h-0.5 w-12 bg-white/10"></div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <span className="w-6 h-6 rounded-full bg-white/5 text-gray-500 flex items-center justify-center text-xs">3</span>
                <span>₹199 Portal Fee</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">Step 1: Advocate Identity & Contact Details</h2>
              <p className="text-xs text-gray-400 mt-1">Authenticate via Google Account or enter your advocate details directly</p>
            </div>

            {/* Quick Google Sign In */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => handleGoogleAuth('register')}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm rounded-xl flex items-center justify-center gap-3 transition-all shadow-md cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"/>
                </svg>
                <span>Quick Sign Up with Google</span>
              </button>
            </div>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-grow h-px bg-white/10"></div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Or Manual Details Entry</span>
              <div className="flex-grow h-px bg-white/10"></div>
            </div>

            <form onSubmit={handleProceedToStep2} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Advocate Full Name *</label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Adv. Rajesh Sharma"
                    className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="advocate@gmail.com"
                    className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {!user && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Create Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>
              )}

              {/* Contact Numbers Section (Mobile, WhatsApp & Office Number) */}
              <div className="p-4 bg-[#141414] border border-[#c5a059]/30 rounded-xl space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Phone className="w-4 h-4 text-[#c5a059]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Contact & Chamber Numbers (संपर्क नंबर)
                  </span>
                </div>

                {/* 1. Primary Mobile Number (No OTP Required) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Primary Calling Mobile Number * (मोबाइल नंबर)
                    </label>
                    <span className="text-[10px] text-green-400 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> No OTP required
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs text-gray-500 font-semibold">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={regPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="10-digit calling number"
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059] font-mono"
                    />
                  </div>
                </div>

                {/* 2. WhatsApp Number & Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-green-400" />
                      WhatsApp Number (व्हाट्सएप नंबर)
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleSameAsMobile}
                      className="text-[11px] text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {sameAsMobile ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#c5a059]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      Same as Mobile
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs text-gray-500 font-semibold">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      disabled={sameAsMobile}
                      value={regWhatsapp}
                      onChange={(e) => setRegWhatsapp(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit WhatsApp number"
                      className={`w-full bg-[#1c1c1c] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059] font-mono ${
                        sameAsMobile ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* 3. Office / Chamber Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-[#c5a059]" />
                    Chamber / Office Number (कार्यालय / लैंडलाइन नंबर - Optional)
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      value={regOfficePhone}
                      onChange={(e) => setRegOfficePhone(e.target.value)}
                      placeholder="e.g. 0761-2458900 or Chamber Ext No."
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#c5a059] hover:brightness-110 text-black font-bold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-lg"
              >
                Continue to Bar Details & Chamber Setup
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: STEP 2 - BAR ENROLLMENT, PHOTO UPLOAD, CONSULTATION FEE & ADDRESS   */}
        {/* ========================================================================= */}
        {currentView === 'register_step2' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-medium text-green-400">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Identity Saved</span>
              </div>
              <div className="h-0.5 w-12 bg-[#c5a059]"></div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#c5a059]">
                <span className="w-6 h-6 rounded-full bg-[#c5a059] text-black flex items-center justify-center text-xs">2</span>
                <span>Bar & Photo Upload</span>
              </div>
              <div className="h-0.5 w-12 bg-white/10"></div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <span className="w-6 h-6 rounded-full bg-white/5 text-gray-500 flex items-center justify-center text-xs">3</span>
                <span>₹199 Portal Fee</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">Step 2: Legal Credentials, Photo Upload & Fee</h2>
              <p className="text-xs text-gray-400 mt-1">Provide Bar Council registration, upload your photo, and set your consultation fees</p>
            </div>

            <form onSubmit={handleProceedToStep3} className="space-y-6">
              {/* Bar Council Enrollment Number */}
              <div className="p-4 bg-[#141414] border border-[#c5a059]/40 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-[#c5a059]" />
                  <label className="text-xs font-bold text-[#c5a059] uppercase tracking-wider">
                    State Bar Council Enrollment Number *
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={barEnrollment}
                  onChange={(e) => setBarEnrollment(e.target.value.toUpperCase())}
                  placeholder="e.g. MP/1024/2021 or D/4512/2018 or MAH/7890/2014"
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059] font-mono font-semibold"
                />
                <p className="text-[10px] text-gray-500 mt-1.5">
                  Verified against State Bar Council registry for authentic advocate credential badge.
                </p>
              </div>

              {/* Photo Upload Section (Direct File Upload replaces Preset Avatars & URLs) */}
              <div className="p-5 bg-[#141414] border border-[#c5a059]/30 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#c5a059]" />
                    Advocate Profile Photo (फोटो अपलोड करें) *
                  </label>
                  {uploadedPhoto && (
                    <span className="text-[11px] text-green-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Photo Ready
                    </span>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                {uploadedPhoto ? (
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#1b1b1b] border border-white/10 rounded-xl">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#c5a059] shadow-lg shrink-0 group">
                      <img 
                        src={uploadedPhoto} 
                        alt="Uploaded Advocate Photo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                      <h4 className="text-sm font-bold text-white mb-1">
                        {photoFileName || "Uploaded Advocate Photo"}
                      </h4>
                      <p className="text-xs text-gray-400 mb-3">
                        This photo will appear on your verified Digital Advocate Card and Client Booking profile.
                      </p>
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-[#c5a059] text-black text-xs font-bold uppercase rounded-lg hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" /> Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedPhoto(null);
                            setPhotoFileName('');
                          }}
                          className="px-3 py-1.5 bg-red-900/30 border border-red-500/40 text-red-300 text-xs font-bold rounded-lg hover:bg-red-900/50 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingPhoto(true);
                    }}
                    onDragLeave={() => setIsDraggingPhoto(false)}
                    onDrop={handlePhotoDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDraggingPhoto
                        ? 'border-[#c5a059] bg-[#c5a059]/10'
                        : 'border-white/20 hover:border-[#c5a059]/60 hover:bg-white/5'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-white mb-1">
                      Click to Upload Photo or Drag & Drop
                    </p>
                    <p className="text-xs text-gray-400">
                      Supports JPG, PNG, WEBP (Advocate Passport or Court Attire Photo)
                    </p>
                    <button
                      type="button"
                      className="mt-3 px-4 py-2 bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#c5a059] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#c5a059] hover:text-black transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Select Photo from Device
                    </button>
                  </div>
                )}
              </div>

              {/* Specialization & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Primary Specialization *</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a059]"
                  >
                    {SPECIALIZATIONS.map(spec => (
                      <option key={spec} value={spec} className="bg-[#111]">{spec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Years of Practice Experience *</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="2 Years" className="bg-[#111]">2+ Years</option>
                    <option value="5 Years" className="bg-[#111]">5+ Years</option>
                    <option value="8 Years" className="bg-[#111]">8+ Years</option>
                    <option value="12 Years" className="bg-[#111]">12+ Years (Senior)</option>
                    <option value="18 Years" className="bg-[#111]">18+ Years (High Court / Supreme Court)</option>
                  </select>
                </div>
              </div>

              {/* Consultation Mode */}
              <div className="p-4 bg-[#141414] border border-[#c5a059]/30 rounded-xl space-y-2">
                <label className="text-xs font-bold text-[#c5a059] uppercase tracking-wider block">
                  Consultation Mode & Practice Availability (परामर्श माध्यम) *
                </label>
                <p className="text-[11px] text-gray-400 mb-2">
                  Select how you prefer to consult clients. Consultation arrangements and discussions are managed directly with your clients.
                </p>
                <select
                  value={consultationMode}
                  onChange={(e) => setConsultationMode(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="Online Consultation" className="bg-[#111]">Online Video & Phone Consultation</option>
                  <option value="Chamber Consultation" className="bg-[#111]">Chamber / In-Office Consultation</option>
                  <option value="Online & Chamber Consultation" className="bg-[#111]">Both Online & In-Chamber Consultation</option>
                </select>
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">City of Practice *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Jabalpur, Delhi, Mumbai"
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">State *</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Madhya Pradesh"
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 482001"
                    className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* Chamber / Office Full Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Chamber / Office Address *</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Chamber No., District / High Court Complex or Office Location"
                    className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* Practice Bio */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Brief Legal Bio / Summary</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Practicing in High Court & District Courts with expertise in land disputes, writs, and civil litigation."
                  className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentView('register_step1')}
                  className="px-6 py-3.5 border border-white/20 text-gray-300 text-xs font-bold uppercase rounded-xl hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  className="flex-grow py-3.5 bg-[#c5a059] hover:brightness-110 text-black font-bold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  Proceed to ₹199 Portal Verification Fee
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: STEP 3 - ₹199 PORTAL VERIFICATION & ACTIVATION                     */}
        {/* ========================================================================= */}
        {currentView === 'register_step3' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-medium text-green-400">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Identity</span>
              </div>
              <div className="h-0.5 w-12 bg-[#c5a059]"></div>
              <div className="flex items-center gap-2 text-xs font-medium text-green-400">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Chamber & Photo</span>
              </div>
              <div className="h-0.5 w-12 bg-[#c5a059]"></div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#c5a059]">
                <span className="w-6 h-6 rounded-full bg-[#c5a059] text-black flex items-center justify-center text-xs">3</span>
                <span>₹199 Portal Fee</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">Step 3: Advocate Onboarding Fee (₹199)</h2>
              <p className="text-xs text-gray-400 mt-1">
                One-time Bar verification & platform onboarding fee to activate your Advocate Portal
              </p>
            </div>

            {/* Profile Summary Card */}
            <div className="bg-[#141414] border border-[#c5a059]/30 rounded-xl p-4 mb-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-[#c5a059] shrink-0">
                <img 
                  src={uploadedPhoto || PRESET_AVATARS[0]} 
                  alt="Advocate" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Advocate {regName.replace(/^Advocate\s+/i, '')}</h4>
                  <span className="bg-[#c5a059]/20 text-[#c5a059] text-[10px] font-mono px-2 py-0.5 rounded">
                    {barEnrollment}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{specialization} • {city}</p>
                <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                  <span>Fee: ₹{consultationFee}</span>
                  <span>•</span>
                  <span>WhatsApp: +91 {regWhatsapp || regPhone}</span>
                </div>
              </div>
            </div>

            {/* Payment Card & QR Code */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 text-center mb-6">
              <div className="inline-flex items-center gap-1.5 bg-[#c5a059]/10 text-[#c5a059] text-xs font-bold px-3 py-1 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Official Advocate Portal Activation
              </div>

              <div className="text-3xl font-serif font-bold text-white my-1">
                ₹199 <span className="text-xs font-sans text-gray-400 font-normal">/ One-time fee</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Pay via any UPI App (GPay, PhonePe, Paytm, BHIM)</p>

              {/* QR Code Container (Pre-configured for direct ₹199 payment) */}
              <div className="inline-block p-4 bg-white rounded-2xl shadow-2xl mb-4 border-2 border-[#c5a059]">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi%3A%2F%2Fpay%3Fpa%3Dprashankpathak%40fam%26pn%3DVakil%2520Duniya%26am%3D199.00%26cu%3DINR%26tn%3DAdvocate%2520Portal%2520Activation" 
                  alt="UPI QR Code for ₹199" 
                  className="w-48 h-48 object-contain mx-auto"
                />
                <div className="mt-2 text-center">
                  <span className="block text-xs text-black font-bold font-sans">Direct Amount: ₹199.00</span>
                  <span className="block text-[10px] text-gray-600 font-mono mt-0.5">Scan with GPay / PhonePe / Paytm / BHIM</span>
                </div>
              </div>

              {/* Transaction ID / UTR input for reference */}
              <div className="max-w-sm mx-auto mb-4 text-left">
                <label className="block text-[11px] text-gray-400 mb-1">UPI Transaction Reference / UTR (Optional):</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 423984029412"
                  className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a059] font-mono"
                />
              </div>

              {/* Fast Activation Button */}
              <button
                type="button"
                onClick={handleFinalizeOnboarding}
                disabled={verifyingPayment}
                className="w-full py-4 bg-gradient-to-r from-[#c5a059] to-[#d8b878] text-black font-bold text-sm uppercase tracking-wider rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {verifyingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Details & Activating Portal...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>I Have Paid ₹199 • Activate Lawyer Portal</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setCurrentView('register_step2')}
                className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
              >
                Edit Lawyer Details
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
