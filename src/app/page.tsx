import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

async function getWatchesWithCategories() {
  const categories = await prisma.category.findMany({
    include: {
      watches: {
        take: 3, // Limite à 3 montres par catégorie
      },
    },
  });
  return categories;
}

export default async function HomePage() {
  const categories = await getWatchesWithCategories();

  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      {/* Hero section */}
      <section className="relative h-[600px] w-full">
        <Image
          src="https://www.seikowatches.com/fr-fr/-/media/Images/GlobalEn/Seiko/Home/TOP/megamenu/megamenu_prospex.jpg?mh=440&mw=776&hash=010F0A382EE00FE699D481EEF33DCB90"
          alt="Montre Seiko élégante"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative h-full">
          <div className="flex h-full flex-col items-center justify-center text-center text-white">
            <h1 className="chronoswiss-title">
              L'Art de l'Horlogerie Japonaise
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-200">
              Découvrez notre collection exclusive de montres Seiko et créez
              votre propre montre personnalisée avec nos composants de haute
              qualité.
            </p>
            <div className="mt-8 flex gap-4">
              <Button
                asChild
                size="lg"
                className="bg-watchGold hover:bg-watchGold/90 text-white border-none"
              >
                <Link href="/montres">Découvrir la Collection</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-black hover:bg-white/10"
              >
                <Link href="/personnaliser">Personnaliser</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filtres de fonctions
      <section className="py-12 bg-watchBlack text-white flex">
        <div className="container">
          <div className="flex flex-row items-center justify-between">
            <div className="mb-6 text-center">
              <h2 className="text-sm uppercase tracking-wider mb-2">Fonctions</h2>
              <div className="flex items-center gap-4">
                <div className="chronoswiss-filter-button gold">
                  <span className="sr-only">Régulateur</span>
                </div>
                <div className="chronoswiss-filter-button silver">
                  <span className="sr-only">Chronographe</span>
                </div>
                <div className="chronoswiss-filter-button black">
                  <span className="sr-only">Automatique</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6 text-center">
              <h2 className="text-sm uppercase tracking-wider mb-2">Tailles</h2>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-xs hover:border-watchGold hover:text-watchGold">34</button>
                <button className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-xs hover:border-watchGold hover:text-watchGold">37</button>
                <button className="w-8 h-8 rounded-full bg-watchGold text-white flex items-center justify-center text-xs">40</button>
                <button className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-xs hover:border-watchGold hover:text-watchGold">41</button>
                <button className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-xs hover:border-watchGold hover:text-watchGold">42</button>
                <button className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-xs hover:border-watchGold hover:text-watchGold">43</button>
                <button className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-xs hover:border-watchGold hover:text-watchGold">44+</button>
                <button className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-xs hover:border-watchGold hover:text-watchGold">45</button>
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-sm uppercase tracking-wider mb-2">Matériaux</h2>
              <div className="flex items-center gap-4">
                <div className="chronoswiss-filter-button gold">
                  <span className="sr-only">Or</span>
                </div>
                <div className="chronoswiss-filter-button silver">
                  <span className="sr-only">Argent</span>
                </div>
                <div className="chronoswiss-filter-button blue">
                  <span className="sr-only">Bleu</span>
                </div>
                <div className="chronoswiss-filter-button black">
                  <span className="sr-only">Noir</span>
                </div>
                <div className="chronoswiss-filter-button brown">
                  <span className="sr-only">Marron</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* {categories.map((category) => (
        <section className="py-16 bg-watchBlack text-white">
          <div className="container">
            <div className="flex justify-between items-center mb-10">
              <h2 className="chronoswiss-title">{category.name}</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {category.watches.map((watch) => (
                <div className="chronoswiss-product-card">
                  <div className="p-4">
                    <div className="chronoswiss-limited-tag">
                      {watch.stock === 0
                        ? "Rupture de stock"
                        : `Plus que ${watch.stock} pièces`}
                    </div>
                  </div>
                  <div className="relative aspect-square">
                    <Image
                      src={watch.imageUrl}
                      alt={watch.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-400">{watch.brand}</div>
                    <h3 className="text-lg font-medium mt-1">{watch.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))} */}

      {/* Section personnalisation */}
      <section className="py-16 bg-gray-100">
        <div className="container">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="chronoswiss-subtitle mb-4">
                Personnalisez Votre Montre
              </h2>
              <p className="text-gray-700">
                Créez une montre unique qui vous ressemble. Choisissez parmi
                notre large sélection de composants et laissez libre cours à
                votre créativité.
              </p>
              <Button
                asChild
                className="mt-6 bg-watchBlack hover:bg-watchBlack/90 text-white"
                size="lg"
              >
                <Link href="/personnaliser">Commencer la Personnalisation</Link>
              </Button>
            </div>
            <div className="relative h-[400px]">
              <Image
                src="https://iflwatches.com/cdn/shop/collections/iflw_custom_seiko_sports_5_GMT_gravity_concept_banner.jpg?v=1728416760"
                alt="Personnalisation de montre"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* New section for categories */}
      <main>
        {categories.map((category) => (
          <section key={category.id} className="py-12">
            <div className="container">
              <div className="flex justify-between items-center mb-10">
                <h2 className="chronoswiss-title">{category.name}</h2>
                <Link
                  href={`/montres?category=${category.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Voir toute la collection →
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {category.watches.map((watch) => (
                  <Link
                    href={`/montres/${watch.id}`}
                    key={watch.id}
                    className="chronoswiss-product-card group"
                  >
                    <div className="p-4">
                      {watch.stock <= 50 && (
                        <div className="chronoswiss-limited-tag">
                          {watch.stock === 0
                            ? "Rupture de stock"
                            : `Plus que ${watch.stock} pièces`}
                        </div>
                      )}
                    </div>
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={watch.imageUrl}
                        alt={watch.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="text-sm text-gray-400">{watch.brand}</div>
                      <h3 className="text-lg font-medium mt-1">{watch.name}</h3>
                      <p className="mt-2 font-medium">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(watch.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
