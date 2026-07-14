import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Sync cart from backend when user logs in
  const fetchCart = async () => {
    if (!user || !token) {
      setCart({ items: [] });
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get('/cart');
      if (response.data.success) {
        setCart(response.data.cart);
      }
    } catch (error) {
      console.error('[Cart Context] Error loading cart:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user, token]);

  // Add pizza item to cart
  const addToCart = async ({ pizzaId, isCustom, customPizzaDetails, size, price, quantity = 1 }) => {
    try {
      if (!user) {
        // Fallback for anonymous users: store in LocalStorage if needed, but we require auth for active checkout
        return { success: false, message: 'Please log in to add items to your cart.' };
      }

      const response = await axios.post('/cart', {
        pizzaId,
        isCustom,
        customPizzaDetails,
        size,
        price,
        quantity
      });

      if (response.data.success) {
        setCart(response.data.cart);
        return { success: true, message: 'Pizza added to cart!' };
      }
      return { success: false, message: 'Failed to add item' };
    } catch (error) {
      console.error('[Cart Context] Add to cart failed:', error);
      return { success: false, message: error.response?.data?.message || 'Error adding item' };
    }
  };

  // Remove pizza item from cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await axios.delete(`/cart/${itemId}`);
      if (response.data.success) {
        setCart(response.data.cart);
        return { success: true, message: 'Removed from cart' };
      }
      return { success: false, message: 'Failed to remove item' };
    } catch (error) {
      console.error('[Cart Context] Remove from cart failed:', error);
      return { success: false, message: 'Error removing item' };
    }
  };

  // Adjust item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeFromCart(itemId);
    }
    try {
      const response = await axios.put(`/cart/${itemId}`, { quantity: newQuantity });
      if (response.data.success) {
        setCart(response.data.cart);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('[Cart Context] Update quantity failed:', error);
      return { success: false };
    }
  };

  // Clear shopping cart
  const clearCart = async () => {
    try {
      const response = await axios.delete('/cart');
      if (response.data.success) {
        setCart(response.data.cart);
        setCouponCode('');
        setDiscountPercent(0);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('[Cart Context] Clear cart failed:', error);
      return { success: false };
    }
  };

  // Apply Coupon Code
  const applyCoupon = (code) => {
    const uppercaseCode = code.trim().toUpperCase();
    if (uppercaseCode === 'PIZZAVERSE20') {
      setCouponCode(uppercaseCode);
      setDiscountPercent(20); // 20% off
      return { success: true, message: 'Coupon applied! 20% discount added.' };
    } else if (uppercaseCode === 'SUPERFOOD') {
      setCouponCode(uppercaseCode);
      setDiscountPercent(15); // 15% off
      return { success: true, message: 'Coupon applied! 15% discount added.' };
    } else if (uppercaseCode === 'FIRSTORDER') {
      setCouponCode(uppercaseCode);
      setDiscountPercent(10); // 10% off
      return { success: true, message: 'Coupon applied! 10% discount added.' };
    }
    return { success: false, message: 'Invalid coupon code' };
  };

  // Remove Coupon Code
  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
  };

  // Calculations
  const itemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const deliveryCharges = subtotal > 0 ? (subtotal > 500 ? 0 : 40) : 0; // Free delivery above 500
  const gstCharges = Math.round(subtotal * 0.05); // 5% GST
  const totalAmount = subtotal - discountAmount + deliveryCharges + gstCharges;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemsCount,
        subtotal,
        discountPercent,
        discountAmount,
        deliveryCharges,
        gstCharges,
        totalAmount,
        couponCode,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
