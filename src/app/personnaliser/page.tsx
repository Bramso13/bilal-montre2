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
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Check,
  ArrowRight,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { Progress } from "@/components/ui/progress";

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

  // New state variables for step-by-step interface
  const [currentStep, setCurrentStep] = useState(0);
  const componentTypes = Object.keys(componentTypeLabels);
  const totalSteps = componentTypes.length + 1; // +1 for the final summary step

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await fetch("/api/components");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des composants");
        }
        const data = await response.json();
        setComponents(data);

        // Initialiser les composants sélectionnés avec les premiers de chaque type
        const initialComponents: Record<string, Component> = {};
        data.forEach((component: Component) => {
          if (!initialComponents[component.type] && component.stock > 0) {
            initialComponents[component.type] = component;
          }
        });
        setSelectedComponents(initialComponents);
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
      reference: `CUSTOM-${Date.now()}`,
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
          type: "custom-watch",
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

  // Set active type based on current step for mobile step interface
  useEffect(() => {
    if (currentStep < componentTypes.length) {
      setActiveType(componentTypes[currentStep]);
    }
  }, [currentStep, componentTypes]);

  // Fonctions pour la navigation entre les composants
  const goToNextComponent = () => {
    if (componentsByType[activeType]) {
      setCurrentComponentIndex((prevIndex) =>
        prevIndex === componentsByType[activeType].length - 1
          ? 0
          : prevIndex + 1
      );
    }
  };

  const goToPrevComponent = () => {
    if (componentsByType[activeType]) {
      setCurrentComponentIndex((prevIndex) =>
        prevIndex === 0
          ? componentsByType[activeType].length - 1
          : prevIndex - 1
      );
    }
  };

  // Step navigation functions
  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Configuration du gestionnaire de swipe
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNextComponent(),
    onSwipedRight: () => goToPrevComponent(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // Sélectionner automatiquement le composant actuel lors du swipe
  useEffect(() => {
    if (
      componentsByType[activeType] &&
      componentsByType[activeType].length > 0
    ) {
      const currentComponent =
        componentsByType[activeType][currentComponentIndex];
      if (currentComponent && currentComponent.stock > 0) {
        handleSelectComponent(currentComponent);
      }
    }
  }, [currentComponentIndex, activeType]);
  const handleSaveAndAddToCart = async () => {
    try {
      // Vérifier que tous les composants requis sont sélectionnés
      const requiredComponents = ["STRAP", "DIAL", "HANDS", "CASE"];
      const missingComponents = requiredComponents.filter(
        (type) => !selectedComponents[type]
      );

      if (missingComponents.length > 0) {
        const missingNames = missingComponents.map(
          (type) =>
            componentTypeLabels[type as keyof typeof componentTypeLabels]
        );
        toast.error(
          `Veuillez sélectionner tous les composants requis: ${missingNames.join(
            ", "
          )}`
        );
        return null;
      }

      // Créer la montre personnalisée
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
      setCustomWatchId(data.customWatch.id);

      toast.success("Montre personnalisée créée avec succès");

      // Retourner le produit pour l'ajout au panier
      return {
        id: data.customWatch.id,
        type: "custom-watch" as const,
        name: customWatchName,
        price: calculateTotalPrice(),
        imageUrl: selectedComponents["CASE"]?.imageUrl || "",
        reference: data.customWatch.id,
        components: Object.values(selectedComponents),
      };
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la création de la montre personnalisée"
      );
      return null;
    }
  };
  // Créer un composant wrapper pour gérer l'enregistrement et l'ajout au panier
  const CustomAddToCartButton = () => {
    const [isSaving, setIsSaving] = useState(false);

    return (
      <Button
        className="w-full bg-black hover:bg-black/90 text-white h-12"
        disabled={isSaving}
        onClick={async () => {
          const product = await handleSaveAndAddToCart();
          if (product) {
            const { addItem } = useCartStore.getState();
            addItem(product);
            toast.success("Montre ajoutée au panier avec succès");
            setIsSaving(false);
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
            Créez une montre unique qui vous ressemble en personnalisant chaque
            composant
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container py-8 md:py-12">
        <div className="grid md:grid-cols-12 gap-8 lg:gap-12">
          {!isMobile && (
            <div className="md:col-span-5 lg:col-span-4">
              <div className="sticky top-8 space-y-6">
                <Card className="overflow-hidden border-0 shadow-lg">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-xl text-center">
                      Aperçu
                    </CardTitle>
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
                                    <div className="text-white font-serif text-xl">
                                      Seiko
                                    </div>
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
                                        src={
                                          selectedComponents["STRAP"].imageUrl
                                        }
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
                    <CardTitle className="text-xl text-center">
                      Détails
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="watch-name"
                        className="text-sm font-medium"
                      >
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
                        <h3 className="font-medium text-sm text-muted-foreground">
                          Composants sélectionnés
                        </h3>
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
                                  <p className="font-medium">
                                    {component.name}
                                  </p>
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
          )}

          {/* Customization Options */}
          <div className="md:col-span-7 lg:col-span-8">
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gray-50 border-b px-6">
                <CardTitle className="text-xl">Personnalisation</CardTitle>
              </CardHeader>

              {/* Interface desktop */}
              <div className={`${isMobile ? "hidden" : "block"}`}>
                <Tabs defaultValue="CASE" className="w-full">
                  <div className="px-6 pt-6">
                    <TabsList className="grid grid-cols-7 bg-gray-100 p-1">
                      {Object.entries(componentTypeLabels).map(
                        ([type, label]) => (
                          <TabsTrigger
                            key={type}
                            value={type}
                            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                          >
                            {label}
                          </TabsTrigger>
                        )
                      )}
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
                      Object.entries(componentTypeLabels).map(
                        ([type, label]) => (
                          <TabsContent
                            key={type}
                            value={type}
                            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                          >
                            <h3 className="text-xl font-medium mb-6">
                              Choisissez votre {label.toLowerCase()}
                            </h3>
                            {componentsByType[type] &&
                            componentsByType[type].length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {componentsByType[type].map(
                                  (component, index) => (
                                    <Card
                                      key={component.id}
                                      className={`overflow-hidden cursor-pointer transition-all border hover:shadow-md ${
                                        selectedComponents[type]?.id ===
                                        component.id
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
                                        {selectedComponents[type]?.id ===
                                          component.id && (
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
                                          {component.price.toLocaleString(
                                            "fr-FR"
                                          )}{" "}
                                          €
                                        </span>
                                        <Button
                                          variant={
                                            selectedComponents[type]?.id ===
                                            component.id
                                              ? "default"
                                              : "outline"
                                          }
                                          size="sm"
                                          disabled={component.stock <= 0}
                                          className={
                                            selectedComponents[type]?.id ===
                                            component.id
                                              ? "bg-black hover:bg-black/90 text-white"
                                              : "border-gray-300"
                                          }
                                        >
                                          {selectedComponents[type]?.id ===
                                          component.id
                                            ? "Sélectionné"
                                            : "Sélectionner"}
                                        </Button>
                                      </CardFooter>
                                    </Card>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <h4 className="text-lg font-medium mb-2">
                                  Aucun {label.toLowerCase()} disponible
                                </h4>
                                <p className="text-muted-foreground">
                                  Nous n'avons pas de {label.toLowerCase()} en
                                  stock actuellement.
                                </p>
                              </div>
                            )}
                          </TabsContent>
                        )
                      )
                    )}
                  </div>
                </Tabs>
              </div>

              {/* Interface mobile avec aperçu interactif */}
              <div className={`${isMobile ? "block" : "hidden"}`}>
                {/* Progress bar */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex justify-between mb-2 text-xs">
                    <span>
                      Étape {currentStep + 1} sur {totalSteps}
                    </span>
                    <span>
                      {Math.round(((currentStep + 1) / totalSteps) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={((currentStep + 1) / totalSteps) * 100}
                    className="h-2"
                  />
                </div>

                {/* Aperçu interactif */}
                <div className="relative h-[70vh] bg-gray-100">
                  {/* Aperçu de la montre */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-3/4 h-3/4">
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        {/* Boîtier */}
                        {selectedComponents["CASE"] && (
                          <motion.div
                            className="absolute inset-0 z-10 flex items-center justify-center"
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Image
                              src={selectedComponents["CASE"].imageUrl}
                              alt={selectedComponents["CASE"].name}
                              width={300}
                              height={300}
                              className="object-contain"
                            />
                          </motion.div>
                        )}

                        {/* Cadran */}
                        {selectedComponents["DIAL"] && (
                          <motion.div
                            className="absolute inset-[10%] z-20 flex items-center justify-center"
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Image
                              src={selectedComponents["DIAL"].imageUrl}
                              alt={selectedComponents["DIAL"].name}
                              width={80}
                              height={80}
                              className="object-contain"
                            />
                          </motion.div>
                        )}

                        {/* Aiguilles */}
                        {selectedComponents["HANDS"] && (
                          <motion.div
                            className="absolute inset-0 z-30 flex items-center justify-center"
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Image
                              src={selectedComponents["HANDS"].imageUrl}
                              alt={selectedComponents["HANDS"].name}
                              width={50}
                              height={50}
                              className="object-contain transform -translate-y-[10px]"
                            />
                          </motion.div>
                        )}

                        {/* Bracelet */}
                        {selectedComponents["STRAP"] && (
                          <motion.div
                            className="absolute inset-0 z-5 flex items-center justify-center"
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Image
                              src={selectedComponents["STRAP"].imageUrl}
                              alt={selectedComponents["STRAP"].name}
                              width={300}
                              height={300}
                              className="object-contain"
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Boutons de navigation */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/80 text-black hover:bg-white shadow-lg"
                    onClick={() => {
                      goToPrevComponent();
                      if (componentsByType[activeType]) {
                        const prevIndex =
                          currentComponentIndex === 0
                            ? componentsByType[activeType].length - 1
                            : currentComponentIndex - 1;
                        handleSelectComponent(
                          componentsByType[activeType][prevIndex]
                        );
                      }
                    }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/80 text-black hover:bg-white shadow-lg"
                    onClick={() => {
                      goToNextComponent();
                      if (componentsByType[activeType]) {
                        const nextIndex =
                          currentComponentIndex ===
                          componentsByType[activeType].length - 1
                            ? 0
                            : currentComponentIndex + 1;
                        handleSelectComponent(
                          componentsByType[activeType][nextIndex]
                        );
                      }
                    }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>

                  {/* Info du composant actuel */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white p-4 rounded-t-2xl shadow-lg">
                    {componentsByType[activeType] &&
                      componentsByType[activeType][currentComponentIndex] && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">
                              {
                                componentsByType[activeType][
                                  currentComponentIndex
                                ].name
                              }
                            </h3>
                            <span className="font-bold">
                              {componentsByType[activeType][
                                currentComponentIndex
                              ].price.toLocaleString("fr-FR")}{" "}
                              €
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {
                              componentsByType[activeType][
                                currentComponentIndex
                              ].description
                            }
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Navigation entre étapes */}
                <div className="p-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={goToPrevStep}
                    disabled={currentStep === 0}
                    className="border-gray-300"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </Button>

                  {currentStep === totalSteps - 1 ? (
                    // Bouton d'ajout au panier à la dernière étape
                    <Button
                      onClick={async () => {
                        const product = await handleSaveAndAddToCart();
                        if (product) {
                          const { addItem } = useCartStore.getState();
                          addItem(product);
                          toast.success("Montre ajoutée au panier avec succès");
                          router.push("/cart");
                        }
                      }}
                      className="bg-black hover:bg-black/90 text-white flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Ajouter au panier
                    </Button>
                  ) : (
                    // Bouton suivant pour les autres étapes
                    <Button
                      onClick={goToNextStep}
                      className="bg-black hover:bg-black/90 text-white"
                    >
                      Suivant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Avantages section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <h3 className="font-medium text-sm">Garantie 2 ans</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Sur tous nos produits
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <h3 className="font-medium text-sm">Livraison gratuite</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  En France métropolitaine
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <h3 className="font-medium text-sm">Satisfait ou remboursé</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  30 jours pour changer d'avis
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <h3 className="font-medium text-sm">Paiement sécurisé</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Transactions 100% sécurisées
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
