import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const local = localStorage.getItem('phuquy_wishlist');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  // Đồng bộ khi đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/wishlist')
        .then((res) => {
          if (res.data) {
            setWishlist(res.data);
            localStorage.setItem('phuquy_wishlist', JSON.stringify(res.data));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Lưu localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('phuquy_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = async (product) => {
    const exists = isInWishlist(product.id);
    let nextList;
    if (exists) {
      nextList = wishlist.filter((item) => item.id !== product.id);
    } else {
      nextList = [product, ...wishlist];
    }
    setWishlist(nextList);

    // Gửi lên backend nếu đã đăng nhập
    if (isAuthenticated) {
      try {
        await api.post(`/wishlist/${product.id}/toggle`);
      } catch (err) {
        console.error('Wishlist sync error:', err);
      }
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    if (isAuthenticated) {
      api.post(`/wishlist/${productId}/toggle`).catch(() => {});
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
