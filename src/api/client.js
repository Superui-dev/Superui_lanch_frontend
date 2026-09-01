import axios from 'axios';
import { classifyError } from '../utils/errorClassifier';

// Connect to backend (Defaulting to localhost:5000 in development)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: `${API_BASE_URL}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Supabase JWT to Authorization header
client.interceptors.request.use(
  async (config) => {
    try {
      // Fetch supabase token from local storage or context if loaded
      const sessionStr = localStorage.getItem('supabase.auth.token') || 
                         localStorage.getItem('sb-token') || 
                         sessionStorage.getItem('sb-token');
      
      let token = null;
      if (sessionStr) {
        try {
          const parsed = JSON.parse(sessionStr);
          token = parsed?.currentSession?.access_token || parsed?.access_token || parsed;
        } catch {
          token = sessionStr;
        }
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // If MFA token is present (stored during admin authentication)
      const mfaToken = sessionStorage.getItem('admin_mfa_token') || localStorage.getItem('admin_mfa_token');
      if (mfaToken) {
        config.headers['x-mfa-token'] = mfaToken;
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${mfaToken}`;
        }
      }
    } catch (err) {
      console.error('Error attaching authentication token:', err);
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

    const isSilentCall = error.config?.silent || 
                         error.config?.url?.includes('inspect-alert') || 
                         error.config?.url?.includes('login-attempt') ||
                         error.config?.url?.includes('wishlist') ||
                         error.config?.url?.includes('settings') ||
                         error.config?.url?.includes('categories') ||
                         !error.response;

    if (!isSilentCall && error.response?.status !== 401) {
      console.warn(`[${diagnostic.layer} | ${diagnostic.category} | ${diagnostic.severity}] ${diagnostic.code}: ${diagnostic.userMessage}`, {
        endpoint: diagnostic.endpoint,
        suggestedFix: diagnostic.suggestedFix
      });
    }

    if (error.response?.status === 401 && window.location.pathname.startsWith('/india/admin')) {
      sessionStorage.removeItem('admin_mfa_token');
      localStorage.removeItem('admin_mfa_token');
    }

    return Promise.reject(error);
  }
);

export default client;
export { API_BASE_URL };

