import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  User
} from "firebase/auth";
import { 
  initializeFirestore,
  getFirestore,
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  deleteDoc,
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { Lawyer, PlatformUser, AppointmentStatus } from "./types";

// Initialize Firebase App & Auth with provisioned config
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with robust long-polling auto-detection for sandboxed/proxy environments
const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  }, databaseId);
} catch (err) {
  try {
    firestoreDb = getFirestore(app, databaseId);
  } catch (e) {
    firestoreDb = getFirestore(app);
  }
}
export const db = firestoreDb;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string;
  phone?: string;
  whatsappNumber?: string;
  officePhone?: string;
  role?: 'admin' | 'client' | 'lawyer';
  lawyerId?: string;
  barEnrollment?: string;
  isVerifiedLawyer?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalRemarks?: string;
  portalFeePaid?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface FirestoreBookingData {
  id?: string;
  userId: string;
  userEmail: string;
  name: string;
  mobile: string;
  case_type: string;
  appointment_date: string;
  lawyer_id: string;
  lawyer_name?: string;
  lawyer_city?: string;
  lawyer_specialization?: string;
  consultation_mode: string;
  status?: AppointmentStatus;
  remarks?: string;
  payment_status: string;
  created_at: string;
}

// Initial default lawyers to seed in Firestore if empty
export const INITIAL_DEFAULT_LAWYERS: Lawyer[] = [
  { 
    id: 'l1', 
    name: "Advocate Pathak", 
    specialization: "Civil & Property Dispute", 
    experience: "5 Years", 
    consultation_fee: 599, 
    city: "Jabalpur", 
    language: ["Hindi", "English"], 
    rating: 4.8, 
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80", 
    mobile_number: "6263364561", 
    bar_enrollment: "MP/1024/2021",
    consultation_mode: "Online Consultation",
    is_verified: true,
    approval_status: 'approved'
  },
  { 
    id: 'l2', 
    name: "Advocate Sharma", 
    specialization: "Family Matter", 
    experience: "8 Years", 
    consultation_fee: 599, 
    city: "Delhi", 
    language: ["Hindi", "English"], 
    rating: 4.9, 
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", 
    mobile_number: "9876543210", 
    bar_enrollment: "D/4512/2018",
    consultation_mode: "Online Consultation",
    is_verified: true,
    approval_status: 'approved'
  },
  { 
    id: 'l3', 
    name: "Advocate Singh", 
    specialization: "Civil & Property Dispute", 
    experience: "12 Years", 
    consultation_fee: 799, 
    city: "Mumbai", 
    language: ["English", "Marathi"], 
    rating: 4.7, 
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&q=80", 
    mobile_number: "9123456780", 
    bar_enrollment: "MAH/7890/2014",
    consultation_mode: "Online Consultation",
    is_verified: true,
    approval_status: 'approved'
  },
  { 
    id: 'l4', 
    name: "Advocate Verma", 
    specialization: "Corporate Law", 
    experience: "4 Years", 
    consultation_fee: 899, 
    city: "Bangalore", 
    language: ["English"], 
    rating: 4.5, 
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80", 
    mobile_number: "9988776655", 
    bar_enrollment: "KAR/2341/2022",
    consultation_mode: "Online Consultation",
    is_verified: true,
    approval_status: 'approved'
  }
];

