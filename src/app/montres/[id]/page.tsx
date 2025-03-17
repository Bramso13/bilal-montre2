"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Watch {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  brand: string;
  reference: string;
}

export default function WatchDetailPage() {
  const id= ""
  const router = useRouter();
  const [watch, setWatch] = useState<Watch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchWatch = async () => {
      try {
        const response = await fetch(`/api/watches/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Montre non trouvée");
          }
          throw new Error("Erreur lors de la récupération de la montre");
        }
        const data = await response.json();
        setWatch(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatch();
  }, [id]);

  const handleAddToCart = async () => {
    if (!watch) return;

    // Ici, vous pourriez implémenter l'ajout au panier
    // Pour l'instant, nous allons simplement afficher un toast
    toast.success("Produit ajouté au panier", {
      description: `${quantity} x ${watch.name} ajouté(s) à votre panier`,
    });
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !watch) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">
                {error || "Montre non trouvée"}
              </h3>
              <p className="text-muted-foreground mb-6">
                Nous n'avons pas pu trouver la montre que vous recherchez.
              </p>
              <Button onClick={() => router.push("/montres")}>
                Retour à la collection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image de la montre */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {watch.imageUrl ? (
            <img
              src={watch.imageUrl}
              alt={watch.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-6xl font-serif text-gray-500">
                {watch.brand}
              </div>
            </div>
          )}
        </div>

        {/* Détails de la montre */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{watch.name}</h1>
            <p className="text-muted-foreground">Réf. {watch.reference}</p>
          </div>

          <div className="text-2xl font-bold">
            {watch.price.toLocaleString("fr-FR")} €
          </div>

          <div className="prose max-w-none">
            <p>{watch.description}</p>
          </div>

          <div className="flex items-center space-x-2">
            <div
              className={
                watch.stock > 0 ? "text-green-600" : "text-destructive"
              }
            >
              {watch.stock > 0 ? "En stock" : "Rupture de stock"}
            </div>
            {watch.stock > 0 && (
              <div className="text-muted-foreground">
                ({watch.stock} disponible{watch.stock > 1 ? "s" : ""})
              </div>
            )}
          </div>

          {watch.stock > 0 && (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="font-medium">
                  Quantité:
                </label>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setQuantity(Math.min(watch.stock, quantity + 1))
                    }
                    disabled={quantity >= watch.stock}
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button
                className="w-full bg-gold hover:bg-gold/90 text-white"
                onClick={handleAddToCart}
              >
                Ajouter au panier
              </Button>
            </div>
          )}

          <div className="pt-6 border-t">
            <h3 className="font-medium mb-2">Caractéristiques:</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <span className="text-muted-foreground">Marque:</span>{" "}
                {watch.brand}
              </li>
              <li>
                <span className="text-muted-foreground">Référence:</span>{" "}
                {watch.reference}
              </li>
              {/* Vous pourriez ajouter d'autres caractéristiques ici */}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Button variant="outline" asChild>
          <Link href="/montres">Retour à la collection</Link>
        </Button>
      </div>
    </div>
  );
}
