"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Order {
  id: string;
  date: string;
  status: string;
  totalAmount: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Charger les données de l'utilisateur
  useEffect(() => {
    if (session?.user) {
      setFormData({
        ...formData,
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  // Charger les commandes de l'utilisateur
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/orders");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des commandes");
      }
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setUpdateSuccess(false);

    // Validation
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "Le nom est obligatoire";
    if (!formData.email) errors.email = "L'email est obligatoire";
    if (!formData.email.includes("@")) errors.email = "L'email est invalide";

    // Validation du mot de passe uniquement si l'utilisateur essaie de le changer
    if (
      formData.currentPassword ||
      formData.newPassword ||
      formData.confirmPassword
    ) {
      if (!formData.currentPassword)
        errors.currentPassword = "Le mot de passe actuel est obligatoire";
      if (!formData.newPassword)
        errors.newPassword = "Le nouveau mot de passe est obligatoire";
      if (formData.newPassword.length < 6)
        errors.newPassword =
          "Le mot de passe doit contenir au moins 6 caractères";
      if (!formData.confirmPassword)
        errors.confirmPassword =
          "La confirmation du mot de passe est obligatoire";
      if (formData.newPassword !== formData.confirmPassword)
        errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          ...(formData.currentPassword && {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || "Erreur lors de la mise à jour du profil"
        );
      }

      // Réinitialiser les champs de mot de passe
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setUpdateSuccess(true);
    } catch (error) {
      console.error("Erreur:", error);
      if (error instanceof Error) {
        if (error.message.includes("mot de passe")) {
          setFormErrors({ currentPassword: error.message });
        } else {
          setFormErrors({ general: error.message });
        }
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy à HH:mm", { locale: fr });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "En attente";
      case "PROCESSING":
        return "En traitement";
      case "SHIPPED":
        return "Expédiée";
      case "DELIVERED":
        return "Livrée";
      case "CANCELLED":
        return "Annulée";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "PROCESSING":
        return "bg-blue-500";
      case "SHIPPED":
        return "bg-purple-500";
      case "DELIVERED":
        return "bg-green-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <Card className="w-fit">
            <CardHeader>
              <div className="flex flex-col items-center">
                <CardTitle>{session?.user?.name}</CardTitle>
                <CardDescription>{session?.user?.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="w-screen ">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="orders">Commandes</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informations personnelles</CardTitle>
                      <CardDescription>
                        Mettez à jour vos informations personnelles et votre mot
                        de passe
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleProfileUpdate}>
                        {formErrors.general && (
                          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md">
                            {formErrors.general}
                          </div>
                        )}
                        {updateSuccess && (
                          <div className="mb-4 p-3 bg-green-100 text-green-600 rounded-md">
                            Votre profil a été mis à jour avec succès.
                          </div>
                        )}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nom</Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                            />
                            {formErrors.name && (
                              <p className="text-sm text-red-500">
                                {formErrors.name}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                            />
                            {formErrors.email && (
                              <p className="text-sm text-red-500">
                                {formErrors.email}
                              </p>
                            )}
                          </div>

                          <Separator className="my-6" />

                          <div className="space-y-2">
                            <h3 className="text-lg font-medium">
                              Changer de mot de passe
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Laissez ces champs vides si vous ne souhaitez pas
                              changer votre mot de passe
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">
                              Mot de passe actuel
                            </Label>
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type="password"
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                            />
                            {formErrors.currentPassword && (
                              <p className="text-sm text-red-500">
                                {formErrors.currentPassword}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">
                              Nouveau mot de passe
                            </Label>
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                            />
                            {formErrors.newPassword && (
                              <p className="text-sm text-red-500">
                                {formErrors.newPassword}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                              Confirmer le mot de passe
                            </Label>
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                            />
                            {formErrors.confirmPassword && (
                              <p className="text-sm text-red-500">
                                {formErrors.confirmPassword}
                              </p>
                            )}
                          </div>
                        </div>
                        <CardFooter className="flex justify-end px-0 pt-6">
                          <Button type="submit">
                            Enregistrer les modifications
                          </Button>
                        </CardFooter>
                      </form>
                    </CardContent>
                  </Card>
                  <div className="mt-6">
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      Déconnexion
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="orders">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mes commandes</CardTitle>
                      <CardDescription>
                        Historique de vos commandes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-center py-10">Chargement...</div>
                      ) : orders.length > 0 ? (
                        <div className="space-y-6">
                          {orders.map((order) => (
                            <div
                              key={order.id}
                              className="border rounded-lg overflow-hidden"
                            >
                              <div className="bg-gray-100 dark:bg-gray-800 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                <div>
                                  <p className="font-medium">
                                    Commande #{order.id.substring(0, 8)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(order.date)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(
                                      order.status
                                    )}`}
                                  >
                                    {getStatusLabel(order.status)}
                                  </span>
                                  <span className="font-medium">
                                    {formatPrice(order.totalAmount)}
                                  </span>
                                </div>
                              </div>
                              <div className="p-4">
                                <h4 className="font-medium mb-2">Articles</h4>
                                <div className="space-y-2">
                                  {order.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex justify-between items-center"
                                    >
                                      <div>
                                        <p>{item.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                          Quantité: {item.quantity}
                                        </p>
                                      </div>
                                      <p className="font-medium">
                                        {formatPrice(
                                          item.price * item.quantity
                                        )}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-muted-foreground">
                            Vous n'avez pas encore passé de commande.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
