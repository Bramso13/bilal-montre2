"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CreditCard,
  Truck,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalItems, totalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const shippingCost = shippingMethod === "express" ? 15 : 5;
  const totalWithShipping = totalPrice + shippingCost;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      return;
    }

    setIsSubmitting(true);

    // Récupérer les données du formulaire
    const form = e.target as HTMLFormElement;
    const formValues = {
      firstName: (form.querySelector('#firstName') as HTMLInputElement)?.value || '',
      lastName: (form.querySelector('#lastName') as HTMLInputElement)?.value || '',
      email: (form.querySelector('#email') as HTMLInputElement)?.value || '',
      phone: (form.querySelector('#phone') as HTMLInputElement)?.value || '',
      address: (form.querySelector('#address') as HTMLInputElement)?.value || '',
      postalCode: (form.querySelector('#postalCode') as HTMLInputElement)?.value || '',
      city: (form.querySelector('#city') as HTMLInputElement)?.value || '',
      country: (form.querySelector('#country') as HTMLInputElement)?.value || '',
    };

    // Créer une commande via l'API
    try {
      // Préparer les articles pour l'API
      const orderItems = items.map((item) => ({
        watchId: item.type === "watch" ? item.id : undefined,
        customWatchId: item.type === "custom-watch" ? item.id : undefined,
        quantity: item.quantity,
      }));

      // Appel à l'API pour créer la commande
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          shippingDetails: formValues,
          shippingMethod,
          shippingCost,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création de la commande");
      }

      const data = await response.json();
      console.log("Commande créée avec succès:", data);

      // Simuler un délai de traitement pour une meilleure UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Afficher le succès
      setIsSuccess(true);

      // Vider le panier
      clearCart();

      // Rediriger après un délai
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      alert(error instanceof Error ? error.message : "Une erreur est survenue lors de la création de la commande");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si le panier est vide, rediriger vers la page du panier
  if (items.length === 0 && !isSuccess) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-24 w-24 text-amber-500 mb-6" />
          <h2 className="text-2xl font-medium mb-2">Votre panier est vide</h2>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Vous ne pouvez pas procéder au paiement car votre panier est vide.
          </p>
          <Button asChild size="lg">
            <Link href="/montres">Découvrir nos montres</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Afficher la page de succès
  if (isSuccess) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-green-100 p-4 rounded-full mb-6">
            <CheckCircle className="h-24 w-24 text-green-600" />
          </div>
          <h2 className="text-2xl font-medium mb-2">Commande confirmée !</h2>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Merci pour votre commande. Vous recevrez un email de confirmation
            avec les détails de votre achat.
          </p>
          <Button asChild size="lg">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="flex items-center mb-8">
        <Button asChild variant="ghost" className="mr-4">
          <Link href="/panier">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au panier
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Prise de commandes</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Informations personnelles */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Informations personnelles
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        defaultValue={session?.user?.name?.split(" ")[0] || ""}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        defaultValue={session?.user?.name?.split(" ")[1] || ""}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={session?.user?.email || ""}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input id="phone" type="tel" required />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Adresse de livraison */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Adresse de livraison
                  </h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input id="address" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Code postal</Label>
                        <Input id="postalCode" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Ville</Label>
                        <Input id="city" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Pays</Label>
                      <Input id="country" defaultValue="France" required />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Méthode de livraison */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Méthode de livraison
                  </h2>

                  <RadioGroup
                    value={shippingMethod}
                    onValueChange={setShippingMethod}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label
                        htmlFor="standard"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Truck className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Livraison standard</p>
                              <p className="text-sm text-muted-foreground">
                                3-5 jours ouvrés
                              </p>
                            </div>
                          </div>
                          <p className="font-medium">{formatPrice(5)}</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="express" id="express" />
                      <Label
                        htmlFor="express"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Truck className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Livraison express</p>
                              <p className="text-sm text-muted-foreground">
                                1-2 jours ouvrés
                              </p>
                            </div>
                          </div>
                          <p className="font-medium">{formatPrice(15)}</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 lg:hidden">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Traitement en cours..."
                  : `Payer ${formatPrice(totalWithShipping)}`}
              </Button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>

                <div className="max-h-80 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex gap-3 mb-3 pb-3 border-b"
                    >
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-gray-200">
                            <AlertCircle className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="font-medium text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between mb-6">
                  <span className="font-medium">Total</span>
                  <span className="font-medium text-lg">
                    {formatPrice(totalWithShipping)}
                  </span>
                </div>

                <Button
                  type="submit"
                  form="checkout-form"
                  className="w-full hidden lg:block"
                  size="lg"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting
                    ? "Traitement en cours..."
                    : `Payer ${formatPrice(totalWithShipping)}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