// Local cache helper for profiles
function getCachedProfile(uid: string): UserProfileData | null {
  try {
    const raw = localStorage.getItem(`vd_user_profile_${uid}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function setCachedProfile(uid: string, profile: UserProfileData) {
  try {
    localStorage.setItem(`vd_user_profile_${uid}`, JSON.stringify(profile));
  } catch (e) {}
}

// -------------------------------------------------------------
// USER AUTH & PROFILE FIRESTORE INTEGRATION
// -------------------------------------------------------------

/**
 * Register a new user with Email, Password, Name, and Phone into Firebase Auth & Firestore
 */
export async function registerWithEmail(email: string, pass: string, name: string, phone: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const user = cred.user;

  try {
    await updateProfile(user, { displayName: name });
  } catch (e) {
    console.warn("Could not update displayName on auth object:", e);
  }

  const role = email.toLowerCase() === 'prashankpathak@gmail.com' ? 'admin' : 'client';

  const profileData: UserProfileData = {
    uid: user.uid,
    email: user.email,
    displayName: name,
    phone: phone,
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  setCachedProfile(user.uid, profileData);

  // Store User document in Firestore
  try {
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      ...profileData,
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp()
    }, { merge: true });
  } catch (err: any) {
    console.warn("Firestore user profile save notice:", err?.message);
  }

  // Also sync with server backend
  try {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.uid,
        name,
        email: user.email,
        mobile: phone,
        role
      })
    });
  } catch (e) {}

  return { user, profile: profileData };
}

/**
 * Login existing user with Email and Password
 */
export async function loginWithEmail(email: string, pass: string) {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const user = cred.user;
  const profile = await fetchUserProfile(user.uid, user);
  return { user, profile };
}

/**
 * Sign in with Google Popup and persist profile to Firestore
 */
export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  const user = cred.user;

  const role = user.email?.toLowerCase() === 'prashankpathak@gmail.com' ? 'admin' : 'client';

  const fallbackProfile: UserProfileData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || "Client",
    phone: user.phoneNumber || "",
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  let profile = getCachedProfile(user.uid) || fallbackProfile;

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      profile = fallbackProfile;
      await setDoc(userDocRef, {
        ...profile,
        createdAtServer: serverTimestamp(),
        updatedAtServer: serverTimestamp()
      }, { merge: true });
    } else {
      profile = { ...fallbackProfile, ...userSnap.data() } as UserProfileData;
    }
  } catch (err: any) {
    console.warn("Firestore profile read/write notice during Google login:", err?.message);
  }

  setCachedProfile(user.uid, profile);

  // Sync with backend API
  try {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.uid,
        name: profile.displayName,
        email: profile.email,
        mobile: profile.phone || "",
        role: profile.role || role
      })
    });
  } catch (e) {}

  return { user, profile };
}

export async function sendUserPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  return signOut(auth);
}

export async function fetchUserProfile(uid: string, fallbackUser?: User | null): Promise<UserProfileData | null> {
  const cached = getCachedProfile(uid);

  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfileData;
      setCachedProfile(uid, data);
      return data;
    }
  } catch (error: any) {
    console.warn("Firestore user profile fetch notice:", error?.message);
  }

  if (cached) return cached;

  if (fallbackUser) {
    const role = fallbackUser.email?.toLowerCase() === 'prashankpathak@gmail.com' ? 'admin' : 'client';
    const defProfile: UserProfileData = {
      uid: fallbackUser.uid,
      email: fallbackUser.email,
      displayName: fallbackUser.displayName || fallbackUser.email?.split('@')[0] || "Client",
      phone: fallbackUser.phoneNumber || "",
      role
    };
    setCachedProfile(uid, defProfile);
    return defProfile;
  }

  return null;
}

// -------------------------------------------------------------
// LAWYERS FIRESTORE PERSISTENCE & SYNC
// -------------------------------------------------------------

/**
 * Fetch lawyers from Firestore with server fallback and seed default directory if empty
 */
export async function fetchLawyersFromFirestore(): Promise<Lawyer[]> {
  try {
    const lawyersCol = collection(db, "lawyers");
    const snapshot = await getDocs(lawyersCol);
    
    if (!snapshot.empty) {
      const list: Lawyer[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          uid: d.uid,
          name: d.name,
          email: d.email,
          specialization: d.specialization,
          experience: d.experience,
          consultation_fee: d.consultation_fee,
          city: d.city,
          state: d.state,
          address: d.address,
          pincode: d.pincode,
          language: Array.isArray(d.language) ? d.language : ["Hindi", "English"],
          rating: d.rating || 5.0,
          image: d.image || "",
          mobile_number: d.mobile_number || "",
          whatsapp_number: d.whatsapp_number || d.mobile_number || "",
          office_phone: d.office_phone || "",
          upi_id: d.upi_id || "",
          bar_enrollment: d.bar_enrollment || "",
          bio: d.bio || "",
          consultation_mode: d.consultation_mode || "Online Consultation",
          is_verified: d.is_verified !== undefined ? d.is_verified : (d.approval_status === 'approved'),
          approval_status: d.approval_status || (d.is_verified ? 'approved' : 'pending'),
          approval_remarks: d.approval_remarks || '',
          portal_fee_paid: d.portal_fee_paid !== undefined ? d.portal_fee_paid : true,
          created_at: d.created_at || ''
        });
      });
      return list;
    } else {
      // First time initialization: seed initial lawyers to Firestore
      for (const lawyer of INITIAL_DEFAULT_LAWYERS) {
        try {
          await setDoc(doc(db, "lawyers", lawyer.id), {
            ...lawyer,
            createdAtServer: serverTimestamp()
          });
        } catch (e) {}
      }
      return INITIAL_DEFAULT_LAWYERS;
    }
  } catch (error) {
    console.warn("Firestore lawyers fetch fallback to server:", error);
    try {
      const res = await fetch('/api/lawyers');
      if (res.ok) return await res.json();
    } catch (e) {}
    return INITIAL_DEFAULT_LAWYERS;
  }
}

/**
 * Save lawyer to Firestore and backend API
 */
export async function saveLawyerToFirestore(lawyer: Lawyer): Promise<boolean> {
  const lawyerId = lawyer.id || `l${Date.now()}`;
  const completeLawyer: Lawyer = { 
    ...lawyer, 
    id: lawyerId,
    is_verified: lawyer.is_verified !== undefined ? lawyer.is_verified : (lawyer.approval_status === 'approved'),
    approval_status: lawyer.approval_status || (lawyer.is_verified ? 'approved' : 'pending')
  };

  // 1. Save to Firestore
  try {
    const lawyerRef = doc(db, "lawyers", lawyerId);
    await setDoc(lawyerRef, {
      ...completeLawyer,
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore lawyer save notice:", err);
  }

  // 2. Save to backend API
  try {
    await fetch('/api/lawyers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completeLawyer)
    });
  } catch (err) {
    console.warn("Backend lawyer save notice:", err);
  }

  return true;
}

/**
 * Delete lawyer from Firestore and backend API
 */
export async function deleteLawyerFromFirestore(lawyerId: string): Promise<boolean> {
  try {
    const lawyerRef = doc(db, "lawyers", lawyerId);
    await deleteDoc(lawyerRef);
  } catch (err) {
    console.warn("Firestore lawyer delete notice:", err);
  }

  try {
    await fetch(`/api/lawyers/${lawyerId}`, { method: 'DELETE' });
  } catch (err) {}

  return true;
}

/**
 * Real-time listener for lawyers directory
 */
export function subscribeToLawyers(onUpdate: (lawyers: Lawyer[]) => void) {
  try {
    const lawyersCol = collection(db, "lawyers");
    return onSnapshot(lawyersCol, (snapshot) => {
      if (!snapshot.empty) {
        const list: Lawyer[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            uid: d.uid,
            name: d.name,
            email: d.email,
            specialization: d.specialization,
            experience: d.experience,
            consultation_fee: d.consultation_fee,
            city: d.city,
            state: d.state,
            address: d.address,
            pincode: d.pincode,
            language: Array.isArray(d.language) ? d.language : ["Hindi", "English"],
            rating: d.rating || 5.0,
            image: d.image || "",
            mobile_number: d.mobile_number || "",
            whatsapp_number: d.whatsapp_number || d.mobile_number || "",
            office_phone: d.office_phone || "",
            upi_id: d.upi_id || "",
            bar_enrollment: d.bar_enrollment || "",
            bio: d.bio || "",
            consultation_mode: d.consultation_mode || "Online Consultation",
            is_verified: d.is_verified !== undefined ? d.is_verified : (d.approval_status === 'approved'),
            approval_status: d.approval_status || (d.is_verified ? 'approved' : 'pending'),
            approval_remarks: d.approval_remarks || '',
            portal_fee_paid: d.portal_fee_paid !== undefined ? d.portal_fee_paid : true,
            created_at: d.created_at || ''
          });
        });
        onUpdate(list);
      } else {
        fetchLawyersFromFirestore().then(onUpdate);
      }
    }, (error) => {
      console.warn("Firestore lawyers snapshot notice:", error?.message);
      fetchLawyersFromFirestore().then(onUpdate);
    });
  } catch (e) {
    fetchLawyersFromFirestore().then(onUpdate);
    return () => {};
  }
}

// -------------------------------------------------------------
// USERS FIRESTORE PERSISTENCE & SYNC
// -------------------------------------------------------------

export async function fetchUsersFromFirestore(): Promise<PlatformUser[]> {
  try {
    const usersCol = collection(db, "users");
    const snapshot = await getDocs(usersCol);
    if (!snapshot.empty) {
      const list: PlatformUser[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          name: d.displayName || d.name || "Client",
          email: d.email || "",
          mobile: d.phone || d.mobile || "",
          role: d.role || (d.email?.toLowerCase() === 'prashankpathak@gmail.com' ? 'admin' : 'client'),
          created_at: d.createdAt || new Date().toISOString()
        });
      });
      return list;
    }
  } catch (err) {
    console.warn("Firestore users fetch notice:", err);
  }

  try {
    const res = await fetch('/api/users');
    if (res.ok) return await res.json();
  } catch (e) {}

  return [];
}

export async function saveUserToFirestore(userData: PlatformUser): Promise<boolean> {
  const userId = userData.id || `u${Date.now()}`;
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, {
      uid: userId,
      displayName: userData.name,
      name: userData.name,
      email: userData.email,
      phone: userData.mobile,
      mobile: userData.mobile,
      role: userData.role || "client",
      createdAt: userData.created_at || new Date().toISOString(),
      updatedAtServer: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore user save notice:", err);
  }

  try {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
  } catch (err) {}

  return true;
}

export async function deleteUserFromFirestore(userId: string): Promise<boolean> {
  try {
    const userDocRef = doc(db, "users", userId);
    await deleteDoc(userDocRef);
  } catch (err) {}

  try {
    await fetch(`/api/users/${userId}`, { method: 'DELETE' });
  } catch (err) {}

  return true;
}

// -------------------------------------------------------------
// BOOKINGS FIRESTORE PERSISTENCE & SYNC
// -------------------------------------------------------------

/**
 * Save booking to Firestore and sync to backend API
 */
export async function saveBookingToFirestore(booking: Omit<FirestoreBookingData, 'id'>) {
  let docId = `b${Date.now()}`;
  try {
    const bookingsCol = collection(db, "bookings");
    const docRef = await addDoc(bookingsCol, {
      ...booking,
      status: booking.status || "Pending",
      createdAtServer: serverTimestamp()
    });
    docId = docRef.id;

    if (booking.userId) {
      try {
        const userRef = doc(db, "users", booking.userId);
        await setDoc(userRef, { lastBookingAt: serverTimestamp() }, { merge: true });
      } catch (e) {}
    }
  } catch (error: any) {
    console.warn("Firestore booking save notice (falling back to server sync):", error?.message);
  }

  // Also sync to server API
  try {
    await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...booking, id: docId })
    });
  } catch (e) {}

  return docId;
}

/**
 * Update booking status in Firestore & backend API
 */
export async function updateBookingStatus(bookingId: string, status: AppointmentStatus | string, remarks?: string) {
  // Update Firestore
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await setDoc(bookingRef, {
      status,
      remarks: remarks || "",
      updatedAtServer: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn("Firestore booking status update notice:", e);
  }

  // Update backend API
  try {
    const res = await fetch(`/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, remarks })
    });
    return res.ok;
  } catch (e) {
    console.error("Backend status update error:", e);
    return false;
  }
}

