// Authentication Flow Test Utility
// This utility helps test and debug authentication scenarios

import authLogger from './authLogger';

export const testAuthFlow = {
  // Test guest mode activation
  testGuestMode: async (navigation, authStore) => {
    authLogger.info('TestAuthFlow', 'Starting guest mode test');
    
    try {
      // Log current state first
      const currentState = authStore.getState();
      authLogger.info('TestAuthFlow', 'Current auth state before guest mode', {
        hasUser: !!currentState.user,
        guestMode: currentState.guestMode,
        userId: currentState.user?.id
      });
      
      // Test guest mode activation - try to access setGuestMode
      try {
        // Try to call setGuestMode directly on the store
        authStore.getState().setGuestMode(true);
        authLogger.info('TestAuthFlow', 'Guest mode set to true successfully');
      } catch (setGuestModeError) {
        authLogger.error('TestAuthFlow', 'Failed to set guest mode', { error: setGuestModeError.message });
        return false;
      }
      
      // Test navigation
      setTimeout(() => {
        authLogger.info('TestAuthFlow', 'Attempting navigation to Home');
        try {
          navigation.replace('Home');
          authLogger.info('TestAuthFlow', 'Navigation to Home successful');
        } catch (navError) {
          authLogger.error('TestAuthFlow', 'Navigation failed', { error: navError.message });
        }
      }, 100);
      
      return true;
    } catch (error) {
      authLogger.logError('TestAuthFlow', error, { action: 'testGuestMode' });
      return false;
    }
  },

  // Test sign in flow
  testSignIn: async (email, password, supabase) => {
    authLogger.info('TestAuthFlow', 'Starting sign in test', { email });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        authLogger.error('TestAuthFlow', 'Sign in test failed', { error: error.message });
        return { success: false, error };
      }
      
      authLogger.info('TestAuthFlow', 'Sign in test successful', { userId: data.user?.id });
      return { success: true, data };
    } catch (error) {
      authLogger.logError('TestAuthFlow', error, { action: 'testSignIn' });
      return { success: false, error };
    }
  },

  // Test sign in with navigation
  testSignInWithNavigation: async (email, password, supabase, navigation) => {
    authLogger.info('TestAuthFlow', 'Starting sign in with navigation test', { email });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        authLogger.error('TestAuthFlow', 'Sign in with navigation test failed', { error: error.message });
        return { success: false, error };
      }
      
      authLogger.info('TestAuthFlow', 'Sign in successful, waiting for navigation', { userId: data.user?.id });
      
      // Wait for navigation to happen
      setTimeout(() => {
        authLogger.info('TestAuthFlow', 'Checking if navigation occurred');
        // This will be logged when navigation happens
      }, 3000);
      
      return { success: true, data };
    } catch (error) {
      authLogger.logError('TestAuthFlow', error, { action: 'testSignInWithNavigation' });
      return { success: false, error };
    }
  },

  // Test sign up flow
  testSignUp: async (email, password, supabase) => {
    authLogger.info('TestAuthFlow', 'Starting sign up test', { email });
    
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        authLogger.error('TestAuthFlow', 'Sign up test failed', { error: error.message });
        return { success: false, error };
      }
      
      authLogger.info('TestAuthFlow', 'Sign up test successful', { userId: data.user?.id });
      return { success: true, data };
    } catch (error) {
      authLogger.logError('TestAuthFlow', error, { action: 'testSignUp' });
      return { success: false, error };
    }
  },

  // Test auth state changes
  testAuthStateChange: (authStore) => {
    authLogger.info('TestAuthFlow', 'Testing auth state change');
    
    const currentState = authStore.getState();
    authLogger.info('TestAuthFlow', 'Current auth state', {
      hasUser: !!currentState.user,
      guestMode: currentState.guestMode,
      userId: currentState.user?.id
    });
    
    return currentState;
  },

  // Test navigation flow
  testNavigation: (navigation, from, to) => {
    authLogger.info('TestAuthFlow', 'Testing navigation', { from, to });
    
    try {
      navigation.navigate(to);
      authLogger.info('TestAuthFlow', 'Navigation successful', { from, to });
      return true;
    } catch (error) {
      authLogger.logError('TestAuthFlow', error, { action: 'testNavigation', from, to });
      return false;
    }
  },

  // Comprehensive test suite
  runFullTest: async (navigation, authStore, supabase) => {
    authLogger.info('TestAuthFlow', 'Starting comprehensive auth flow test');
    
    const results = {
      guestMode: false,
      signIn: false,
      signUp: false,
      navigation: false,
      authState: false
    };
    
    try {
      // Test 1: Guest Mode
      authLogger.info('TestAuthFlow', 'Test 1: Guest Mode');
      results.guestMode = await testAuthFlow.testGuestMode(navigation, authStore);
      
      // Test 2: Auth State
      authLogger.info('TestAuthFlow', 'Test 2: Auth State');
      const authState = testAuthFlow.testAuthStateChange(authStore);
      results.authState = !!authState;
      
      // Test 3: Navigation
      authLogger.info('TestAuthFlow', 'Test 3: Navigation');
      results.navigation = testAuthFlow.testNavigation(navigation, 'Home', 'Profile');
      
      authLogger.info('TestAuthFlow', 'Comprehensive test completed', results);
      return results;
      
    } catch (error) {
      authLogger.logError('TestAuthFlow', error, { action: 'runFullTest' });
      return results;
    }
  },

  // Log current app state
  logAppState: (authStore, navigation) => {
    const state = authStore.getState();
    const navState = navigation?.getState();
    
    authLogger.info('TestAuthFlow', 'Current app state', {
      auth: {
        hasUser: !!state.user,
        guestMode: state.guestMode,
        userId: state.user?.id,
        userEmail: state.user?.email
      },
      navigation: {
        currentRoute: navState?.routes?.[navState.index]?.name,
        routeStack: navState?.routes?.map(r => r.name)
      }
    });
  }
};

export default testAuthFlow; 