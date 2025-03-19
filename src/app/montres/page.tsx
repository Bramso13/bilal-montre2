"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

interface Watch {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  brand: string;
  reference: string;
  type: "watch" | "custom-watch";
}

export default function MontresPage() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchWatches = async () => {
      try {
        const response = await fetch("/api/watches");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des montres");
        }
        const data = await response.json();
        setWatches(data);
      } catch (err) {
        setError("Une erreur est survenue lors du chargement des montres");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatches();
  }, []);

  // Filtrer les montres en fonction du terme de recherche
  const filteredWatches = watches.filter(
    (watch) =>
      watch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      watch.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      watch.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-12" style={{background: 'black'}}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">
            Collection de Montres Seiko
          </h1>
          <p className="text-muted-foreground">
            Découvrez notre sélection de montres Seiko de haute qualité
          </p>
        </div>
        <div className="w-full md:w-auto">
          <div className="relative">
            <Input
              type="search"
              placeholder="Rechercher une montre..."
              className="w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-square">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-10 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredWatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWatches.map((watch) => (
            <Card key={watch.id} className="overflow-hidden flex flex-col" style={{background: 'black'}}>
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {watch.imageUrl ? (
                  <img
                    src={watch.imageUrl}
                    alt={watch.name}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-4xl font-serif text-gray-500">
                      {watch.brand}
                    </div>
                  </div>
                )}
                {watch.stock <= 0 && (
                  <div className="absolute top-0 right-0 bg-destructive text-white px-3 py-1 text-sm font-medium">
                    Rupture de stock
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-white">{watch.name}</CardTitle>
                
              </CardHeader>
              <CardFooter className="flex justify-between mt-auto">
                <div className="font-bold text-lg text-white">
                  {watch.price.toLocaleString("fr-FR")} €
                </div>
                <AddToCartButton product={watch} />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Aucune montre trouvée</h3>
          <p className="text-muted-foreground mb-6">
            Aucune montre ne correspond à votre recherche.
          </p>
          {searchTerm && (
            <Button onClick={() => setSearchTerm("")}>
              Effacer la recherche
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