/**
 * Delete booking from Firestore & backend
 */
export async function deleteBookingFromFirestore(bookingId: string) {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await deleteDoc(bookingRef);
  } catch (e) {}

  try {
    await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
  } catch (e) {}

  return true;
}

/**
 * Fetch all bookings from Firestore with server fallback
 */
export async function fetchAllBookingsFromFirestore(): Promise<FirestoreBookingData[]> {
  try {
    const bookingsCol = collection(db, "bookings");
    const snapshot = await getDocs(bookingsCol);
    if (!snapshot.empty) {
      const list: FirestoreBookingData[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as FirestoreBookingData);
      });
      list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      return list;
    }
  } catch (err) {
    console.warn("Firestore all bookings fetch notice:", err);
  }

  try {
    const res = await fetch('/api/bookings');
    if (res.ok) return await res.json();
  } catch (e) {}

  return [];
}

/**
 * Subscribe to current user's bookings in real-time with automatic fallback
 */
export function subscribeToUserBookings(userId: string, onUpdate: (bookings: FirestoreBookingData[]) => void) {
  let isUnsubscribed = false;

  const fetchFromServer = async () => {
    try {
      const res = await fetch(`/api/bookings?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const list = await res.json();
        if (!isUnsubscribed) {
          onUpdate(list);
        }
      }
    } catch (e) {
      console.warn("Server booking fetch fallback error:", e);
    }
  };

  try {
    const bookingsCol = collection(db, "bookings");
    const q = query(
      bookingsCol,
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isUnsubscribed) return;
      const list: FirestoreBookingData[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as FirestoreBookingData);
      });
      list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      
      if (list.length > 0) {
        onUpdate(list);
      } else {
        fetchFromServer();
      }
    }, (error) => {
      console.warn("Firestore snapshot listener notice (switching to server sync):", error?.message);
      fetchFromServer();
    });

    return () => {
      isUnsubscribed = true;
      if (unsubscribe) unsubscribe();
    };
  } catch (err) {
    fetchFromServer();
    return () => {
      isUnsubscribed = true;
    };
  }
}

// -------------------------------------------------------------
// LAWYER PORTAL ONBOARDING & DASHBOARD FUNCTIONS
// -------------------------------------------------------------

export interface LawyerOnboardingData {
  uid: string;
  email: string;
  name: string;
  mobile: string;
  whatsappNumber?: string;
  officePhone?: string;
  barEnrollment: string;
  specialization: string;
  experience: string;
  consultationFee: number;
  consultationMode: string;
  city: string;
  state: string;
  address: string;
  pincode: string;
  language: string[];
  image: string;
  bio: string;
  portalFeePaid: boolean;
  transactionId?: string;
  upiId?: string;
}

/**
 * Save / Complete Lawyer Onboarding in Firestore & Sync with Backend
 */
export async function completeLawyerOnboarding(data: LawyerOnboardingData): Promise<{ success: boolean; lawyerId: string; error?: string }> {
  try {
    const lawyerId = `l_${data.uid || Date.now()}`;

    const lawyerRecord: Lawyer = {
      id: lawyerId,
      uid: data.uid,
      name: data.name.startsWith("Advocate") || data.name.startsWith("Adv.") ? data.name : `Advocate ${data.name}`,
      email: data.email,
      specialization: data.specialization || "Civil & Property Dispute",
      experience: data.experience || "5 Years",
      consultation_fee: Number(data.consultationFee || 599),
      city: data.city || "Jabalpur",
      state: data.state || "Madhya Pradesh",
      address: data.address || "",
      pincode: data.pincode || "",
      language: data.language && data.language.length > 0 ? data.language : ["Hindi", "English"],
      rating: 5.0,
      image: data.image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
      mobile_number: data.mobile,
      whatsapp_number: data.whatsappNumber || data.mobile,
      office_phone: data.officePhone || "",
      upi_id: data.upiId || "",
      consultation_mode: data.consultationMode || "Online Consultation",
      bar_enrollment: data.barEnrollment,
      bio: data.bio || "",
      is_verified: false,
      approval_status: 'pending',
      portal_fee_paid: data.portalFeePaid,
      created_at: new Date().toISOString()
    };

    // 1. Save to /lawyers in Firestore
    try {
      const lawyerDocRef = doc(db, "lawyers", lawyerId);
      await setDoc(lawyerDocRef, {
        ...lawyerRecord,
        portalFeeAmount: 199,
        transactionId: data.transactionId || `TXN${Date.now()}`,
        createdAtServer: serverTimestamp(),
        updatedAtServer: serverTimestamp()
      }, { merge: true });
    } catch (fsErr: any) {
      console.warn("Firestore lawyer save notice (falling back to backend API):", fsErr?.message);
    }

    // 2. Update User Profile in /users in Firestore & Local cache
    const userProfile: UserProfileData = {
      uid: data.uid,
      email: data.email,
      displayName: lawyerRecord.name,
      phone: data.mobile,
      whatsappNumber: data.whatsappNumber || data.mobile,
      officePhone: data.officePhone || "",
      role: 'lawyer',
      lawyerId: lawyerId,
      barEnrollment: data.barEnrollment,
      isVerifiedLawyer: false,
      approvalStatus: 'pending',
      portalFeePaid: true,
      updatedAt: new Date().toISOString()
    };

    try {
      const userDocRef = doc(db, "users", data.uid);
      await setDoc(userDocRef, {
        ...userProfile,
        updatedAtServer: serverTimestamp()
      }, { merge: true });
    } catch (fsErr: any) {
      console.warn("Firestore user profile save notice (falling back to local cache & backend API):", fsErr?.message);
    }

    setCachedProfile(data.uid, userProfile);

    // 3. Sync with backend API
    try {
      await fetch('/api/lawyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lawyerRecord)
      });

      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.uid,
          name: lawyerRecord.name,
          email: data.email,
          mobile: data.mobile,
          role: 'lawyer',
          bar_enrollment: data.barEnrollment,
          city: data.city,
          approval_status: 'pending'
        })
      });
    } catch (e) {
      console.warn("Backend sync notice for lawyer onboarding:", e);
    }

    return { success: true, lawyerId };
  } catch (error: any) {
    console.error("Error completing lawyer onboarding:", error);
    return { success: false, lawyerId: '', error: error?.message || "Failed to complete lawyer onboarding" };
  }
}

/**
 * Approve or Reject lawyer status by Admin
 */
export async function updateLawyerApprovalStatus(
  lawyerId: string, 
  status: 'pending' | 'approved' | 'rejected', 
  remarks?: string
): Promise<boolean> {
  const is_verified = status === 'approved';
  
  // 1. Try Firestore update
  try {
    const lawyerDocRef = doc(db, "lawyers", lawyerId);
    const lawyerSnap = await getDoc(lawyerDocRef);
    let lawyerData: any = {};
    if (lawyerSnap.exists()) {
      lawyerData = lawyerSnap.data();
    }
    
    await setDoc(lawyerDocRef, {
      ...lawyerData,
      approval_status: status,
      is_verified,
      approval_remarks: remarks || '',
      updatedAtServer: serverTimestamp()
    }, { merge: true });

    const uid = lawyerData.uid || (lawyerId.startsWith('l_') ? lawyerId.replace('l_', '') : null);
    if (uid) {
      try {
        const userDocRef = doc(db, "users", uid);
        await setDoc(userDocRef, {
          isVerifiedLawyer: is_verified,
          approvalStatus: status,
          approvalRemarks: remarks || '',
          updatedAtServer: serverTimestamp()
        }, { merge: true });

        const cached = getCachedProfile(uid);
        if (cached) {
          setCachedProfile(uid, {
            ...cached,
            isVerifiedLawyer: is_verified,
            approvalStatus: status,
            approvalRemarks: remarks || ''
          });
        }
      } catch (e) {}
    }
  } catch (err: any) {
    console.warn("Firestore approval status update notice (continuing with backend API):", err?.message);
  }

  // 2. Update backend API
  try {
    const res = await fetch(`/api/lawyers/${lawyerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approval_status: status,
        is_verified,
        approval_remarks: remarks || ''
      })
    });
    return res.ok;
  } catch (e) {
    console.error("Backend lawyer approval update error:", e);
    return true; // Still return true if updated locally
  }
}

