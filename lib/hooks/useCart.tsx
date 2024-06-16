import { create } from "zustand";
import { toast } from "react-hot-toast";
import { persist, createJSONStorage } from "zustand/middleware";

interface CartItem {
  item: ProductType;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartStore {
  cartItems: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (idToRemove: string, colorToRemove: string, sizeToRemove: string) => void;
  increaseQuantity: (idToIncrease: string, color: string, size: string) => void;
  decreaseQuantity: (idToDecrease: string, color: string, size: string) => void;
  clearCart: () => void;
}

const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      cartItems: [],
      addItem: (data: CartItem) => {
        const { item, quantity, color, size } = data;
        const currentItems = get().cartItems;
        const isExisting = currentItems.find(
          (cartItem) => cartItem.item._id === item._id && cartItem.color === color && cartItem.size === size
        );

        if (isExisting) {
          return toast("Item já adicionado ao carrinho");
        }

        set({ cartItems: [...currentItems, { item, quantity, color, size }] });
        toast.success("Item adicionado ao carrinho", { icon: "🛒" });
      },
      removeItem: (idToRemove: string, colorToRemove: string, sizeToRemove: string) => {
        const newCartItems = get().cartItems.filter(
          (cartItem) => !(cartItem.item._id === idToRemove && cartItem.color === colorToRemove && cartItem.size === sizeToRemove)
        );
        set({ cartItems: newCartItems });
        toast.success("Item removido do carrinho");
      },
      increaseQuantity: (idToIncrease: string, color: string, size: string) => {
        const newCartItems = get().cartItems.map((cartItem) =>
          cartItem.item._id === idToIncrease && cartItem.color === color && cartItem.size === size
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
        set({ cartItems: newCartItems });
        toast.success("Quant. de item atualizada");
      },
      decreaseQuantity: (idToDecrease: string, color: string, size: string) => {
        const newCartItems = get().cartItems.map((cartItem) =>
          cartItem.item._id === idToDecrease && cartItem.color === color && cartItem.size === size
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
        set({ cartItems: newCartItems });
        toast.success("Quant. de item atualizada");
      },
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCart;
