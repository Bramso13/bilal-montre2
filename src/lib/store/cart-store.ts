import { Component } from "@/app/personnaliser/page";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  type: "watch" | "custom-watch";
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  reference?: string;
  components?: Component[];
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;

  // Actions
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, type: "watch" | "custom-watch") => void;
  updateQuantity: (
    id: string,
    type: "watch" | "custom-watch",
    quantity: number
  ) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (newItem) => {
        const { items } = get();

        // Vérifier si l'article existe déjà dans le panier
        const existingItemIndex = items.findIndex(
          (item) => item.id === newItem.id && item.type === newItem.type
        );

        let updatedItems: CartItem[];

        if (existingItemIndex !== -1) {
          // Si l'article existe, augmenter la quantité
          updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += 1;
        } else {
          // Sinon, ajouter le nouvel article avec une quantité de 1
          updatedItems = [...items, { ...newItem, quantity: 1 }];
        }

        // Calculer les totaux
        const totalItems = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalPrice = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        set({
          items: updatedItems,
          totalItems,
          totalPrice,
        });
      },

      removeItem: (id, type) => {
        const { items } = get();

        // Filtrer l'article à supprimer
        const updatedItems = items.filter(
          (item) => !(item.id === id && item.type === type)
        );

        // Calculer les totaux
        const totalItems = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalPrice = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        set({
          items: updatedItems,
          totalItems,
          totalPrice,
        });
      },

      updateQuantity: (id, type, quantity) => {
        const { items } = get();

        // Mettre à jour la quantité de l'article
        const updatedItems = items.map((item) => {
          if (item.id === id && item.type === type) {
            return { ...item, quantity: Math.max(1, quantity) };
          }
          return item;
        });

        // Calculer les totaux
        const totalItems = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const totalPrice = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        set({
          items: updatedItems,
          totalItems,
          totalPrice,
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      },
    }),
    {
      name: "bilal-montre-cart", // nom pour le stockage local
    }
  )
);
