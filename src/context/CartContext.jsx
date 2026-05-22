import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('thesill_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('thesill_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, potStyle = 'Classic Ceramic', potColor = 'Terracotta') => {
    setCartItems((prevItems) => {
      // Check if item with exact configuration already exists
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.potStyle === potStyle &&
          item.potColor === potColor
      );

      if (existingIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      }

      return [...prevItems, { product, quantity, potStyle, potColor }];
    });
    
    // Automatically open cart drawer when adding item
    setIsCartOpen(true);
  };

  const removeFromCart = (productId, potStyle, potColor) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.product.id === productId &&
            item.potStyle === potStyle &&
            item.potColor === potColor)
      )
    );
  };

  const updateQuantity = (productId, potStyle, potColor, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, potStyle, potColor);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId &&
        item.potStyle === potStyle &&
        item.potColor === potColor
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
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
