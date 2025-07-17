import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';
import authLogger from '../utils/authLogger';

const initialState = {
  user: null,
  modalOpen: false,
  globalModalOpen: false,
  guestMode: false,
};

export const useAuthStore = create((set, get) => ({
  ...initialState,

  setUser: (user) => {
    const oldState = get();
    authLogger.storeStateChange('setUser', oldState, { ...oldState, user, guestMode: false });
    set({ user, guestMode: false });
    authLogger.info('AuthStore', 'User set', { userId: user?.id, email: user?.email });
  },
  
  openModal: () => set({ modalOpen: true }),
  
  closeModal: () => set({ modalOpen: false }),

  openGlobalModal: () => set({ globalModalOpen: true }),
  closeGlobalModal: () => set({ globalModalOpen: false }),

  setGuestMode: (val) => {
    const oldState = get();
    authLogger.storeStateChange('setGuestMode', oldState, { ...oldState, guestMode: val });
    
    // Update the state
    set({ guestMode: val });
    
    if (val) {
      authLogger.guestModeActivated();
    } else {
      authLogger.guestModeDeactivated();
      
      // When disabling guest mode, ensure we're in a clean state
      // This helps prevent navigation issues
      authLogger.info('AuthStore', 'Guest mode disabled, ensuring clean state');
    }
  },
  
  signOut: async (navigation) => {
    authLogger.info('AuthStore', 'Sign out initiated');
    try {
      await supabase.auth.signOut();
      const oldState = get();
      authLogger.storeStateChange('signOut', oldState, { ...oldState, user: null });
      set({ user: null });
      
      if (navigation) {
        authLogger.navigationAttempt('Current', 'SignIn', { user: null, guestMode: false });
        navigation.replace('SignIn');
      }
      authLogger.info('AuthStore', 'Sign out completed');
    } catch (error) {
      authLogger.logError('AuthStore', error, { action: 'signOut' });
    }
  },

  // Fetch user data including favorites and myproperties from database
  fetchUserData: async (userId) => {
    authLogger.info('AuthStore', 'Fetching user data', { userId });
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        authLogger.userDataFetch(userId, false, { error: error.message });
        throw error;
      }
      
      authLogger.userDataFetch(userId, true, {
        hasFavorites: !!data.favorites,
        favoritesCount: data.favorites?.length || 0,
        hasMyProperties: !!data.myproperties,
        myPropertiesCount: data.myproperties?.length || 0
      });
      
      // Update user state with database data
      const newUser = {
        id: data.id,
        name: data.name_en || '',
        nameBn: data.name_bn || '',
        email: data.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        preferredLanguage: 'en',
        favorites: data.favorites || [],
        myproperties: data.myproperties || [],
        ...data
      };
      
      const oldState = get();
      authLogger.storeStateChange('fetchUserData', oldState, { ...oldState, user: newUser });
      set({ user: newUser });
      
      return data;
    } catch (error) {
      authLogger.logError('AuthStore', error, { action: 'fetchUserData', userId });
      return null;
    }
  },

  // Add property to favorites
  addFavorite: async (propertyId) => {
    const user = get().user;
    if (!user) {
      authLogger.warn('AuthStore', 'Cannot add favorite - no user logged in');
      return false;
    }
    
    authLogger.info('AuthStore', 'Adding property to favorites', { propertyId, userId: user.id });
    
    try {
      const currentFavorites = user.favorites || [];
      if (currentFavorites.includes(propertyId)) {
        authLogger.info('AuthStore', 'Property already in favorites', { propertyId });
        return true; // Already favorited
      }
      
      const newFavorites = [...currentFavorites, propertyId];
      
      // Update database
      const { error } = await supabase
        .from('users')
        .update({ favorites: newFavorites })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      const oldState = get();
      const newUser = { ...user, favorites: newFavorites };
      authLogger.storeStateChange('addFavorite', oldState, { ...oldState, user: newUser });
      set({ user: newUser });
      
      authLogger.info('AuthStore', 'Property added to favorites successfully', { propertyId });
      return true;
    } catch (error) {
      authLogger.logError('AuthStore', error, { action: 'addFavorite', propertyId });
      return false;
    }
  },

  // Remove property from favorites
  removeFavorite: async (propertyId) => {
    const user = get().user;
    if (!user) {
      authLogger.warn('AuthStore', 'Cannot remove favorite - no user logged in');
      return false;
    }
    
    authLogger.info('AuthStore', 'Removing property from favorites', { propertyId, userId: user.id });
    
    try {
      const currentFavorites = user.favorites || [];
      const newFavorites = currentFavorites.filter(id => id !== propertyId);
      
      // Update database
      const { error } = await supabase
        .from('users')
        .update({ favorites: newFavorites })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      const oldState = get();
      const newUser = { ...user, favorites: newFavorites };
      authLogger.storeStateChange('removeFavorite', oldState, { ...oldState, user: newUser });
      set({ user: newUser });
      
      authLogger.info('AuthStore', 'Property removed from favorites successfully', { propertyId });
      return true;
    } catch (error) {
      authLogger.logError('AuthStore', error, { action: 'removeFavorite', propertyId });
      return false;
    }
  },

  // Check if property is favorited
  isFavorite: (propertyId) => {
    const user = get().user;
    const isFavorited = user?.favorites?.includes(propertyId) || false;
    authLogger.debug('AuthStore', 'Checking if property is favorited', { propertyId, isFavorited });
    return isFavorited;
  },

  // Toggle favorite status
  toggleFavorite: async (propertyId) => {
    const user = get().user;
    if (!user) {
      authLogger.warn('AuthStore', 'Cannot toggle favorite - no user logged in');
      return false;
    }
    
    const isFavorited = get().isFavorite(propertyId);
    authLogger.info('AuthStore', 'Toggling favorite status', { propertyId, currentStatus: isFavorited });
    
    if (isFavorited) {
      return await get().removeFavorite(propertyId);
    } else {
      return await get().addFavorite(propertyId);
    }
  },

  // Add property to myproperties (when user posts a property)
  addMyProperty: async (propertyId) => {
    const user = get().user;
    if (!user) {
      authLogger.warn('AuthStore', 'Cannot add my property - no user logged in');
      return false;
    }
    
    authLogger.info('AuthStore', 'Adding property to myproperties', { propertyId, userId: user.id });
    
    try {
      const currentMyProperties = user.myproperties || [];
      if (currentMyProperties.includes(propertyId)) {
        authLogger.info('AuthStore', 'Property already in myproperties', { propertyId });
        return true; // Already in myproperties
      }
      
      const newMyProperties = [...currentMyProperties, propertyId];
      
      // Update database
      const { error } = await supabase
        .from('users')
        .update({ myproperties: newMyProperties })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      const oldState = get();
      const newUser = { ...user, myproperties: newMyProperties };
      authLogger.storeStateChange('addMyProperty', oldState, { ...oldState, user: newUser });
      set({ user: newUser });
      
      authLogger.info('AuthStore', 'Property added to myproperties successfully', { propertyId });
      return true;
    } catch (error) {
      authLogger.logError('AuthStore', error, { action: 'addMyProperty', propertyId });
      return false;
    }
  },

  // Remove property from myproperties
  removeMyProperty: async (propertyId) => {
    const user = get().user;
    if (!user) {
      authLogger.warn('AuthStore', 'Cannot remove my property - no user logged in');
      return false;
    }
    
    authLogger.info('AuthStore', 'Removing property from myproperties', { propertyId, userId: user.id });
    
    try {
      const currentMyProperties = user.myproperties || [];
      const newMyProperties = currentMyProperties.filter(id => id !== propertyId);
      
      // Update database
      const { error } = await supabase
        .from('users')
        .update({ myproperties: newMyProperties })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      const oldState = get();
      const newUser = { ...user, myproperties: newMyProperties };
      authLogger.storeStateChange('removeMyProperty', oldState, { ...oldState, user: newUser });
      set({ user: newUser });
      
      authLogger.info('AuthStore', 'Property removed from myproperties successfully', { propertyId });
      return true;
    } catch (error) {
      authLogger.logError('AuthStore', error, { action: 'removeMyProperty', propertyId });
      return false;
    }
  },

  // Check if property is in myproperties
  isMyProperty: (propertyId) => {
    const user = get().user;
    const isMyProperty = user?.myproperties?.includes(propertyId) || false;
    authLogger.debug('AuthStore', 'Checking if property is in myproperties', { propertyId, isMyProperty });
    return isMyProperty;
  },

  // Get all my property IDs
  getMyPropertyIds: () => {
    const user = get().user;
    const myPropertyIds = user?.myproperties || [];
    authLogger.debug('AuthStore', 'Getting my property IDs', { count: myPropertyIds.length });
    return myPropertyIds;
  },
}));

// Listen to Supabase auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  authLogger.authStateChange(event, session);
  
  if (event === 'SIGNED_IN' && session?.user) {
    authLogger.info('AuthStore', 'User signed in, fetching user data', { userId: session.user.id });
    
    // Fetch complete user data including favorites and myproperties
    const userData = await useAuthStore.getState().fetchUserData(session.user.id);
    
    if (!userData) {
      authLogger.warn('AuthStore', 'Failed to fetch user data, using fallback', { userId: session.user.id });
      // Fallback to basic user data if fetch fails
      useAuthStore.getState().setUser({
        id: session.user.id,
        name: session.user.user_metadata?.name || '',
        nameBn: '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        preferredLanguage: 'en',
        favorites: [],
        myproperties: [],
      });
    }
    
    useAuthStore.getState().closeModal();
    // Only set guest mode to false if user actually signed in (not guest mode)
    useAuthStore.getState().setGuestMode(false);
  }
  
  if (event === 'SIGNED_OUT') {
    authLogger.info('AuthStore', 'User signed out');
    useAuthStore.getState().setUser(null);
    // Don't automatically set guest mode to false on sign out
  }
}); 