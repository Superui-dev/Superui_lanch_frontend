import React, { createContext, useState, useContext, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext(null);

export const WatchlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const fetchWatchlist = async () => {
    if (!isAuthenticated && !user) {
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
    if (!isAuthenticated && !user) {
      setItems([]);
      setLoading(false);
      return;
    }
    fetchWatchlist();
  }, [isAuthenticated, user?._id || user?.id]);

  const addToWatchlist = async (productId) => {
    if (!isAuthenticated || !user) {
      openAuthModal('login');
      return;
    }
    // Optimistic UI update
    setItems(prev => prev.some(item => (item._id || item) === productId) ? prev : [...prev, productId]);
    try {
      const res = await client.post(`/api/wishlist/add/${productId}`);
      if (res.data?.success && res.data?.data) {
        setItems(res.data.data.productIds || []);
      }
    } catch (err) {
      // Revert if error
      fetchWatchlist();
    }
  };

  const removeFromWatchlist = async (productId) => {
    if (!isAuthenticated || !user) {
      openAuthModal('login');
      return;
    }
    // Optimistic UI update
    setItems(prev => prev.filter(item => (item._id || item) !== productId));
    try {
      const res = await client.delete(`/api/wishlist/remove/${productId}`);
      if (res.data?.success && res.data?.data) {
        setItems(res.data.data.productIds || []);
      }
    } catch (err) {
      // Revert if error
      fetchWatchlist();
    }
  };

  const isInWatchlist = (productId) => {
    if (!productId || !items) return false;
    return items.some(item => {
      const id = typeof item === 'object' && item !== null ? item._id : item;
      return String(id) === String(productId);
    });
  };

  const toggleWatchlist = async (productId) => {
    if (!isAuthenticated || !user) {
      openAuthModal('login');
      return;
    }
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
      // Failed to clear watchlist
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
