import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('thesill_cart');
    if (saved) {
      try {
        const items = JSON.parse(saved);
        return items.map(item => {
          if (item.product && item.product.price < 1000) {
            item.product.price = item.product.price * 1000;
          }
          return item;
        });
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('thesill_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1, potStyle = 'Classic Ceramic', potColor = 'Terracotta', size) => {
    // Check limit
    const limit = product.maxPurchaseLimit;
    if (limit && limit > 0) {
      const currentQtyInCart = cartItems
        .filter(item => item.product.id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0);
      if (currentQtyInCart + quantity > limit) {
        alert(`Sản phẩm này bị giới hạn mua tối đa ${limit} cây trên mỗi đơn hàng.`);
        return;
      }
    }

    setCartItems((prevItems) => {
      // Xác định size thực tế của item
      let finalSize = size;
      if (!finalSize) {
        const variants = product.variants || [];
        if (variants.length > 0) {
          const firstAvailable = variants.find(v => v.stock > 0);
          finalSize = firstAvailable ? firstAvailable.size : variants[0].size;
        } else {
          finalSize = 'medium'; // fallback mặc định
        }
      }

      // Check if item with exact configuration already exists
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.potStyle === potStyle &&
          item.potColor === potColor &&
          item.size === finalSize
      );

      if (existingIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      }

      return [...prevItems, { product, quantity, potStyle, potColor, size: finalSize }];
    });
    
    // Automatically open cart drawer when adding item
    setIsCartOpen(true);
  }, [setCartItems, cartItems]);

  const removeFromCart = useCallback((productId, potStyle, potColor, size) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.product.id === productId &&
            item.potStyle === potStyle &&
            item.potColor === potColor &&
            item.size === size)
      )
    );
  }, [setCartItems]);

  const updateQuantity = useCallback((productId, potStyle, potColor, size, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, potStyle, potColor, size);
      return;
    }

    // Check limit
    const itemToUpdate = cartItems.find(
      (item) =>
        item.product.id === productId &&
        item.potStyle === potStyle &&
        item.potColor === potColor &&
        item.size === size
    );
    if (itemToUpdate) {
      const limit = itemToUpdate.product.maxPurchaseLimit;
      if (limit && limit > 0) {
        const otherQty = cartItems
          .filter(
            (item) =>
              item.product.id === productId &&
              !(item.potStyle === potStyle &&
                item.potColor === potColor &&
                item.size === size)
          )
          .reduce((sum, item) => sum + item.quantity, 0);
        if (otherQty + newQuantity > limit) {
          alert(`Sản phẩm này bị giới hạn mua tối đa ${limit} cây trên mỗi đơn hàng.`);
          return;
        }
      }
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId &&
        item.potStyle === potStyle &&
        item.potColor === potColor &&
        item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, [setCartItems, removeFromCart, cartItems]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, [setCartItems]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const value = useMemo(() => ({
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
  }), [cartItems, isCartOpen, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
