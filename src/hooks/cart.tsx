import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface ProductInterface {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity?: number;
}

interface CartContext {
  products: ProductInterface[];
  addToCart(item: ProductInterface): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<ProductInterface[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const rawProducts = await AsyncStorage.getItem('@GoMarketplace:product');
      if (rawProducts) setProducts(JSON.parse(rawProducts));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      let newProducts = [];

      if (products.find(p => p.id === product.id)) {
        newProducts = products.map(p => {
          if (p.id === product.id)
            return {
              id: p.id,
              title: p.title,
              image_url: p.image_url,
              price: p.price,
              quantity: (p.quantity ? p.quantity : 0) + 1,
            };
          return p;
        });
      } else {
        newProducts = [
          ...products,
          {
            id: product.id,
            title: product.title,
            image_url: product.image_url,
            price: product.price,
            quantity: 1,
          },
        ];
      }

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:product',
        JSON.stringify(newProducts),
      );
    },
    [products, setProducts],
  );

  const increment = useCallback(
    async id => {
      if (products.find(p => p.id === id)) {
        const newProducts = products.map(p => {
          if (p.id === id)
            return {
              id: p.id,
              title: p.title,
              image_url: p.image_url,
              price: p.price,
              quantity: (p.quantity ? p.quantity : 0) + 1,
            };
          return p;
        });

        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:product',
          JSON.stringify(newProducts),
        );
      }
    },
    [products, setProducts],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(p => p.id === id);
      if (product) {
        let newProducts = [];
        if (product.quantity === 1) {
          newProducts = products.filter(p => p.id !== id);
        } else {
          newProducts = products.map(p => {
            if (p.id === id) {
              return {
                id: p.id,
                title: p.title,
                image_url: p.image_url,
                price: p.price,
                quantity: (p.quantity ? p.quantity : 0) - 1,
              };
            }

            return p;
          });
        }

        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:product',
          JSON.stringify(newProducts),
        );
      }
    },
    [products, setProducts],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
