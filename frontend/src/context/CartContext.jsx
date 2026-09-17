import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);

  // Nạp giỏ hàng từ server khi user đăng nhập
  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
    }
    const res = await api.post('/cart/items', { productId, quantity });
    if (res.success && res.data) {
      setCart(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Thêm vào giỏ thất bại');
  };

  const updateQuantity = async (itemId, quantity) => {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    if (res.success && res.data) {
      setCart(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Cập nhật số lượng thất bại');
  };

  const removeItem = async (itemId) => {
    const res = await api.delete(`/cart/items/${itemId}`);
    if (res.success && res.data) {
      setCart(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Xóa sản phẩm thất bại');
  };

  const clearCart = async () => {
    await api.delete('/cart/clear');
    setCart({ items: [], totalItems: 0, totalPrice: 0 });
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
