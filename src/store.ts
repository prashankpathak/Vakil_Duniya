import { create } from 'zustand';

type Page = 'home' | 'lawyers' | 'services' | 'book' | 'about' | 'admin' | 'owner-login' | 'owner-dashboard';

interface NavigationState {
  currentPage: Page;
  selectedLawyerId: string | null;
  navigate: (page: Page) => void;
  bookLawyer: (lawyerId: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'home',
  selectedLawyerId: null,
  navigate: (page: Page) => set({ currentPage: page }),
  bookLawyer: (lawyerId: string) => set({ selectedLawyerId: lawyerId, currentPage: 'book' }),
}));
