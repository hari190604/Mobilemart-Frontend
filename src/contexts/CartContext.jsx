import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();
    } else {
      setCartItems([]);
      setWishlistItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      const items = response.data.data || [];
      const formattedItems = items.map(item => ({
        cartItemId: item.id,
        id: item.productId,
        name: item.productName,
        imageUrl: item.productImageUrl,
        price: item.price,
        quantity: item.quantity,
      }));
      setCartItems(formattedItems);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
        alert("Please login to add to cart");
        return;
    }
    try {
      await api.post('/cart', { productId: product.id, quantity });
      fetchCart();
    } catch (error) {
      console.error("Failed to add to cart", error);
      alert(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const item = cartItems.find(i => i.id === productId);
      if (item && item.cartItemId) {
        await api.delete(`/cart/${item.cartItemId}`);
        fetchCart();
      }
    } catch (error) {
      console.error("Failed to remove from cart", error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const currentItem = cartItems.find(i => i.id === productId);
    if (!currentItem) return;
    
    const diff = quantity - currentItem.quantity;
    if (diff !== 0) {
      try {
        await api.post('/cart', { productId, quantity: diff });
        fetchCart();
      } catch (error) {
        console.error("Failed to update quantity", error);
      }
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCartItems([]);
    } catch (error) {
      console.error("Failed to clear cart", error);
    }
  };

  // --- Wishlist Methods ---
  const fetchWishlist = async () => {
    try {
      const response = await api.get('/cart/wishlist');
      const items = response.data.data || [];
      const formattedItems = items.map(item => item.productId);
      setWishlistItems(formattedItems);
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      alert("Please login to manage wishlist");
      return;
    }
    try {
      await api.post(`/cart/wishlist/${productId}`);
      fetchWishlist();
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
      alert(error.response?.data?.message || "Failed to update wishlist");
    }
  };

  const clearWishlist = async () => {
    try {
      await api.delete('/cart/wishlist/clear');
      setWishlistItems([]);
    } catch (error) {
      console.error("Failed to clear wishlist", error);
    }
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        wishlistItems,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
