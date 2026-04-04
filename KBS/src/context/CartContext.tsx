import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '@/services/productService';
import { useAuth } from './AuthContext';
import { cartApiService } from '@/services/authService';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  syncCartWithBackend: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { isAuthenticated, user } = useAuth();

  // Charger le panier au démarrage ou au login
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated) {
        try {
          const remoteCart = await cartApiService.getCart();
          if (remoteCart.items && remoteCart.items.length > 0) {
            const mappedItems = remoteCart.items.map((item: any) => ({
              id: item.product_id.toString(),
              name: item.name,
              price: parseFloat(item.price),
              quantity: item.quantity,
              image: item.image_url
            }));
            setCartItems(mappedItems);
          }
        } catch (error) {
          console.error('Failed to load remote cart:', error);
        }
      } else {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          setCartItems(JSON.parse(localCart));
        }
      }
    };
    loadCart();
  }, [isAuthenticated]);

  // Sauvegarder en local storage à chaque changement (fallback)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const syncCartWithBackend = async () => {
    if (isAuthenticated) {
      const itemsToSync = cartItems.map(item => ({
        product_id: parseInt(item.id),
        quantity: item.quantity
      }));
      await cartApiService.syncCart(itemsToSync);
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      let newItems;
      if (existingItem) {
        newItems = prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.image
        }];
      }
      return newItems;
    });

    // Optionnel: sync immédiat si connecté
    if (isAuthenticated) {
      cartApiService.addItemToCart(parseInt(product.id), quantity);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const newItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(newItems);

    if (isAuthenticated) {
      // Sync globale simple pour plus de fiabilité après update
      cartApiService.syncCart(newItems.map(it => ({ product_id: parseInt(it.id), quantity: it.quantity })));
    }
  };

  const removeFromCart = (id: string) => {
    const newItems = cartItems.filter(item => item.id !== id);
    setCartItems(newItems);
    if (isAuthenticated) {
      cartApiService.syncCart(newItems.map(it => ({ product_id: parseInt(it.id), quantity: it.quantity })));
    }
  };

  const clearCart = () => {
    setCartItems([]);
    if (isAuthenticated) {
      cartApiService.syncCart([]);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalItems,
        syncCartWithBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
