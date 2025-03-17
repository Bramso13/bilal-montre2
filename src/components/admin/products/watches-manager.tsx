"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface Watch {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  reference: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

interface WatchesManagerProps {
  className?: string;
}

export function WatchesManager({ className }: WatchesManagerProps) {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    reference: "",
    categoryId: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Charger les montres
  useEffect(() => {
    fetchWatches();
  }, [search, selectedCategory, page]);

  const fetchWatches = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (selectedCategory) queryParams.append("category", selectedCategory);
      queryParams.append("page", page.toString());

      const response = await fetch(
        `/api/admin/watches?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des montres");
      }

      const data = await response.json();
      setWatches(data.watches);
      setCategories(data.filters.categories);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les montres");
    } finally {
      setLoading(false);
    }
  };

  // Gérer la soumission du formulaire d'ajout
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    // Validation
    if (!formData.name) errors.name = "Le nom est obligatoire";
    if (!formData.description)
      errors.description = "La description est obligatoire";
    if (!formData.price) errors.price = "Le prix est obligatoire";
    if (!formData.stock) errors.stock = "Le stock est obligatoire";
    if (!formData.imageUrl)
      errors.imageUrl = "L'URL de l'image est obligatoire";
    if (!formData.reference) errors.reference = "La référence est obligatoire";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/admin/watches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la création de la montre"
        );
      }

      // Réinitialiser le formulaire et fermer la boîte de dialogue
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
        reference: "",
        categoryId: "",
      });
      setFormErrors({});
      setIsAddDialogOpen(false);
      fetchWatches();
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de créer la montre");
    }
  };

  // Gérer la soumission du formulaire de modification
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    // Validation
    if (!formData.name) errors.name = "Le nom est obligatoire";
    if (!formData.description)
      errors.description = "La description est obligatoire";
    if (!formData.price) errors.price = "Le prix est obligatoire";
    if (!formData.stock) errors.stock = "Le stock est obligatoire";
    if (!formData.imageUrl)
      errors.imageUrl = "L'URL de l'image est obligatoire";
    if (!formData.reference) errors.reference = "La référence est obligatoire";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch(`/api/admin/watches/${selectedWatch?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la modification de la montre"
        );
      }

      // Réinitialiser le formulaire et fermer la boîte de dialogue
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
        reference: "",
        categoryId: "",
      });
      setFormErrors({});
      setIsEditDialogOpen(false);
      setSelectedWatch(null);
      fetchWatches();
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de modifier la montre");
    }
  };

  // Gérer la suppression d'une montre
  const handleDelete = async () => {
    if (!selectedWatch) return;

    try {
      const response = await fetch(`/api/admin/watches/${selectedWatch.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la suppression de la montre"
        );
      }

      setIsDeleteDialogOpen(false);
      setSelectedWatch(null);
      fetchWatches();
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de supprimer la montre");
    }
  };

  // Ouvrir la boîte de dialogue de modification
  const handleEdit = (watch: Watch) => {
    setSelectedWatch(watch);
    setFormData({
      name: watch.name,
      description: watch.description,
      price: watch.price.toString(),
      stock: watch.stock.toString(),
      imageUrl: watch.imageUrl,
      reference: watch.reference,
      categoryId: watch.categoryId || "",
    });
    setIsEditDialogOpen(true);
  };

  // Ouvrir la boîte de dialogue de suppression
  const handleDeleteClick = (watch: Watch) => {
    setSelectedWatch(watch);
    setIsDeleteDialogOpen(true);
  };

  // Rendu d'une carte de montre
  const renderWatchCard = (watch: Watch) => (
    <Card key={watch.id} className="overflow-hidden">
      <div className="relative h-48 w-full bg-gray-200">
        {watch.imageUrl && (
          <Image
            src={watch.imageUrl}
            alt={watch.name}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{watch.name}</h3>
            <p className="text-sm text-muted-foreground">
              Réf: {watch.reference}
            </p>
            {watch.category && (
              <p className="text-sm text-muted-foreground">
                Catégorie: {watch.category.name}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(watch.price)}
            </p>
            <p
              className={`text-sm ${
                watch.stock > 10
                  ? "text-green-600"
                  : watch.stock > 0
                  ? "text-amber-600"
                  : "text-red-600"
              }`}
            >
              {watch.stock > 0 ? `${watch.stock} en stock` : "Rupture de stock"}
            </p>
          </div>
        </div>
        <p className="text-sm mt-2 line-clamp-2">{watch.description}</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => handleEdit(watch)}>
            Modifier
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteClick(watch)}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </Card>
  );

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Gestion des montres</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Ajouter une montre
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher une montre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={selectedCategory || ""}
          onValueChange={(value) => setSelectedCategory(value || null)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-end gap-2 mt-4">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {watches.length > 0 ? (
              watches.map((watch) => renderWatchCard(watch))
            ) : (
              <div className="col-span-full text-center py-10">
                Aucune montre trouvée
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <span className="flex items-center px-4">
                Page {page} sur {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}

      {/* Boîte de dialogue d'ajout */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter une montre</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Référence</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                />
                {formErrors.reference && (
                  <p className="text-sm text-red-500">{formErrors.reference}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Prix (€)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
                {formErrors.price && (
                  <p className="text-sm text-red-500">{formErrors.price}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
                {formErrors.stock && (
                  <p className="text-sm text-red-500">{formErrors.stock}</p>
                )}
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Aucune catégorie</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="imageUrl">URL de l'image</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                />
                {formErrors.imageUrl && (
                  <p className="text-sm text-red-500">{formErrors.imageUrl}</p>
                )}
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                {formErrors.description && (
                  <p className="text-sm text-red-500">
                    {formErrors.description}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Ajouter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier la montre</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reference">Référence</Label>
                <Input
                  id="edit-reference"
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                />
                {formErrors.reference && (
                  <p className="text-sm text-red-500">{formErrors.reference}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Prix (€)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
                {formErrors.price && (
                  <p className="text-sm text-red-500">{formErrors.price}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
                {formErrors.stock && (
                  <p className="text-sm text-red-500">{formErrors.stock}</p>
                )}
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-category">Catégorie</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Aucune catégorie</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-imageUrl">URL de l'image</Label>
                <Input
                  id="edit-imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                />
                {formErrors.imageUrl && (
                  <p className="text-sm text-red-500">{formErrors.imageUrl}</p>
                )}
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                {formErrors.description && (
                  <p className="text-sm text-red-500">
                    {formErrors.description}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>
            Êtes-vous sûr de vouloir supprimer la montre{" "}
            <strong>{selectedWatch?.name}</strong> ? Cette action est
            irréversible.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
