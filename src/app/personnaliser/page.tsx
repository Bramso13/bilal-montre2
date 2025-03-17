"use client";

import { useState, useEffect, useRef } from "react";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Menu, Check, ArrowRight, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";

import { useCartStore } from "@/lib/store/cart-store";

export interface Component {
  id: string;
  name: string;
  type: "DIAL" | "HANDS" | "CASE" | "BEZEL" | "STRAP";
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

const componentTypeLabels = {
  DIAL: "Cadran",
  HANDS: "Aiguilles",
  CASE: "Boîtier",
  BEZEL: "Lunette",
  STRAP: "Bracelet",
  
};

export default function CustomizePage() {
  const router = useRouter();
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<
    Record<string, Component>
  >({});
  const [customWatchName, setCustomWatchName] = useState(
    "Ma Montre Personnalisée"
  );
  const [savingWatch, setSavingWatch] = useState(false);
  const [activeType, setActiveType] = useState<string>("CASE");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [customWatchId, setCustomWatchId] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await fetch("/api/components");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des composants");
        }
        const data = await response.json();
        setComponents(data);
      } catch (err) {
        setError("Une erreur est survenue lors du chargement des composants");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, []);

  const handleSelectComponent = (component: Component) => {
    console.log(component);
    setSelectedComponents((prev) => ({
      ...prev,
      [component.type]: component,
    }));
  };

  const calculateTotalPrice = () => {
    return Object.values(selectedComponents).reduce(
      (total, component) => total + component.price,
      0
    );
  };

  const getCustomWatchProduct = () => {
    return {
      id: customWatchId || "temp-id",
      type: "custom-watch" as const,
      name: customWatchName,
      price: calculateTotalPrice(),
      imageUrl: selectedComponents["CASE"]?.imageUrl || "",
      reference: `CUSTOM-${Date.now()}`
    };
  };

  const handleSaveCustomWatch = async () => {
    if (Object.keys(selectedComponents).length === 0) {
      toast.error("Veuillez sélectionner au moins un composant");
      return;
    }

    setSavingWatch(true);

    try {
      const response = await fetch("/api/custom-watches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: customWatchName,
          components: Object.values(selectedComponents).map((c) => c.id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            "Erreur lors de la création de la montre personnalisée"
        );
      }

      const data = await response.json();
      setCustomWatchId(data.id);

      toast.success("Montre personnalisée créée avec succès", {
        description:
          "Votre montre a été ajoutée à votre collection personnelle",
      });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la création de la montre personnalisée"
      );
    } finally {
      setSavingWatch(false);
    }
  };

  const handleAddToCart = async () => {
    if (!customWatchId) {
      // Si la montre n'a pas encore été créée, la créer d'abord
      await handleSaveCustomWatch();
      return;
    }

    setAddingToCart(true);
    try {
      // Ajouter la montre au panier
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          watchId: customWatchId,
          type: "custom-watch"
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout au panier");
      }

      toast.success("Montre ajoutée au panier avec succès");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de l'ajout au panier"
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // Grouper les composants par type
  const componentsByType = components.reduce<Record<string, Component[]>>(
    (acc, component) => {
      if (!acc[component.type]) {
        acc[component.type] = [];
      }
      acc[component.type].push(component);
      return acc;
    },
    {}
  );

  // Détecter si l'appareil est mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Réinitialiser l'index du composant actuel lorsque le type actif change
  useEffect(() => {
    setCurrentComponentIndex(0);
  }, [activeType]);

  // Fonctions pour la navigation entre les composants
  const goToNextComponent = () => {
    if (componentsByType[activeType]) {
      setCurrentComponentIndex((prevIndex) => 
        prevIndex === componentsByType[activeType].length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const goToPrevComponent = () => {
    if (componentsByType[activeType]) {
      setCurrentComponentIndex((prevIndex) => 
        prevIndex === 0 ? componentsByType[activeType].length - 1 : prevIndex - 1
      );
    }
  };

  // Configuration du gestionnaire de swipe
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNextComponent(),
    onSwipedRight: () => goToPrevComponent(),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  // Sélectionner automatiquement le composant actuel lors du swipe
  useEffect(() => {
    if (componentsByType[activeType] && componentsByType[activeType].length > 0) {
      const currentComponent = componentsByType[activeType][currentComponentIndex];
      if (currentComponent && currentComponent.stock > 0) {
        handleSelectComponent(currentComponent);
      }
    }
  }, [currentComponentIndex, activeType]);

  // Créer un composant wrapper pour gérer l'enregistrement et l'ajout au panier
  const CustomAddToCartButton = () => {
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSaveAndAddToCart = async () => {
      try {
        // Vérifier que tous les composants requis sont sélectionnés
        const requiredComponents = ["STRAP", "DIAL", "HANDS", "CASE"];
        const missingComponents = requiredComponents.filter(
          (type) => !selectedComponents[type]
        );

        if (missingComponents.length > 0) {
          const missingNames = missingComponents.map(
            (type) => componentTypeLabels[type as keyof typeof componentTypeLabels]
          );
          toast.error(
            `Veuillez sélectionner tous les composants requis: ${missingNames.join(", ")}`
          );
          return null;
        }
        
        setIsSaving(true);
        
        // 1. Enregistrer la montre personnalisée
        const response = await fetch("/api/custom-watches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: customWatchName,
            components: Object.values(selectedComponents).map((c) => c.id),
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              "Erreur lors de la création de la montre personnalisée"
          );
        }
        
        const data = await response.json();
        setCustomWatchId(data.id);
        
        toast.success("Montre personnalisée créée avec succès");
        
        // 2. Retourner le produit avec l'ID comme référence pour l'ajout au panier
        return {
          id: data.id,
          type: "custom-watch" as const,
          name: customWatchName,
          price: calculateTotalPrice(),
          imageUrl: selectedComponents["CASE"]?.imageUrl || "",
          reference: data.id, // Utiliser l'ID comme référence
          components: Object.values(selectedComponents),
        };
        
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de la création de la montre personnalisée"
        );
        return null;
      } finally {
        setIsSaving(false);
      }
    };
    
    return (
      <Button 
        className="w-full bg-black hover:bg-black/90 text-white h-12"
        disabled={isSaving}
        onClick={async () => {
          const product = await handleSaveAndAddToCart();
          if (product) {
            // Utiliser le hook useCartStore pour ajouter au panier
            const { addItem } = useCartStore.getState();
            addItem(product);
            toast.success("Montre ajoutée au panier avec succès");
          }
        }}
      >
        {isSaving ? (
          "Enregistrement..."
        ) : (
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Ajouter au panier
          </span>
        )}
      </Button>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero section */}
      <div className="bg-white border-b">
        <div className="container py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Configurateur de Montre
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            Créez une montre unique qui vous ressemble en personnalisant chaque composant
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container py-8 md:py-12">
        <div className="grid md:grid-cols-12 gap-8 lg:gap-12">
          {/* Preview Column */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-xl text-center">Aperçu</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="bg-white p-6">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                      <div ref={previewRef} className="relative w-3/4 h-3/4">
                        {/* Affichage empilé des composants sélectionnés */}
                        <div className="absolute inset-0 rounded-full overflow-hidden ">
                          {/* Boîtier */}
                          {selectedComponents["CASE"] && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center">
                              {selectedComponents["CASE"].imageUrl ? (
                                <Image
                                  src={selectedComponents["CASE"].imageUrl}
                                  alt={selectedComponents["CASE"].name}

                                  width={200}
                                  height={200}
                                />
                              ) : (
                                <div className="w-full h-full bg-gold rounded-full"></div>
                              )}
                            </div>
                          )}
                          
                          {/* Cadran */}
                          {selectedComponents["DIAL"] && (
                            <div className="absolute inset-[10%] z-20 rounded-full overflow-hidden flex items-center justify-center">
                              {selectedComponents["DIAL"].imageUrl ? (
                                <Image
                                  src={selectedComponents["DIAL"].imageUrl}
                                  alt={selectedComponents["DIAL"].name}
                                  className="object-center"
                                  width={70}
                                  height={70}
                                />
                              ) : (
                                <div className="w-full h-full bg-navy flex items-center justify-center">
                                  <div className="text-white font-serif text-xl">Seiko</div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Lunette */}
                          {selectedComponents["BEZEL"] && (
                            <div className="absolute inset-0 z-30">
                              {selectedComponents["BEZEL"].imageUrl ? (
                                <Image
                                  src={selectedComponents["BEZEL"].imageUrl}
                                  alt={selectedComponents["BEZEL"].name}

                                  width={200}
                                  height={200}
                                />
                              ) : (
                                <div className="absolute inset-0 border-8 border-gold rounded-full pointer-events-none"></div>
                              )}
                            </div>
                          )}
                          
                          {/* Aiguilles */}
                          {selectedComponents["HANDS"] && (
                            <div className="absolute inset-0 z-40 flex items-center justify-center">
                              {selectedComponents["HANDS"].imageUrl ? (
                                <Image
                                  src={selectedComponents["HANDS"].imageUrl}
                                  alt={selectedComponents["HANDS"].name}
                                  className="object-center transform -translate-y-[10px]"
                                  width={50}
                                  height={50}
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
                          {selectedComponents["STRAP"] && (
                            <div className="absolute">
                              {selectedComponents["STRAP"].imageUrl ? (
                                <>
                                  <div className="flex items-center justify-center">
                                    <Image
                                      src={selectedComponents["STRAP"].imageUrl}
                                      alt={selectedComponents["STRAP"].name}
                                      className="object-center transform -translate-y-[-10px] -translate-x-[-10px]"
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
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-xl text-center">Détails</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="watch-name" className="text-sm font-medium">
                      Nom de votre montre:
                    </label>
                    <Input
                      id="watch-name"
                      value={customWatchName}
                      onChange={(e) => setCustomWatchName(e.target.value)}
                      placeholder="Donnez un nom à votre montre"
                      className="border-gray-300"
                    />
                  </div>
                  
                  {Object.keys(selectedComponents).length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm text-muted-foreground">Composants sélectionnés</h3>
                      <ul className="space-y-3 divide-y">
                        {Object.entries(selectedComponents).map(
                          ([type, component]) => (
                            <li
                              key={type}
                              className="flex justify-between items-center pt-3 first:pt-0"
                            >
                              <div>
                                <span className="text-muted-foreground text-sm">
                                  {
                                    componentTypeLabels[
                                      type as keyof typeof componentTypeLabels
                                    ]
                                  }
                                </span>
                                <p className="font-medium">{component.name}</p>
                              </div>
                              <span className="text-sm font-medium">
                                {component.price.toLocaleString("fr-FR")} €
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Aucun composant sélectionné
                    </p>
                  )}
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Prix total:</span>
                      <span>
                        {calculateTotalPrice().toLocaleString("fr-FR")} €
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex flex-col gap-3">
                  {Object.keys(selectedComponents).length > 0 ? (
                    <CustomAddToCartButton />
                  ) : (
                    <Button 
                      className="w-full bg-black/50 text-white h-12 cursor-not-allowed" 
                      disabled
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Sélectionnez des composants
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 h-10"
                    onClick={() => router.push("/montres")}
                  >
                    Voir les montres prêtes à porter
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Customization Options */}
          <div className="md:col-span-7 lg:col-span-8">
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gray-50 border-b px-6">
                <CardTitle className="text-xl">Personnalisation</CardTitle>
              </CardHeader>
              
              {/* Interface desktop */}
              <div className="hidden md:block">
                <Tabs defaultValue="CASE" className="w-full">
                  <div className="px-6 pt-6">
                    <TabsList className="grid grid-cols-7 bg-gray-100 p-1">
                      {Object.entries(componentTypeLabels).map(([type, label]) => (
                        <TabsTrigger 
                          key={type} 
                          value={type}
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                          {label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="p-6">
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                          <Card key={index} className="border shadow">
                            <div className="aspect-square">
                              <Skeleton className="h-full w-full" />
                            </div>
                            <CardHeader>
                              <Skeleton className="h-6 w-3/4 mb-2" />
                              <Skeleton className="h-4 w-full" />
                            </CardHeader>
                            <CardFooter>
                              <Skeleton className="h-10 w-full" />
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      Object.entries(componentTypeLabels).map(([type, label]) => (
                        <TabsContent key={type} value={type} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                          <h3 className="text-xl font-medium mb-6">
                            Choisissez votre {label.toLowerCase()}
                          </h3>
                          {componentsByType[type] &&
                          componentsByType[type].length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {componentsByType[type].map((component, index) => (
                                <Card
                                  key={component.id}
                                  className={`overflow-hidden cursor-pointer transition-all border hover:shadow-md ${
                                    selectedComponents[type]?.id === component.id
                                      ? "ring-2 ring-black"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    if (component.stock > 0) {
                                      handleSelectComponent(component);
                                    }
                                  }}
                                >
                                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                    {component.imageUrl ? (
                                      <Image
                                        src={component.imageUrl}
                                        alt={component.name}
                                        className="object-cover w-full h-full"
                                        width={200}
                                        height={200}
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                        <div className="text-2xl font-serif text-gray-500">
                                          {label}
                                        </div>
                                      </div>
                                    )}
                                    {component.stock <= 0 && (
                                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-white font-medium px-3 py-1 bg-destructive rounded-md">
                                          Rupture de stock
                                        </span>
                                      </div>
                                    )}
                                    {selectedComponents[type]?.id === component.id && (
                                      <div className="absolute top-2 right-2 bg-black text-white rounded-full p-1">
                                        <Check className="h-4 w-4" />
                                      </div>
                                    )}
                                  </div>
                                  <CardHeader className="p-4">
                                    <CardTitle className="text-base">
                                      {component.name}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                      {component.description}
                                    </p>
                                  </CardHeader>
                                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                                    <span className="font-bold">
                                      {component.price.toLocaleString("fr-FR")} €
                                    </span>
                                    <Button
                                      variant={
                                        selectedComponents[type]?.id === component.id
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      disabled={component.stock <= 0}
                                      className={
                                        selectedComponents[type]?.id === component.id
                                          ? "bg-black hover:bg-black/90 text-white"
                                          : "border-gray-300"
                                      }
                                    >
                                      {selectedComponents[type]?.id === component.id
                                        ? "Sélectionné"
                                        : "Sélectionner"}
                                    </Button>
                                  </CardFooter>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                              <h4 className="text-lg font-medium mb-2">
                                Aucun {label.toLowerCase()} disponible
                              </h4>
                              <p className="text-muted-foreground">
                                Nous n'avons pas de {label.toLowerCase()} en stock
                                actuellement.
                              </p>
                            </div>
                          )}
                        </TabsContent>
                      ))
                    )}
                  </div>
                </Tabs>
              </div>

              {/* Interface mobile avec swipe */}
              <div className="block md:hidden p-6">
                {/* Menu de sélection du type de composant */}
                <div className="relative mb-6">
                  <Button 
                    variant="outline" 
                    className="w-full flex justify-between items-center border-gray-300"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <span>{componentTypeLabels[activeType as keyof typeof componentTypeLabels]}</span>
                    <Menu className="h-4 w-4" />
                  </Button>
                  
                  {mobileMenuOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md border overflow-hidden">
                      <div className="p-1">
                        {Object.entries(componentTypeLabels).map(([type, label]) => (
                          <Button
                            key={type}
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={() => {
                              setActiveType(type);
                              setMobileMenuOpen(false);
                            }}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {loading ? (
                  <Card className="border shadow">
                    <div className="aspect-square">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ) : (
                  <div className="relative">
                    {componentsByType[activeType] && componentsByType[activeType].length > 0 ? (
                      <div {...swipeHandlers} className="touch-pan-y">
                        <AnimatePresence initial={false}>
                          <motion.div
                            key={currentComponentIndex}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="overflow-hidden border">
                              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                {componentsByType[activeType][currentComponentIndex].imageUrl ? (
                                  <Image
                                    src={componentsByType[activeType][currentComponentIndex].imageUrl}
                                    alt={componentsByType[activeType][currentComponentIndex].name}
                                    className="object-cover w-full h-full"
                                    width={200}
                                    height={200}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                    <div className="text-2xl font-serif text-gray-500">
                                      {componentTypeLabels[activeType as keyof typeof componentTypeLabels]}
                                    </div>
                                  </div>
                                )}
                                {componentsByType[activeType][currentComponentIndex].stock <= 0 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="text-white font-medium px-3 py-1 bg-destructive rounded-md">
                                      Rupture de stock
                                    </span>
                                  </div>
                                )}
                                
                                {/* Navigation buttons */}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 text-black hover:bg-white/90"
                                  onClick={goToPrevComponent}
                                >
                                  <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 text-black hover:bg-white/90"
                                  onClick={goToNextComponent}
                                >
                                  <ChevronRight className="h-6 w-6" />
                                </Button>
                              </div>
                              <CardHeader className="p-4">
                                <CardTitle className="text-lg">
                                  {componentsByType[activeType][currentComponentIndex].name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {componentsByType[activeType][currentComponentIndex].description}
                                </p>
                              </CardHeader>
                              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                                <span className="font-bold">
                                  {componentsByType[activeType][currentComponentIndex].price.toLocaleString("fr-FR")} €
                                </span>
                                <div className="text-sm text-muted-foreground">
                                  {currentComponentIndex + 1} / {componentsByType[activeType].length}
                                </div>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <h4 className="text-lg font-medium mb-2">
                          Aucun {componentTypeLabels[activeType as keyof typeof componentTypeLabels].toLowerCase()} disponible
                        </h4>
                        <p className="text-muted-foreground">
                          Nous n'avons pas de {componentTypeLabels[activeType as keyof typeof componentTypeLabels].toLowerCase()} en stock
                          actuellement.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
            
            {/* Avantages section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <h3 className="font-medium text-sm">Garantie 2 ans</h3>
                <p className="text-xs text-muted-foreground mt-1">Sur tous nos produits</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <h3 className="font-medium text-sm">Livraison gratuite</h3>
                <p className="text-xs text-muted-foreground mt-1">En France métropolitaine</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <h3 className="font-medium text-sm">Satisfait ou remboursé</h3>
                <p className="text-xs text-muted-foreground mt-1">30 jours pour changer d'avis</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <h3 className="font-medium text-sm">Paiement sécurisé</h3>
                <p className="text-xs text-muted-foreground mt-1">Transactions 100% sécurisées</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
