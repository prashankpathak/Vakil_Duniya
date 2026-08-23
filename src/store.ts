import { create } from 'zustand';
import { User } from 'firebase/auth';
import { UserProfile } from './types';
import { logoutUser } from './firebase';

export type Page = 'home' | 'lawyers' | 'services' | 'book' | 'my-bookings' | 'admin' | 'owner-login' | 'owner-dashboard' | 'lawyer-portal' | 'lawyer-dashboard';

interface AppState {
  currentPage: Page;
  selectedLawyerId: string | null;
  navigate: (page: Page) => void;
  bookLawyer: (lawyerId: string) => void;

  // Firebase Auth State
  user: User | null;
  userProfile: UserProfile | null;
  authLoading: boolean;
  setUser: (user: User | null, profile?: UserProfile | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setAuthLoading: (loading: boolean) => void;
  logout: () => Promise<void>;

  // Auth Modal State
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'forgot';
  authModalMessage: string;
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot', customMessage?: string) => void;
  closeAuthModal: () => void;
}

export const useNavigationStore = create<AppState>((set, get) => ({
  currentPage: 'home',
  selectedLawyerId: null,
  navigate: (page: Page) => set({ currentPage: page }),
  bookLawyer: (lawyerId: string) => {
    const { user, openAuthModal } = get();
    set({ selectedLawyerId: lawyerId, currentPage: 'book' });
    if (!user) {
      openAuthModal('signup', 'Please sign in or create an account to book your consultation.');
    }
  },

  // Auth State
  user: null,
  userProfile: null,
  authLoading: true,
  setUser: (user, profile = null) => set({ user, userProfile: profile, authLoading: false }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  logout: async () => {
    await logoutUser();
    set({ user: null, userProfile: null });
  },

  // Auth Modal
  isAuthModalOpen: false,
  authModalMode: 'signup',
  authModalMessage: '',
  openAuthModal: (mode = 'signup', customMessage = '') => 
    set({ isAuthModalOpen: true, authModalMode: mode, authModalMessage: customMessage }),
  closeAuthModal: () => 
    set({ isAuthModalOpen: false, authModalMessage: '' }),
}));
