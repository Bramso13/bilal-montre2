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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
interface Product {
  id: string;
  name: string;
  type: string;
  imageUrl: string;
  components: Component[];
}

interface Component {
  id: string;
  name: string;
  type: string;
  imageUrl: string;
}

interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  product: Product;
}

interface Order {
  id: string;
  clientName: string;
  date: string;
  amount: number;
  status: string;
  itemsCount: number;
  items: OrderItem[];
  shippingDetails?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
  shippingMethod?: string;
  shippingCost?: number;
  notes?: string;
}

interface OrdersManagerProps {
  className?: string;
}

export function OrdersManager({ className }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");

  // Statuts de commande
  const orderStatuses = [
    { value: "PENDING", label: "En attente", color: "bg-yellow-500" },
    { value: "PROCESSING", label: "En traitement", color: "bg-blue-500" },
    { value: "SHIPPED", label: "Expédiée", color: "bg-purple-500" },
    { value: "DELIVERED", label: "Livrée", color: "bg-green-500" },
    { value: "CANCELLED", label: "Annulée", color: "bg-red-500" },
  ];

  // Charger les commandes
  useEffect(() => {
    fetchOrders();
  }, [search, selectedStatus, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (selectedStatus) queryParams.append("status", selectedStatus);
      queryParams.append("page", page.toString());

      const response = await fetch(
        `/api/admin/orders?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des commandes");
      }

      const data = await response.json();
      setOrders(data.orders);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les commandes");
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'une commande
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      const response = await fetch(`/api/admin/orders`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, id: selectedOrder.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la mise à jour du statut"
        );
      }

      // Mettre à jour la commande dans la liste
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: newStatus }
            : order
        )
      );

      setIsStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus("");
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de mettre à jour le statut");
    }
  };

  // Ouvrir la boîte de dialogue de détails
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  };

  // Ouvrir la boîte de dialogue de changement de statut
  const handleStatusClick = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusDialogOpen(true);
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy à HH:mm", { locale: fr });
  };

  // Formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    const statusInfo = orderStatuses.find((s) => s.value === status);
    if (!statusInfo) return null;

    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.label}
      </Badge>
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
        <h2 className="text-2xl font-bold">Gestion des commandes</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par nom de client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={selectedStatus || ""}
          onValueChange={(value) => setSelectedStatus(value || null)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {orderStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
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
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.clientName}
                      </TableCell>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell>{formatPrice(order.amount)}</TableCell>
                      <TableCell>{order.itemsCount}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleStatusClick(order)}
                          className="cursor-pointer"
                        >
                          {getStatusBadge(order.status)}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      Aucune commande trouvée
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

      {/* Boîte de dialogue de détails */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Détails de la commande #{selectedOrder?.id.slice(-6)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations client et commande */}
                <Card className="p-4 shadow-sm">
                  <h3 className="font-semibold text-lg mb-3 border-b pb-2">Informations générales</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">{selectedOrder.clientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date de commande</p>
                      <p className="font-medium">
                        {formatDate(selectedOrder.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <div className="mt-1">
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Informations de livraison */}
                <Card className="p-4 shadow-sm">
                  <h3 className="font-semibold text-lg mb-3 border-b pb-2">Informations de livraison</h3>
                  {selectedOrder.shippingDetails ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Adresse</p>
                        <p className="font-medium">{selectedOrder.shippingDetails.address}</p>
                        <p className="font-medium">
                          {selectedOrder.shippingDetails.postalCode} {selectedOrder.shippingDetails.city}
                        </p>
                        <p className="font-medium">{selectedOrder.shippingDetails.country}</p>
                      </div>
                      {selectedOrder.shippingDetails.phone && (
                        <div>
                          <p className="text-sm text-muted-foreground">Téléphone</p>
                          <p className="font-medium">{selectedOrder.shippingDetails.phone}</p>
                        </div>
                      )}
                      {selectedOrder.shippingDetails.email && (
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedOrder.shippingDetails.email}</p>
                        </div>
                      )}
                      {selectedOrder.shippingMethod && (
                        <div>
                          <p className="text-sm text-muted-foreground">Méthode d'expédition</p>
                          <p className="font-medium">{selectedOrder.shippingMethod}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune information de livraison disponible</p>
                  )}
                </Card>
              </div>

              {/* Articles de la commande */}
              <Card className="shadow-sm">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-lg">Articles de la commande</h3>
                </div>
                <div className="divide-y">
                  {selectedOrder && selectedOrder.items && selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Image du produit */}
                        <div className="w-full md:w-1/4 flex-shrink-0">
                          {item.product.imageUrl ? (
                            <div className="relative h-40 rounded-md overflow-hidden bg-gray-100">
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="h-40 rounded-md bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-400">Pas d'image</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Détails du produit */}
                        <div className="flex-1">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-semibold text-lg">
                              {item.product.name}
                              {item.product.type === "Montre personnalisée" && (
                                <Badge variant="outline" className="ml-2">
                                  Personnalisé
                                </Badge>
                              )}
                            </h4>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Prix unitaire</p>
                              <p className="font-medium">{formatPrice(item.price)}</p>
                            </div>
                          </div>
                          
                          
                          
                          {/* Composants de la montre personnalisée */}
                          {item.product.type === "Montre personnalisée" && item.product.components && item.product.components.length > 0 && (
                            <div className="mt-3 mb-4">
                              <p className="text-sm font-medium mb-2">Composants personnalisés:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {item.product.components.map((component) => (
                                  <div key={component.id} className="flex items-center gap-2 text-sm">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                      {component.imageUrl && (
                                        <img 
                                          src={component.imageUrl} 
                                          alt={component.name} 
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <span>
                                      {component.type}: <strong>{component.name}</strong>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-end mt-auto">
                            <div>
                              <p className="text-sm text-muted-foreground">Quantité</p>
                              <p className="font-medium">{item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Total</p>
                              <p className="font-medium text-lg">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Résumé des coûts */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex flex-col gap-2 ml-auto w-full md:w-1/3 text-right">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total:</span>
                      <span className="font-medium">
                        {formatPrice(
                          selectedOrder.items.reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          )
                        )}
                      </span>
                    </div>
                    
                    {selectedOrder.shippingCost !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frais de livraison:</span>
                        <span className="font-medium">{formatPrice(selectedOrder.shippingCost)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatPrice(selectedOrder.amount)}</span>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Notes */}
              {selectedOrder.notes && (
                <Card className="p-4 shadow-sm">
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </Card>
              )}
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button onClick={() => setIsStatusDialogOpen(true)} className="mr-2">
              Modifier le statut
            </Button>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de changement de statut */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le statut</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Commande de <strong>{selectedOrder?.clientName}</strong> du{" "}
              {selectedOrder && formatDate(selectedOrder.date)}
            </p>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleStatusUpdate}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