/**
 * Fetch Lawyer profile by Firebase User UID or Email
 */
export async function fetchLawyerByUidOrEmail(uid: string, email?: string): Promise<Lawyer | null> {
  try {
    // Check by UID first
    const lawyerDocRef = doc(db, "lawyers", `l_${uid}`);
    const docSnap = await getDoc(lawyerDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Lawyer;
    }

    // Query collection by uid field
    const lawyersCol = collection(db, "lawyers");
    const qUid = query(lawyersCol, where("uid", "==", uid));
    const snapUid = await getDocs(qUid);
    if (!snapUid.empty) {
      const first = snapUid.docs[0];
      return { id: first.id, ...first.data() } as Lawyer;
    }

    // Query by email if available
    if (email) {
      const qEmail = query(lawyersCol, where("email", "==", email));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        const first = snapEmail.docs[0];
        return { id: first.id, ...first.data() } as Lawyer;
      }
    }
  } catch (err) {
    console.warn("Firestore lawyer fetch notice:", err);
  }

  // Fallback to server API
  try {
    const res = await fetch('/api/lawyers');
    if (res.ok) {
      const lawyers: Lawyer[] = await res.json();
      const found = lawyers.find(l => l.uid === uid || (email && l.email?.toLowerCase() === email.toLowerCase()));
      if (found) return found;
    }
  } catch (e) {}

  return null;
}

