import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';

const initialState = {
  user: null,
  modalOpen: false,
};

export const useAuthStore = create((set, get) => ({
  ...initialState,

  setUser: (user) => set({ user }),
  
  openModal: () => set({ modalOpen: true }),
  
  closeModal: () => set({ modalOpen: false }),
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  addFavorite: (propertyId) => {
    const user = get().user;
    if (!user) return;
    const favorites = user.favorites || [];
    if (!favorites.includes(propertyId)) {
      set({ user: { ...user, favorites: [...favorites, propertyId] } });
    }
  },
  removeFavorite: (propertyId) => {
    const user = get().user;
    if (!user) return;
    const favorites = user.favorites || [];
    set({ user: { ...user, favorites: favorites.filter(id => id !== propertyId) } });
  },
  isFavorite: (propertyId) => {
    const user = get().user;
    return user?.favorites?.includes(propertyId);
  },
}));

// Listen to Supabase auth state changes
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