import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { validateEmail } from '../lib/security';
import { logToGoogleSheet } from '../lib/sheetsLogger';

const AuthContext = createContext();

const isAdminEmail = (email) => {
  return String(email || '').trim().toLowerCase() === 'rithishmdu77@gmail.com';
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Helper: Fetch verified user profile from Supabase database
   */
  const fetchUserProfile = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, is_banned')
        .eq('id', userId)
        .maybeSingle();

      if (error || !profile) {
        return null;
      }
      return profile;
    } catch (err) {
      return null;
    }
  };

  /**
   * Listen to Supabase Auth state changes and initial session check
   * Protects state: if getSession() has no session, user is logged out
   */
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured()) {
      setSession(null);
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    // 1. Initial Session Check
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error || !currentSession?.user) {
          if (isMounted) {
            setSession(null);
            setCurrentUser(null);
            setLoading(false);
          }
          return;
        }

        const profile = await fetchUserProfile(currentSession.user.id);
        const isSystemAdmin = isAdminEmail(currentSession.user.email);

        if (isMounted) {
          setSession(currentSession);
          if (profile) {
            if (profile.is_banned) {
              await supabase.auth.signOut();
              setSession(null);
              setCurrentUser(null);
            } else {
              const userRole = isSystemAdmin ? 'admin' : (profile.role || 'player');
              setCurrentUser({ ...profile, role: userRole });
            }
          } else {
            setCurrentUser({
              id: currentSession.user.id,
              email: currentSession.user.email,
              name: currentSession.user.user_metadata?.name || currentSession.user.email?.split('@')[0],
              role: isSystemAdmin ? 'admin' : 'player',
              is_banned: false
            });
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setSession(null);
          setCurrentUser(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // 2. Real-time Auth State Listener (handles sign in, sign out, token expiry)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession?.user) {
        setSession(newSession);
        const profile = await fetchUserProfile(newSession.user.id);
        const isSystemAdmin = isAdminEmail(newSession.user.email);

        if (profile?.is_banned) {
          await supabase.auth.signOut();
          setSession(null);
          setCurrentUser(null);
        } else {
          const userRole = isSystemAdmin ? 'admin' : (profile?.role || 'player');
          setCurrentUser(
            profile
              ? { ...profile, role: userRole }
              : {
                  id: newSession.user.id,
                  email: newSession.user.email,
                  name: newSession.user.user_metadata?.name || newSession.user.email?.split('@')[0],
                  role: userRole,
                  is_banned: false
                }
          );
        }
      } else {
        setSession(null);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * REQUIREMENT 2: Login using ONLY supabase.auth.signInWithPassword({ email, password })
   * If error: Show "Invalid email or password" and do NOT enter dashboard.
   * REQUIREMENT 4: If user chose "Admin" but role in database is not admin, sign out and show "You are not an admin."
   */
  const login = async (rawEmail, rawPassword, expectedRole) => {
    setLoading(true);
    setAuthError(null);

    const email = String(rawEmail || '').trim().toLowerCase();
    const password = String(rawPassword || '').trim();
    const isSystemAdmin = isAdminEmail(email);

    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not connected yet. Please add your Supabase Project URL and Anon Key into the .env file.');
      }

      if (!validateEmail(email)) {
        throw new Error('Invalid email or password');
      }

      // ONLY use Supabase Auth for credential verification
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // If login failed, but this is the primary Admin email attempting admin login,
      // auto-attempt registration in Supabase Auth if account doesn't exist yet!
      if ((error || !data?.user) && isSystemAdmin) {
        const signUpRes = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: 'Rithish (Admin)' }
          }
        });

        if (signUpRes.data?.session && signUpRes.data?.user) {
          data = signUpRes.data;
          error = null;
        } else if (signUpRes.data?.user && !signUpRes.data?.session) {
          throw new Error('Admin account registered in Supabase! Please check your email to confirm registration (or disable "Confirm email" in Supabase Auth settings), then log in.');
        }
      }

      if (error || !data?.user || !data?.session) {
        if (error?.message?.toLowerCase().includes('email not confirmed') || error?.code === 'email_not_confirmed') {
          throw new Error('Email not confirmed in Supabase! Please turn OFF "Confirm email" in Supabase (Authentication -> Providers -> Email) or run the SQL query to confirm it.');
        }
        throw new Error(error?.message || 'Invalid email or password');
      }

      // Read role directly from profiles table using the logged-in user's id
      let profile = await fetchUserProfile(data.user.id);

      // Auto-upsert profile record in Supabase database
      if (!profile) {
        try {
          const { data: created } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              name: data.user.user_metadata?.name || 'Rithish (Admin)',
              email: data.user.email,
              role: isSystemAdmin ? 'admin' : 'player',
              is_banned: false
            })
            .select()
            .maybeSingle();
          if (created) profile = created;
        } catch (e) {
          console.warn('Profile upsert fallback:', e);
        }
      } else if (isSystemAdmin && profile.role !== 'admin') {
        try {
          await supabase.from('profiles').update({ role: 'admin' }).eq('id', data.user.id);
          profile.role = 'admin';
        } catch (e) {
          console.warn('Profile role upgrade fallback:', e);
        }
      }

      const userRole = isSystemAdmin ? 'admin' : (profile?.role || 'player');

      // Check account ban status
      if (profile?.is_banned) {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setSession(null);
        throw new Error('Your account has been suspended by administration.');
      }

      // SECURITY RULE: If user selected "Admin" gate but role is not admin, deny and sign out
      if (expectedRole === 'admin' && userRole !== 'admin') {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setSession(null);
        throw new Error('You are not an admin.');
      }

      const activeUser = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata?.name || data.user.email?.split('@')[0],
        role: userRole,
        is_banned: false
      };

      setSession(data.session);
      setCurrentUser(activeUser);

      // 📊 Log successful login to Google Sheet
      logToGoogleSheet({
        email: activeUser.email,
        name: activeUser.name,
        role: activeUser.role,
        event: 'LOGIN',
        status: 'SUCCESS'
      });

      return { success: true, profile: activeUser };
    } catch (err) {
      try {
        await supabase.auth.signOut();
      } catch (e) { /* ignore */ }
      setCurrentUser(null);
      setSession(null);

      const errorMessage =
        err.message === 'You are not an admin.'
          ? 'You are not an admin.'
          : err.message === 'Your account has been suspended by administration.'
            ? err.message
            : err.message.includes('Admin account registered')
              ? err.message
              : err.message.includes('Email not confirmed')
                ? err.message
                : err.message.includes('Supabase is not connected')
                  ? err.message
                  : err.message.includes('Failed to fetch') || err.message.includes('network')
                    ? 'Unable to connect to Supabase. Check your internet connection and .env URL.'
                    : (err.message || 'Invalid email or password');

      setAuthError(errorMessage);

      // 📊 Log failed login attempt to Google Sheet
      logToGoogleSheet({
        email,
        role: expectedRole || 'player',
        event: 'LOGIN_ATTEMPT',
        status: 'FAILED',
        details: errorMessage
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * REQUIREMENT 3: Sign up using ONLY supabase.auth.signUp
   * Never store or compare passwords in own tables.
   */
  const signUp = async (name, rawEmail, rawPassword) => {
    setLoading(true);
    setAuthError(null);

    const email = String(rawEmail || '').trim().toLowerCase();
    const password = String(rawPassword || '').trim();
    const isSystemAdmin = isAdminEmail(email);

    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not connected yet. Please add your Supabase Project URL and Anon Key into the .env file.');
      }

      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: String(name).trim(),
            coins: 200
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: String(name).trim(),
            email: email,
            role: isSystemAdmin ? 'admin' : 'player',
            is_banned: false
          });
        } catch (e) {
          /* ignore */
        }
      }

      // 📊 Log registration event to Google Sheet
      logToGoogleSheet({
        email,
        name: String(name).trim(),
        role: isSystemAdmin ? 'admin' : 'player',
        event: 'SIGNUP',
        status: 'SUCCESS'
      });

      if (data?.user && !data.session) {
        return {
          success: true,
          message: 'Account created! Please check your email to verify your registration before logging in.'
        };
      }

      return { success: true };
    } catch (err) {
      const msg = err.message || 'Registration failed';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * REQUIREMENT 7: Logout button calling supabase.auth.signOut()
   */
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setSession(null);
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        session,
        isAdmin: currentUser?.role === 'admin',
        isConfigured: isSupabaseConfigured(),
        loading,
        authError,
        login,
        signUp,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