/**
 * Update Lawyer Profile
 */
export async function updateLawyerProfileInFirestore(lawyerId: string, updates: Partial<Lawyer>): Promise<boolean> {
  try {
    const lawyerRef = doc(db, "lawyers", lawyerId);
    await setDoc(lawyerRef, {
      ...updates,
      updatedAtServer: serverTimestamp()
    }, { merge: true });
  } catch (err: any) {
    console.warn("Firestore lawyer profile update notice:", err?.message);
  }

  // Sync to backend
  try {
    const res = await fetch(`/api/lawyers/${lawyerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.ok;
  } catch (err) {
    console.error("Error syncing lawyer update to server:", err);
    return false;
  }
}

/**
 * Real-time subscription to appointments for a specific lawyer
 */
export function subscribeToLawyerBookings(lawyerId: string, lawyerName: string, onUpdate: (bookings: FirestoreBookingData[]) => void) {
  let isUnsubscribed = false;

  const fetchFromServer = async () => {
    try {
      const res = await fetch(`/api/bookings`);
      if (res.ok) {
        const all: FirestoreBookingData[] = await res.json();
        const filtered = all.filter(b => 
          b.lawyer_id === lawyerId || 
          (lawyerName && b.lawyer_name?.toLowerCase().includes(lawyerName.toLowerCase()))
        );
        if (!isUnsubscribed) onUpdate(filtered);
      }
    } catch (e) {}
  };

  try {
    const bookingsCol = collection(db, "bookings");
    const q = query(bookingsCol, where("lawyer_id", "==", lawyerId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isUnsubscribed) return;
      const list: FirestoreBookingData[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as FirestoreBookingData);
      });
      list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

      if (list.length > 0) {
        onUpdate(list);
      } else {
        fetchFromServer();
      }
    }, () => {
      fetchFromServer();
    });

    return () => {
      isUnsubscribed = true;
      if (unsubscribe) unsubscribe();
    };
  } catch (e) {
    fetchFromServer();
    return () => {
      isUnsubscribed = true;
    };
  }
}

