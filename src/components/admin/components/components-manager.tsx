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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Component {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  type: string;
}

interface ComponentsManagerProps {
  className?: string;
}

export function ComponentsManager({ className }: ComponentsManagerProps) {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(
    null
  );
  const [formData, setFormData] = useState({
    id: "", 
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    type: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Types de composants
  const componentTypes = [
    { value: "CASE", label: "Boîtier", color: "bg-slate-600" },
    { value: "DIAL", label: "Cadran", color: "bg-amber-600" },
    { value: "HANDS", label: "Aiguilles", color: "bg-blue-600" },
    { value: "STRAP", label: "Bracelet", color: "bg-green-600" },
    { value: "MOVEMENT", label: "Mouvement", color: "bg-red-600" },
    { value: "CRYSTAL", label: "Verre", color: "bg-purple-600" },
    { value: "CROWN", label: "Couronne", color: "bg-pink-600" },
    { value: "OTHER", label: "Autre", color: "bg-gray-600" },
  ];

  // Charger les composants
  useEffect(() => {
    fetchComponents();
  }, [search, selectedType, page]);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (selectedType) queryParams.append("type", selectedType);
      queryParams.append("page", page.toString());

      const response = await fetch(
        `/api/admin/components?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des composants");
      }

      const data = await response.json();
      setComponents(data.components);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les composants");
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
    if (!formData.type) errors.type = "Le type est obligatoire";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    

    try {
      const response = await fetch("/api/admin/components", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData, "errorData", formData);

        throw new Error(
          errorData.error || "Erreur lors de la création du composant"
        );
      }

      // Réinitialiser le formulaire et fermer la boîte de dialogue
      setFormData({
        id: "",
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
        type: "",
      });
      setFormErrors({});
      setIsAddDialogOpen(false);
      fetchComponents();
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de créer le composant");
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
    if (!formData.type) errors.type = "Le type est obligatoire";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch(`/api/admin/components`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la modification du composant"
        );
      }

      // Réinitialiser le formulaire et fermer la boîte de dialogue
      setFormData({
        id: "",
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
        type: "",
      });
      setFormErrors({});
      setIsEditDialogOpen(false);
      setSelectedComponent(null);
      fetchComponents();
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de modifier le composant");
    }
  };

  // Gérer la suppression d'un composant
  const handleDelete = async () => {
    if (!selectedComponent) return;

    try {
      const response = await fetch(`/api/admin/components`, {
        method: "DELETE",
        body: JSON.stringify({ id: selectedComponent.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la suppression du composant"
        );
      }

      setIsDeleteDialogOpen(false);
      setSelectedComponent(null);
      fetchComponents();
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de supprimer le composant");
    }
  };

  // Ouvrir la boîte de dialogue de modification
  const handleEdit = (component: Component) => {
    setSelectedComponent(component);
    setFormData({
      id: component.id,
      name: component.name,
      description: component.description,
      price: component.price.toString(),
      stock: component.stock.toString(),
      imageUrl: component.imageUrl,
      type: component.type,
    });
    setIsEditDialogOpen(true);
  };

  // Ouvrir la boîte de dialogue de suppression
  const handleDeleteClick = (component: Component) => {
    setSelectedComponent(component);
    setIsDeleteDialogOpen(true);
  };

  // Formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  // Obtenir le badge de type
  const getTypeBadge = (type: string) => {
    const typeInfo = componentTypes.find((t) => t.value === type);
    if (!typeInfo) return null;

    return (
      <Badge className={`${typeInfo.color} text-white`}>{typeInfo.label}</Badge>
    );
  };

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
        <h2 className="text-2xl font-bold">Gestion des composants</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Ajouter un composant
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un composant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={selectedType || ""}
          onValueChange={(value) => setSelectedType(value || null)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {componentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card className="p-4">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.length > 0 ? (
                  components.map((component) => (
                    <TableRow key={component.id}>
                      <TableCell>
                        <div className="relative h-10 w-10 rounded-md overflow-hidden">
                          {component.imageUrl && (
                            <Image
                              src={component.imageUrl}
                              alt={component.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {component.name}
                      </TableCell>
                      <TableCell>{getTypeBadge(component.type)}</TableCell>
                      <TableCell>{formatPrice(component.price)}</TableCell>
                      <TableCell>
                        <span
                          className={
                            component.stock > 10
                              ? "text-green-600"
                              : component.stock > 0
                              ? "text-amber-600"
                              : "text-red-600"
                          }
                        >
                          {component.stock > 0
                            ? `${component.stock} en stock`
                            : "Rupture de stock"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(component)}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(component)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      Aucun composant trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

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
            <DialogTitle>Ajouter un composant</DialogTitle>
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
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {componentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.type && (
                  <p className="text-sm text-red-500">{formErrors.type}</p>
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
            <DialogTitle>Modifier le composant</DialogTitle>
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
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {componentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.type && (
                  <p className="text-sm text-red-500">{formErrors.type}</p>
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
            Êtes-vous sûr de vouloir supprimer le composant{" "}
            <strong>{selectedComponent?.name}</strong> ? Cette action est
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
