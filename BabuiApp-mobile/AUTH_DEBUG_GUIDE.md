# Authentication Debug Guide

## Overview
This guide helps you debug authentication issues in the BabuiApp mobile application using the comprehensive logging system that has been integrated.

## Logging System Components

### 1. Auth Logger (`utils/authLogger.js`)
- **Purpose**: Centralized logging for all authentication processes
- **Features**: 
  - Timestamped logs with component identification
  - Different log levels (INFO, WARN, ERROR, DEBUG)
  - Specific methods for auth events (sign in, sign up, guest mode)
  - State change tracking
  - Navigation attempt logging

### 2. Enhanced Components
- **SignInScreen**: Comprehensive logging for all user interactions
- **AuthStore**: State change tracking and error logging
- **MainStack**: Navigation state and auth flow logging

### 3. Test Utility (`utils/testAuthFlow.js`)
- **Purpose**: Automated testing of authentication scenarios
- **Features**: Guest mode testing, sign in/up testing, navigation testing

## How to Use the Logging System

### 1. Viewing Logs
All logs are output to the console with the prefix `[AUTH_LOG]`. You can view them in:
- **React Native Debugger**: Console tab
- **Expo CLI**: Terminal output
- **Chrome DevTools**: Console tab (if using web debugging)

### 2. Log Format
```
[AUTH_LOG] [timestamp] [LEVEL] [COMPONENT] message
[AUTH_LOG] [timestamp] [LEVEL] [COMPONENT] Data: {object}
```

### 3. Key Log Messages to Watch For

#### Sign In Process
```
[AUTH_LOG] [timestamp] [INFO] [SignIn] Sign in attempt for email: user@example.com
[AUTH_LOG] [timestamp] [INFO] [SignIn] Attempting Supabase sign in
[AUTH_LOG] [timestamp] [INFO] [SignIn] Sign in successful for email: user@example.com
[AUTH_LOG] [timestamp] [INFO] [AuthState] Auth state changed: SIGNED_IN
[AUTH_LOG] [timestamp] [INFO] [AuthStore] User signed in, fetching user data
```

#### Guest Mode Process
```
[AUTH_LOG] [timestamp] [INFO] [SignIn] Guest mode button pressed
[AUTH_LOG] [timestamp] [INFO] [GuestMode] Guest mode activated
[AUTH_LOG] [timestamp] [INFO] [SignIn] Guest mode set to true, attempting navigation
[AUTH_LOG] [timestamp] [INFO] [Navigation] Navigation attempt from SignIn to Home
[AUTH_LOG] [timestamp] [INFO] [SignIn] Navigation to Home completed
```

#### Navigation Issues
```
[AUTH_LOG] [timestamp] [INFO] [MainStack] Rendering navigator
[AUTH_LOG] [timestamp] [INFO] [MainStack] Navigation state changed
[AUTH_LOG] [timestamp] [INFO] [MainStack] Screen focused
```

## Common Issues and Debugging Steps

### Issue 1: "Continue as Guest" Button Not Working

**Symptoms:**
- Button press doesn't navigate to Home
- App stays on SignIn screen

**Debug Steps:**
1. Check logs for guest mode activation:
   ```
   [AUTH_LOG] [timestamp] [INFO] [SignIn] Guest mode button pressed
   [AUTH_LOG] [timestamp] [INFO] [GuestMode] Guest mode activated
   ```

2. Check for navigation attempts:
   ```
   [AUTH_LOG] [timestamp] [INFO] [Navigation] Navigation attempt from SignIn to Home
   ```

3. Check for errors:
   ```
   [AUTH_LOG] [timestamp] [ERROR] [SignIn] Error occurred: [error message]
   ```

**Common Solutions:**
- Ensure `setGuestMode(true)` is called
- Check if `navigation.replace('Home')` is executed
- Verify MainStack properly handles guest mode state

### Issue 2: Sign In Not Working

**Symptoms:**
- Sign in button doesn't respond
- User stays on SignIn screen after successful authentication

**Debug Steps:**
1. Check for sign in attempt logs:
   ```
   [AUTH_LOG] [timestamp] [INFO] [SignIn] Sign in attempt for email: [email]
   [AUTH_LOG] [timestamp] [INFO] [SignIn] Attempting Supabase sign in
   ```

2. Check for Supabase response:
   ```
   [AUTH_LOG] [timestamp] [INFO] [SignIn] Sign in successful for email: [email]
   [AUTH_LOG] [timestamp] [INFO] [AuthState] Auth state changed: SIGNED_IN
   ```

3. Check for user data fetching:
   ```
   [AUTH_LOG] [timestamp] [INFO] [AuthStore] User signed in, fetching user data
   [AUTH_LOG] [timestamp] [INFO] [UserData] User data fetched successfully for user: [userId]
   ```

