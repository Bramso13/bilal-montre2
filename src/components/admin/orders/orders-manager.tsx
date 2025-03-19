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

interface User {
  id: string;
  name: string;
  email: string;
}

interface OrderItem {
  id: string;
  orderId: string;
  quantity: number;
  price: number;
  watchId: string | null;
  customWatchId: string | null;
  watch: any | null;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  items: OrderItem[];
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
  const [customWatchesDetails, setCustomWatchesDetails] = useState<
    Record<string, any>
  >({});

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
      console.log(data.orders);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les commandes");
    } finally {
      setLoading(false);
    }
  };

  /*
  [
    {
        "id": "cm8g5emhu000syxy1ts7afja5",
        "userId": "cm8eol3j50000yxnhqa1t5rm9",
        "status": "PENDING",
        "totalAmount": 160,
        "createdAt": "2025-03-19T16:40:08.035Z",
        "updatedAt": "2025-03-19T16:40:08.035Z",
        "user": {
            "id": "cm8eol3j50000yxnhqa1t5rm9",
            "name": "Brahim Belabbas",
            "email": "brahim.belabbas.b@gmail.com"
        },
        "items": [
            {
                "id": "cm8g5emih000uyxy1hranu917",
                "orderId": "cm8g5emhu000syxy1ts7afja5",
                "quantity": 1,
                "price": 80,
                "watchId": null,
                "customWatchId": "cm8g59al2000ayxy1hyw3o8qm",
                "watch": null
            },
            {
                "id": "cm8g5emj2000wyxy1uxgczlji",
                "orderId": "cm8g5emhu000syxy1ts7afja5",
                "quantity": 1,
                "price": 80,
                "watchId": null,
                "customWatchId": "cm8g59xss000gyxy1iscvo383",
                "watch": null
            }
        ]
    },
    {
        "id": "cm8g5aufj000myxy16mxs44gf",
        "userId": "cm8eol3j50000yxnhqa1t5rm9",
        "status": "PENDING",
        "totalAmount": 160,
        "createdAt": "2025-03-19T16:37:11.696Z",
        "updatedAt": "2025-03-19T16:37:11.696Z",
        "user": {
            "id": "cm8eol3j50000yxnhqa1t5rm9",
            "name": "Brahim Belabbas",
            "email": "brahim.belabbas.b@gmail.com"
        },
        "items": [
            {
                "id": "cm8g5auko000oyxy1trva55jo",
                "orderId": "cm8g5aufj000myxy16mxs44gf",
                "quantity": 1,
                "price": 80,
                "watchId": null,
                "customWatchId": "cm8g59al2000ayxy1hyw3o8qm",
                "watch": null
            },
            {
                "id": "cm8g5aups000qyxy17fsh51oj",
                "orderId": "cm8g5aufj000myxy16mxs44gf",
                "quantity": 1,
                "price": 80,
                "watchId": null,
                "customWatchId": "cm8g59xss000gyxy1iscvo383",
                "watch": null
            }
        ]
    }
]
  */

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
  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);

    // Récupérer les détails de chaque montre personnalisée
    const customWatchIds = order.items
      .filter((item) => item.customWatchId)
      .map((item) => item.customWatchId as string);

    for (const customWatchId of customWatchIds) {
      if (!customWatchesDetails[customWatchId]) {
        const details = await fetchCustomWatchDetails(customWatchId);
      }
    }
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

  // Ajouter cette fonction pour récupérer les détails d'une montre personnalisée
  const fetchCustomWatchDetails = async (customWatchId: string) => {
    try {
      const response = await fetch(`/api/custom-watches/${customWatchId}`);
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des détails");
      else {
        const data = await response.json();
        console.log(data, "data");
        setCustomWatchesDetails((prev) => ({
          ...prev,
          [customWatchId]: data,
        }));
      }
    } catch (error) {
      console.error("Erreur:", error);
      return null;
    }
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
      {/* En-tête responsive */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Gestion des commandes</h2>

        {/* Filtres en colonnes sur mobile */}
        <div className="space-y-3">
          <Input
            placeholder="Rechercher par nom de client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
          <Select
            value={selectedStatus || ""}
            onValueChange={(value) => setSelectedStatus(value || null)}
          >
            <SelectTrigger className="w-full">
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
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="h-20" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Vue mobile: Cards */}
          <div className="md:hidden space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="space-y-3">
                    {/* En-tête de la carte */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{order.user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.user.email}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    {/* Détails de la commande */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Articles</p>
                        <p className="font-medium">{order.items.length}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Montant total</p>
                        <p className="font-medium text-lg">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleStatusClick(order)}
                      >
                        Modifier statut
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetails(order)}
                      >
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">
                  Aucune commande trouvée
                </p>
              </Card>
            )}
          </div>

          {/* Vue desktop: Table */}
          <div className="hidden md:block">
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
                          {order.user.name}
                          <div className="text-sm text-muted-foreground">
                            {order.user.email}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                        <TableCell>{order.items.length} articles</TableCell>
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
          </div>
        </div>
      )}

      {/* Pagination responsive */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <div className="flex items-center px-4 text-sm">
            <span className="hidden md:inline">Page </span>
            {page} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Boîte de dialogue de détails optimisée pour mobile */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              Commande #{selectedOrder?.id.slice(-6)}
              {selectedOrder && getStatusBadge(selectedOrder.status)}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Informations client */}
              <Card className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Client</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Nom</p>
                      <p className="font-medium">{selectedOrder.user.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedOrder.user.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {formatDate(selectedOrder.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Articles */}
              <div className="space-y-3">
                <h3 className="font-medium">Articles commandés</h3>
                {selectedOrder.items.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {item.customWatchId
                              ? "Montre personnalisée"
                              : "Montre"}
                            {item.customWatchId && (
                              <Badge variant="outline" className="ml-2">
                                Personnalisée
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Réf: {item.customWatchId || item.watchId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatPrice(item.price)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            × {item.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Composants de la montre personnalisée */}
                      {item.customWatchId &&
                        customWatchesDetails[item.customWatchId] && (
                          <div className="border-t pt-3">
                            <p className="text-sm font-medium mb-2">
                              Composants:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {customWatchesDetails[
                                item.customWatchId
                              ].components.map((component: any) => (
                                <div
                                  key={component.id}
                                  className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                                >
                                  <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                                    {component.component.imageUrl && (
                                      <img
                                        src={component.component.imageUrl}
                                        alt={component.component.name}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      {component.component.type}
                                    </p>
                                    <p className="text-sm font-medium">
                                      {component.component.name}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Prix total de l'article */}
                      <div className="border-t pt-3 flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Total article
                        </span>
                        <span className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Total */}
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold">
                    {formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>
              </Card>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
            <Button
              className="w-full sm:w-auto"
              onClick={() => setIsStatusDialogOpen(true)}
            >
              Modifier le statut
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsDetailsDialogOpen(false)}
            >
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
              Commande de <strong>{selectedOrder?.user.name}</strong> du{" "}
              {selectedOrder && formatDate(selectedOrder.createdAt)}
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
