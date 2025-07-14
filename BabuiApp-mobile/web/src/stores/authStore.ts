import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';
import { User as AppUser } from '../types';

interface AuthState {
  user: AppUser | null;
  modalOpen: boolean;
  setUser: (user: AppUser | null) => void;
  openModal: () => void;
  closeModal: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  modalOpen: false,
  setUser: (user) => set({ user }),
  openModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));

// Listen to Supabase auth state changes
declare global {
  interface Window { _supabaseAuthListener?: boolean; }
}
if (typeof window !== 'undefined' && !window._supabaseAuthListener) {
  window._supabaseAuthListener = true;
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      useAuthStore.getState().setUser({
        id: session.user.id,
        name: session.user.user_metadata?.name || '',
        nameBn: '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        preferredLanguage: 'en',
        favorites: [],
      });
      useAuthStore.getState().closeModal();
    }
    if (event === 'SIGNED_OUT') {
      useAuthStore.getState().setUser(null);
    }
  });
} 