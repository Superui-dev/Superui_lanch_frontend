import axios from 'axios';
import { classifyError } from '../utils/errorClassifier';

// Connect to backend (Defaulting to localhost:5000 in development)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: `${API_BASE_URL}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

// Request Interceptor: Attach Supabase JWT to Authorization header
client.interceptors.request.use(
  async (config) => {
    try {
      const isAdminRequest = config.url?.includes('/api/admin') || (typeof window !== 'undefined' && window.location.pathname.startsWith('/india/admin'));
      const mfaToken = sessionStorage.getItem('admin_mfa_token') || localStorage.getItem('admin_mfa_token');

      const customerToken = localStorage.getItem('customer_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
      // Fetch supabase token from local storage or context if loaded
      const sessionStr = localStorage.getItem('supabase.auth.token') || 
                         localStorage.getItem('sb-token') || 
                         sessionStorage.getItem('sb-token');
      
      let token = customerToken || null;
      if (!token && sessionStr) {
        try {
          const parsed = JSON.parse(sessionStr);
          token = parsed?.currentSession?.access_token || parsed?.access_token || parsed;
        } catch {
          token = sessionStr;
        }
      }
      
      if (isAdminRequest && mfaToken) {
        config.headers.Authorization = `Bearer ${mfaToken}`;
        config.headers['x-mfa-token'] = mfaToken;
      } else {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (mfaToken) {
          config.headers['x-mfa-token'] = mfaToken;
          config.headers.Authorization = `Bearer ${mfaToken}`;
        }
      }
    } catch (err) {
      // Quietly fall back if token retrieval fails
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global error handlers & classification
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const diagnostic = classifyError(error);
    error.diagnostic = diagnostic;

    // Only clear the MFA token on 403 (token present but MFA verification failed/expired),
    // not on 401 (which may be transient or fixable on retry). Deleting on 401 created a
    // feedback loop that wiped valid sessions on every unauthenticated request.
    if (error.response?.status === 403 && window.location.pathname.startsWith('/india/admin')) {
      sessionStorage.removeItem('admin_mfa_token');
      localStorage.removeItem('admin_mfa_token');
      sessionStorage.removeItem('admin_mfa_verified');
    }

    return Promise.reject(error);
  }
);

export default client;
export { API_BASE_URL };