**Common Solutions:**
- Verify Supabase credentials
- Check network connectivity
- Ensure auth state listener is working

### Issue 3: Navigation Bar Disappearing

**Symptoms:**
- Bottom navigation bar not visible
- Can't navigate between screens

**Debug Steps:**
1. Check MainStack rendering:
   ```
   [AUTH_LOG] [timestamp] [INFO] [MainStack] Rendering navigator
   [AUTH_LOG] [timestamp] [INFO] [MainStack] State updated
   ```

2. Check authentication state:
   ```
   [AUTH_LOG] [timestamp] [INFO] [MainStack] Rendering navigator
   hasSession: true/false, guestMode: true/false, isAuthenticated: true/false
   ```

3. Check screen focus events:
   ```
   [AUTH_LOG] [timestamp] [INFO] [MainStack] Screen focused
   ```

**Common Solutions:**
- Verify `isAuthenticated` calculation
- Check if all screens are included in navigator
- Ensure proper initial route

### Issue 4: Profile Screen Not Working in Guest Mode

**Symptoms:**
- Profile icon doesn't respond
- Profile screen shows error or blank

**Debug Steps:**
1. Check guest mode state:
   ```
   [AUTH_LOG] [timestamp] [INFO] [AuthStore] Store state changed: setGuestMode
   ```

2. Check navigation to Profile:
   ```
   [AUTH_LOG] [timestamp] [INFO] [Navigation] Navigation attempt from Home to Profile
   ```

3. Check ProfileScreen mounting:
   ```
   [AUTH_LOG] [timestamp] [DEBUG] [Component] ProfileScreen mounted
   ```

**Common Solutions:**
- Ensure ProfileScreen handles guest mode properly
- Check navigation permissions for guest users
- Verify guest mode UI components

## Using the Debug Button

### Development Mode Debug Button
In development mode, a red "DEBUG: Test Auth Flow" button appears on the SignIn screen.

**What it does:**
1. Logs current authentication state
2. Tests guest mode activation
3. Attempts navigation to Home
4. Provides detailed feedback in console

**How to use:**
1. Open the app in development mode
2. Go to SignIn screen
3. Press the red debug button
4. Check console for detailed logs

## Manual Testing Steps

### Test 1: Guest Mode Flow
1. Open app → SignIn screen
2. Press "Continue as Guest"
3. Check logs for:
   - Guest mode activation
   - Navigation to Home
   - Screen focus events

### Test 2: Sign In Flow
1. Enter valid credentials
2. Press "Sign In"
3. Check logs for:
   - Sign in attempt
   - Supabase response
   - Auth state change
   - User data fetching

### Test 3: Navigation Flow
1. Navigate between screens
2. Check logs for:
   - Navigation attempts
   - Screen focus/blur events
   - State updates

## Log Analysis Tips

### 1. Timeline Analysis
- Look for the sequence of events
- Identify where the flow breaks
- Check timing between events

### 2. State Tracking
- Monitor auth state changes
- Check guest mode transitions
- Verify user data updates

### 3. Error Identification
- Look for ERROR level logs
- Check for failed API calls
- Identify navigation failures

### 4. Performance Issues
- Check for slow operations
- Monitor data fetching times
- Look for blocking operations

## Common Error Messages and Solutions

### "Cannot add favorite - no user logged in"
**Cause**: User not authenticated
**Solution**: Check auth state, ensure user is signed in

### "Navigation attempt failed"
**Cause**: Screen not found or navigation error
**Solution**: Verify screen exists in navigator, check navigation state

### "Failed to fetch user data"
**Cause**: Database connection or query error
**Solution**: Check Supabase connection, verify user exists in database

### "Auth state change not detected"
**Cause**: Auth listener not working
**Solution**: Check Supabase auth listener setup

## Advanced Debugging

### 1. Enable Debug Logs
To see more detailed logs, modify `authLogger.js`:
```javascript
// Change log level to DEBUG
authLogger.debug('Component', 'Detailed debug info');
```

### 2. Custom Logging
Add custom logs in your components:
```javascript
import authLogger from '../utils/authLogger';

// Log specific events
authLogger.info('MyComponent', 'Custom event occurred', { data: 'value' });
```

### 3. State Inspection
Use the test utility to inspect current state:
```javascript
import testAuthFlow from '../utils/testAuthFlow';

// Log current app state
testAuthFlow.logAppState(authStore, navigation);
```

## Getting Help

If you're still experiencing issues after following this guide:

1. **Collect Logs**: Copy all `[AUTH_LOG]` entries from console
2. **Identify Pattern**: Look for repeated errors or missing events
3. **Check State**: Verify current auth and navigation state
4. **Test Scenarios**: Use the debug button and manual tests
5. **Document**: Note the exact steps that reproduce the issue

The comprehensive logging system will help identify exactly where the authentication flow is breaking and provide clear guidance for fixing the issues. 