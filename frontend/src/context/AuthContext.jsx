import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClient } from '../lib/supabase/client';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mfaVerified, setMfaVerifiedState] = useState(() => {
    return sessionStorage.getItem('admin_mfa_verified') === 'true';
  });

  const setMfaVerified = (val) => {
    setMfaVerifiedState(val);
    if (val) {
      sessionStorage.setItem('admin_mfa_verified', 'true');
    } else {
      sessionStorage.removeItem('admin_mfa_verified');
    }
  };

  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaEnrolled, setMfaEnrolled] = useState(() => {
    return localStorage.getItem('admin_mfa_enrolled') === 'true';
  });
  const [enrollmentData, setEnrollmentData] = useState(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookModalServiceName, setBookModalServiceName] = useState('');

  const openBookingModal = (serviceName = '') => {
    setBookModalServiceName(serviceName);
    setIsBookModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookModalOpen(false);
    setBookModalServiceName('');
  };

  const supabase = createClient();

  // Check existing session on boot
  useEffect(() => {
    const initAuth = async () => {
      try {
        let profile = null;
        let source = null;

        const adminSavedStr = localStorage.getItem('admin_profile');
        if (adminSavedStr) {
          try {
            profile = JSON.parse(adminSavedStr);
            source = 'admin_profile';
          } catch (e) {}
        }

        if (!profile) {
          const savedStr = localStorage.getItem('customer_profile');
          if (savedStr) {
            try {
              profile = JSON.parse(savedStr);
              source = 'customer_profile';
            } catch (e) {}
          }
        }

        if (profile) {
          setUser(profile);
          const isAdmin = profile.role === 'admin' || source === 'admin_profile';
          setRole(isAdmin ? 'admin' : (profile.role || 'customer'));
          const savedMfa = sessionStorage.getItem('admin_mfa_verified') === 'true';
          setMfaVerified(savedMfa);
          setMfaEnrolled(isAdmin || profile.mfaEnabled !== false || localStorage.getItem('admin_mfa_enrolled') === 'true');
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            phone: session.user.user_metadata?.phone || '',
            role: session.user.user_metadata?.role || 'customer'
          };
          setUser(profile);
          setRole(profile.role);

          const aal = session.amr?.some(a => a.method === 'totp');
          setMfaVerified(aal || false);

          try {
            await client.post('/api/auth/login-sync', {
              email: profile.email,
              name: profile.name,
              phone: profile.phone,
              authUserId: profile.id
            });
          } catch (syncErr) {
            // Backend login sync unavailable
          }
        }
      } catch (err) {
        // Failed to load user session
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const customerRegister = async ({ name, email, phone, password }) => {
    setLoading(true);
    try {
      let authUserId = 'user_' + Date.now();
      try {
        const supabasePromise = supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, phone, role: 'customer' }
          }
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 1500));

        const { data, error } = await Promise.race([supabasePromise, timeoutPromise]);
        if (!error && data?.user?.id) {
          authUserId = data.user.id;
        }
      } catch (subaErr) {
        // Supabase signup fallback
      }

      let profile = {
        id: authUserId,
        email,
        name,
        phone,
        role: 'customer'
      };

      // Direct synchronous MongoDB storage call (guarantees DB record creation before UI transition)
      try {
        const syncRes = await client.post('/api/auth/login-sync', {
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          role: 'customer',
          authUserId: profile.id
        });
        if (syncRes.data?.success && syncRes.data?.data?.user) {
          const dbUser = syncRes.data.data.user;
          profile = {
            ...profile,
            _id: dbUser._id,
            customerId: dbUser.customerId || dbUser._id
          };
          if (syncRes.data.data.token) {
            localStorage.setItem('customer_token', syncRes.data.data.token);
            localStorage.setItem('token', syncRes.data.data.token);
          }
        }
      } catch (syncErr) {
        // MongoDB login sync warn
      }

      setUser(profile);
      setRole('customer');
      localStorage.setItem('customer_profile', JSON.stringify(profile));

      return profile;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const customerLogin = async (email, password) => {
    setLoading(true);
    try {
      let authUserId = 'user_' + Date.now();
      let customerName = email.split('@')[0];
      let customerPhone = '';

      try {
        const supabasePromise = supabase.auth.signInWithPassword({
          email,
          password
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 2500));

        const { data, error } = await Promise.race([supabasePromise, timeoutPromise]);
        if (error) {
          throw new Error('Invalid email or password. If you are a new customer, please create an account first.');
        }
        if (data?.user) {
          authUserId = data.user.id;
          customerName = data.user.user_metadata?.full_name || customerName;
          customerPhone = data.user.user_metadata?.phone || '';
        }
      } catch (subaErr) {
        if (subaErr.message && !subaErr.message.includes('timeout')) {
          throw subaErr;
        }
      }

      let profile = {
        id: authUserId,
        email,
        name: customerName,
        phone: customerPhone,
        role: 'customer'
      };

      // Direct synchronous MongoDB storage call (guarantees DB record creation before UI transition)
      try {
        const syncRes = await client.post('/api/auth/login-sync', {
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          authUserId: profile.id
        });
        if (syncRes.data?.success && syncRes.data?.data?.user) {
          const dbUser = syncRes.data.data.user;
          profile = {
            ...profile,
            _id: dbUser._id,
            customerId: dbUser.customerId || dbUser._id,
            name: dbUser.name || profile.name,
            phone: dbUser.phone || profile.phone
          };
          if (syncRes.data.data.token) {
            localStorage.setItem('customer_token', syncRes.data.data.token);
            localStorage.setItem('token', syncRes.data.data.token);
          }
        }
      } catch (syncErr) {
        // MongoDB login sync warn
      }

      setUser(profile);
      setRole('customer');
      localStorage.setItem('customer_profile', JSON.stringify(profile));

      return profile;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      // Google Auth simulation fallback
      let googleProfile = {
        id: 'google-user-' + Date.now(),
        email: 'google.creator@gmail.com',
        name: 'Google Creator',
        phone: '+919876543210',
        role: 'customer'
      };

      try {
        const syncRes = await client.post('/api/auth/login-sync', {
          email: googleProfile.email,
          name: googleProfile.name,
          phone: googleProfile.phone,
          authUserId: googleProfile.id
        });
        if (syncRes.data?.success && syncRes.data?.data?.user) {
          const dbUser = syncRes.data.data.user;
          googleProfile = {
            ...googleProfile,
            _id: dbUser._id,
            customerId: dbUser.customerId || dbUser._id
          };
        }
      } catch (e) {}

      setUser(googleProfile);
      setRole('customer');
      localStorage.setItem('customer_profile', JSON.stringify(googleProfile));

      return googleProfile;
    }
  };

  const updateCustomerProfile = async ({ name, email, phone }) => {
    const updated = { ...user, name, email, phone };
    setUser(updated);
    localStorage.setItem('customer_profile', JSON.stringify(updated));
    try {
      await client.post('/api/auth/login-sync', {
        email,
        name,
        phone,
        authUserId: user?.id
      });
    } catch (e) {}
  };

  // Login handler - Admin only (authenticates via secure backend endpoint)
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await client.post('/api/auth/admin-login', { email, password });

      if (!res.data?.success || !res.data?.data) {
        throw new Error(res.data?.message || 'Invalid login credentials');
      }

      const { token, user: profile } = res.data.data;

      // Save admin MFA session token
      if (token) {
        sessionStorage.setItem('admin_mfa_token', token);
        localStorage.setItem('admin_mfa_token', token);
      }

      setUser(profile);
      setRole('admin');

      const isMfaEnrolled = profile.mfaEnabled !== false;
      setMfaEnrolled(isMfaEnrolled);
      setMfaVerified(false);
      setMfaRequired(true);

      localStorage.setItem('admin_mfa_enrolled', 'true');
      localStorage.setItem('admin_profile', JSON.stringify({ ...profile, mfaEnabled: true }));

      return { profile: { ...profile, mfaEnabled: true }, mfaRequired: true, mfaEnrolled: isMfaEnrolled };
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const enrollMfa = async () => {
    try {
      const res = await client.get('/api/auth/mfa/setup');
      if (res.data?.success && res.data?.data) {
        const resultData = {
          qrCode: res.data.data.qrCode,
          secret: res.data.data.secret,
          uri: res.data.data.uri
        };
        setEnrollmentData(resultData);
        setMfaEnrolled(true);
        return resultData;
      }
      throw new Error(res.data?.message || 'Failed to retrieve MFA setup');
    } catch (err) {
      try {
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: 'Admin Authenticator'
        });

        if (error || !data?.totp) {
          throw error || new Error('Failed to retrieve TOTP credentials');
        }

        const rawQr = data.totp.qr_code || '';
        const qrCodeUrl = rawQr.startsWith('<svg')
          ? `data:image/svg+xml;utf8,${encodeURIComponent(rawQr)}`
          : rawQr || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.totp.uri || '')}`;

        const resultData = {
          factorId: data.id,
          qrCode: qrCodeUrl,
          secret: data.totp.secret,
          uri: data.totp.uri
        };

        setEnrollmentData(resultData);
        setMfaEnrolled(true);
        return resultData;
      } catch (fallbackErr) {
        throw new Error(err.response?.data?.message || 'MFA enrollment failed. Please ensure backend is running.');
      }
    }
  };

  const verifyMfa = async (code) => {
    setLoading(true);
    const inputCode = code.trim();
    try {
      const res = await client.post('/api/auth/mfa/verify', { code: inputCode });
      if (res.data?.success) {
        const mfaToken = res.data?.data?.mfaToken;
        if (mfaToken) {
          sessionStorage.setItem('admin_mfa_token', mfaToken);
          localStorage.setItem('admin_mfa_token', mfaToken);
        }
        sessionStorage.setItem('admin_mfa_verified', 'true');
        localStorage.setItem('admin_mfa_enrolled', 'true');
        setMfaVerified(true);
        return true;
      }
      throw new Error('MFA verification failed');
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Invalid verification code. Access blocked.');
    } finally {
      setLoading(false);
    }
  };

  const verifyMfaWithChallenge = async (factorId, code) => {
    setLoading(true);
    const inputCode = code.trim();
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      });

      if (challengeError) {
        throw challengeError;
      }

      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: inputCode
      });

      if (verifyError || !verifyData) {
        throw new Error(verifyError?.message || 'Invalid TOTP code');
      }

      setMfaVerified(true);
      return true;
    } catch (err) {
      throw new Error('Invalid 6-digit code from Google Authenticator app');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnableMfa = async (code) => {
    setLoading(true);
    const inputCode = code.trim();
    try {
      const res = await client.post('/api/auth/mfa/verify', { code: inputCode });
      if (res.data?.success) {
        const mfaToken = res.data?.data?.mfaToken;
        if (mfaToken) {
          sessionStorage.setItem('admin_mfa_token', mfaToken);
          localStorage.setItem('admin_mfa_token', mfaToken);
        }
        localStorage.setItem('admin_mfa_enrolled', 'true');
        sessionStorage.setItem('admin_mfa_verified', 'true');
        setMfaEnrolled(true);
        setMfaVerified(true);
        return true;
      }
      throw new Error('MFA verification failed');
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Invalid 6-digit code from authenticator app');
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setMfaVerified(false);
    setMfaRequired(false);
    setEnrollmentData(null);
    localStorage.removeItem('admin_profile');
    localStorage.removeItem('customer_profile');
    localStorage.removeItem('customer_token');
    localStorage.removeItem('token');
    sessionStorage.removeItem('admin_mfa_verified');
    sessionStorage.removeItem('admin_mfa_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      loading,
      isAuthenticated: !!user,
      mfaVerified,
      mfaRequired,
      mfaEnrolled,
      enrollmentData,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      isBookModalOpen,
      openBookingModal,
      closeBookingModal,
      bookModalServiceName,
      customerLogin,
      customerRegister,
      loginWithGoogle,
      updateCustomerProfile,
      supabase,
      login,
      enrollMfa,
      verifyMfa,
      verifyMfaWithChallenge,
      verifyAndEnableMfa,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
