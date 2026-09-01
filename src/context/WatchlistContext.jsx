import React, { createContext, useState, useContext, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext(null);

export const WatchlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const fetchWatchlist = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || !isAuthenticated) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await client.get('/api/wishlist', { silent: true });
      if (res.data?.success && res.data?.data) {
        setItems(res.data.data.productIds || []);
      } else {
        setItems([]);
      }
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const mfaToken = sessionStorage.getItem('admin_mfa_token') || localStorage.getItem('admin_mfa_token');
    const authSession = localStorage.getItem('supabase.auth.token') || localStorage.getItem('customer_profile');
    if (!isAuthenticated && !mfaToken && !authSession) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    client.get('/api/wishlist', { silent: true })
      .then(res => {
        if (res.data?.success && res.data?.data) {
          setItems(res.data.data.productIds || []);
        } else {
          setItems([]);
        }
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated, user?._id]);

  const addToWatchlist = async (productId) => {
    try {
      const res = await client.post(`/api/wishlist/add/${productId}`);
      if (res.data?.success && res.data?.data) {
        setItems(res.data.data.productIds || []);
      }
    } catch (err) {
      console.error('Failed to add to watchlist', err);
    }
  };

  const removeFromWatchlist = async (productId) => {
    try {
      const res = await client.delete(`/api/wishlist/remove/${productId}`);
      if (res.data?.success && res.data?.data) {
        setItems(res.data.data.productIds || []);
      }
    } catch (err) {
      console.error('Failed to remove from watchlist', err);
    }
  };

  const isInWatchlist = (productId) => {
    return items.some(item => item._id === productId || item === productId);
  };

  const toggleWatchlist = async (productId) => {
    if (isInWatchlist(productId)) {
      await removeFromWatchlist(productId);
    } else {
      await addToWatchlist(productId);
    }
  };

  const clearWatchlist = async () => {
    try {
      await client.delete('/api/wishlist/clear');
      setItems([]);
    } catch (err) {
      console.error('Failed to clear watchlist', err);
    }
  };

  return (
    <WatchlistContext.Provider value={{
      items,
      loading,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      clearWatchlist,
      isInWatchlist,
      refetch: fetchWatchlist
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => useContext(WatchlistContext);
