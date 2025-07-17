// Authentication Logger Utility
// This utility provides comprehensive logging for authentication processes

const LOG_PREFIX = '[AUTH_LOG]';

export const authLogger = {
  // Log levels
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',

  // Log function with timestamp and level
  log: (level, component, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${LOG_PREFIX} [${timestamp}] [${level}] [${component}] ${message}`;
    
    console.log(logMessage);
    if (data) {
      console.log(`${LOG_PREFIX} [${timestamp}] [${level}] [${component}] Data:`, data);
    }
  },

  // Convenience methods
  info: (component, message, data) => authLogger.log(authLogger.INFO, component, message, data),
  warn: (component, message, data) => authLogger.log(authLogger.WARN, component, message, data),
  error: (component, message, data) => authLogger.log(authLogger.ERROR, component, message, data),
  debug: (component, message, data) => authLogger.log(authLogger.DEBUG, component, message, data),

  // Specific authentication logging methods
  signInAttempt: (email) => {
    authLogger.info('SignIn', `Sign in attempt for email: ${email}`);
  },

  signInSuccess: (email) => {
    authLogger.info('SignIn', `Sign in successful for email: ${email}`);
  },

  signInError: (email, error) => {
    authLogger.error('SignIn', `Sign in failed for email: ${email}`, { error: error.message });
  },

  signUpAttempt: (email) => {
    authLogger.info('SignUp', `Sign up attempt for email: ${email}`);
  },

  signUpSuccess: (email) => {
    authLogger.info('SignUp', `Sign up successful for email: ${email}`);
  },

  signUpError: (email, error) => {
    authLogger.error('SignUp', `Sign up failed for email: ${email}`, { error: error.message });
  },

  guestModeActivated: () => {
    authLogger.info('GuestMode', 'Guest mode activated');
  },

  guestModeDeactivated: () => {
    authLogger.info('GuestMode', 'Guest mode deactivated');
  },

  authStateChange: (event, session) => {
    authLogger.info('AuthState', `Auth state changed: ${event}`, {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email
    });
  },

  navigationAttempt: (from, to, authState) => {
    authLogger.info('Navigation', `Navigation attempt from ${from} to ${to}`, {
      hasUser: !!authState.user,
      guestMode: authState.guestMode,
      isAuthenticated: !!authState.user || authState.guestMode
    });
  },

  userDataFetch: (userId, success, data = null) => {
    if (success) {
      authLogger.info('UserData', `User data fetched successfully for user: ${userId}`, data);
    } else {
      authLogger.error('UserData', `Failed to fetch user data for user: ${userId}`);
    }
  },

  // Store state logging
  storeStateChange: (action, oldState, newState) => {
    authLogger.debug('AuthStore', `Store state changed: ${action}`, {
      oldState: {
        hasUser: !!oldState.user,
        guestMode: oldState.guestMode,
        userId: oldState.user?.id
      },
      newState: {
        hasUser: !!newState.user,
        guestMode: newState.guestMode,
        userId: newState.user?.id
      }
    });
  },

  // Component lifecycle logging
  componentMount: (componentName, props = {}) => {
    authLogger.debug('Component', `${componentName} mounted`, props);
  },

  componentUnmount: (componentName) => {
    authLogger.debug('Component', `${componentName} unmounted`);
  },

  // Error logging with stack trace
  logError: (component, error, context = {}) => {
    authLogger.error(component, `Error occurred: ${error.message}`, {
      stack: error.stack,
      context
    });
  }
};

// Export a simple function for quick logging
export const logAuth = (component, message, data) => {
  authLogger.info(component, message, data);
};

export default authLogger; 