"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: {
    id: string;
    type: "watch" | "custom-watch";
    name: string;
    price: number;
    imageUrl: string;
    reference?: string;
  };
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

export function AddToCartButton({
  product,
  className,
  variant = "default",
  ...props
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);

    // Réinitialiser l'état après un délai
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <Button
      variant={variant}
      className={cn(
        "transition-all",
        isAdded && "bg-green-600 hover:bg-green-700",
        className
      )}
      onClick={handleAddToCart}
      {...props}
    >
      {isAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Ajouté au panier
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ajouter au panier
        </>
      )}
    </Button>
  );
}
