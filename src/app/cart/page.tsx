"use client";

import { useRouter } from "next/navigation";
import { useCartStore, CartItem } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const {
    items: cartItems,
    totalItems,
    totalPrice,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCartStore();

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    updateQuantity(item.id, item.type, newQuantity);
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Votre panier</h1>
        <div className="flex flex-col items-center justify-center py-16">
          <ShoppingCart className="h-24 w-24 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-medium mb-2">Votre panier est vide</h2>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Vous n'avez pas encore ajouté de montres à votre panier. Découvrez
            notre collection et trouvez la montre parfaite pour vous.
          </p>
          <Button asChild size="lg">
            <Link href="/montres">Découvrir nos montres</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Votre panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Articles ({totalItems})
                </h2>
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={clearCart}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vider le panier
                </Button>
              </div>

              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex gap-6 pb-6 border-b"
                  >
                    <div className="relative h-24 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.components && item.components.length > 0 ? (
                        item.components.map((component) => {
                          {/* Boîtier */}
                        if(component.type === "CASE"){
                          return (
                            <div className="absolute inset-0 z-10 flex items-center justify-center" key={component.id}>
                            {component.imageUrl ? (
                              <Image
                                src={component.imageUrl}
                                alt={component.name}

                                width={200}
                                height={200}
                              />
                            ) : (
                              <div className="w-full h-full bg-gold rounded-full"></div>
                            )}
                          </div>
                        )
                        }
                        
                        {/* Cadran */}
                        if(component.type === "DIAL"){
                          return (
                          <div className="absolute inset-[10%] z-20 rounded-full overflow-hidden flex items-center justify-center">
                            {component.imageUrl ? (
                              <Image
                                src={component.imageUrl}
                                alt={component.name}
                                className="object-center"
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="w-full h-full bg-navy flex items-center justify-center">
                                <div className="text-white font-serif text-xl">Seiko</div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Lunette */}
                        if(component.type === "BEZEL"){
                          return (
                          <div className="absolute inset-0 z-30" key={component.id} >
                            {component.imageUrl ? (
                              <Image
                                src={component.imageUrl}
                                alt={component.name}

                                width={200}
                                height={200}
                              />
                            ) : (
                              <div className="absolute inset-0 border-8 border-gold rounded-full pointer-events-none"></div>
                            )}
                          </div>
                        )}
                        
                        {/* Aiguilles */}
                        if(component.type === "HANDS"){
                          return (
                          <div className="absolute inset-0 z-40 flex items-center justify-center" key={component.id}>
                            {component.imageUrl ? (
                              <Image
                                src={component.imageUrl}
                                alt={component.name}
                                className="object-center transform -translate-y-[5px]"
                                width={30}
                                height={30}
                              />
                            ) : (
                              <div className="relative w-full h-full">
                                <div className="absolute top-1/2 left-1/2 w-[45%] h-1 bg-white transform -translate-x-1/4 -translate-y-1/2 origin-right rotate-45"></div>
                                <div className="absolute top-1/2 left-1/2 w-[30%] h-0.5 bg-white transform -translate-x-1/4 -translate-y-1/2 origin-right -rotate-45"></div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Bracelet */}
                        if(component.type === "STRAP"){
                          return (
                          <div className="absolute">
                            {component.imageUrl ? (
                              <>
                                <div className="flex items-center justify-center" key={component.id}>
                                  <Image
                                    src={component.imageUrl}
                                    alt={component.name}
                                    className="object-center transform"
                                    width={200}
                                    height={200}
                                  />
                                </div>
                                
                              </>
                            ) : (
                              <>
                                <div className="w-1/3 h-1/2 bg-gray-300"></div>
                                <div className="invisible w-full h-full"></div>
                                <div className="w-1/3 h-1/2 bg-gray-300"></div>
                              </>
                            )}
                          </div>
                        )}
                        })
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-gray-200">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                      {item.reference && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Réf: {item.reference}
                        </p>
                      )}
                      {item.type === "custom-watch" && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Montre personnalisée
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mb-3">
                        Prix unitaire: {formatPrice(item.price)}
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() =>
                              handleQuantityChange(item, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="h-8 w-12 text-center border-0"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() =>
                              handleQuantityChange(item, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeItem(item.id, item.type)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>

              <div className="space-y-3 mb-6">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between mb-6">
                <span className="font-medium">Total</span>
                <span className="font-medium text-lg">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <Button
                className="w-full mb-3"
                size="lg"
                onClick={handleCheckout}
              >
                Passer à la caisse
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/montres">Continuer mes achats</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
