import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useAuth } from './AuthContext';
import client from '../api/client';

const CartContext = createContext(null);

const GUEST_CART_KEY = 'superui_cart_guest';

const getStableUserKey = (user) => {
  if (!user) return GUEST_CART_KEY;
  return `superui_cart_${user.email || user._id || user.id}`;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const storageKey = getStableUserKey(user);

  // Lazy initial state so cart items load synchronously from localStorage on page refresh/mount
  const [cartItems, setCartItems] = useState(() => {
    try {
      const currentProfile = localStorage.getItem('customer_profile');
      let profile = null;
      if (currentProfile) {
        profile = JSON.parse(currentProfile);
      }
      const key = getStableUserKey(profile);
      const saved = localStorage.getItem(key) || localStorage.getItem(GUEST_CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return [];
  });

  const [syncing, setSyncing] = useState(false);

  const saveCart = useCallback((items) => {
    setCartItems(items);
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (e) {}
  }, [storageKey]);

  const loadCartFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey) || localStorage.getItem(GUEST_CART_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed);
          return;
        }
      }
    } catch (e) {
      // Storage read fallback
    }
  }, [storageKey]);

  const mergeGuestCartIntoUser = useCallback(async (userEmail) => {
    try {
      const guestCart = localStorage.getItem(GUEST_CART_KEY);
      
      if (guestCart) {
        const guestItems = JSON.parse(guestCart);
        if (Array.isArray(guestItems) && guestItems.length > 0) {
          for (const item of guestItems) {
            try {
              await client.post('/api/cart', {
                productId: item._id || item.productId,
                quantity: item.quantity || 1
              }, { silent: true });
            } catch (e) {
              // Guest item merge fallback
            }
          }
        }
      }
    } catch (e) {
      // Guest cart merge fallback
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      mergeGuestCartIntoUser(user.email).then(() => {
        client.get('/api/cart', { silent: true })
          .then(res => {
            if (res.data?.success && Array.isArray(res.data?.data?.items)) {
              if (res.data.data.items.length > 0) {
                const items = res.data.data.items.map(item => ({
                  _id: item.productId?._id || item.productId,
                  name: item.productId?.name || item.productName,
                  price: item.productId?.price || 0,
                  sellingPrice: item.productId?.price || 0,
                  compareAtPrice: item.productId?.compareAtPrice || null,
                  thumbnail: item.productId?.thumbnail || {},
                  quantity: item.quantity || 1,
                  productId: item.productId?._id || item.productId
                }));
                saveCart(items);
              } else {
                loadCartFromStorage();
              }
            } else {
              loadCartFromStorage();
            }
          })
          .catch(() => {
            loadCartFromStorage();
          });
      });
    } else {
      loadCartFromStorage();
    }
  }, [isAuthenticated, user?._id, user?.email]);

  const addToCart = async (product) => {
    if (!product) return;
    const exists = cartItems.find((item) => item._id === product._id || item.productId === product._id);
    if (exists) return;

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    const updated = [...cartItems, { ...product, quantity: 1 }];
    saveCart(updated);

    try {
      await client.post('/api/cart', {
        productId: product._id || product.productId,
        quantity: 1
      }, { silent: true });
    } catch (e) {
      // Backend sync quietly skipped
    }
  };

  const removeFromCart = async (productId) => {
    const updated = cartItems.filter((item) => item._id !== productId && item.productId !== productId);
    saveCart(updated);

    if (isAuthenticated) {
      setSyncing(true);
      try {
        await client.delete(`/api/cart/${productId}`, { silent: true });
      } catch (e) {
        // Backend sync quietly skipped
      } finally {
        setSyncing(false);
      }
    }
  };

  const removePurchasedItems = async (productIds = []) => {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      await clearCart();
      return;
    }
    const idsSet = new Set(productIds.map(id => String(id)));
    const updated = cartItems.filter(
      (item) => !idsSet.has(String(item._id)) && !idsSet.has(String(item.productId))
    );
    saveCart(updated);

    if (isAuthenticated) {
      setSyncing(true);
      try {
        for (const pid of productIds) {
          await client.delete(`/api/cart/${pid}`, { silent: true });
        }
      } catch (e) {
        // Backend sync quietly skipped
      } finally {
        setSyncing(false);
      }
    }
  };

  const clearCart = async () => {
    saveCart([]);

    if (isAuthenticated) {
      setSyncing(true);
      try {
        await client.delete('/api/cart', { silent: true });
      } catch (e) {
        // Backend sync quietly skipped
      } finally {
        setSyncing(false);
      }
    }
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.sellingPrice || item.price || 0), 0);
  const cartTotal = cartSubtotal;

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount: cartItems.length,
      cartSubtotal,
      cartTotal,
      addToCart,
      removeFromCart,
      removePurchasedItems,
      clearCart,
      syncing
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
