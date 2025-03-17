import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      {/* Hero section */}
      <section className="relative h-[600px] w-full">
        <Image
          src="/images/hero-banner.jpg"
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
              <Button asChild size="lg" className="bg-watchGold hover:bg-watchGold/90 text-white border-none">
                <Link href="/montres">Découvrir la Collection</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-black hover:bg-white/10">
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

      {/* Space Timer Collection */}
      <section className="py-16 bg-watchBlack text-white">
        <div className="container">
          <div className="flex justify-between items-center mb-10">
            <h2 className="chronoswiss-title">Space Timer</h2>
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${i < 3 ? 'bg-watchGold' : 'bg-gray-600'}`}
                />
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Montre 1 */}
            <div className="chronoswiss-product-card">
              <div className="p-4">
                <div className="chronoswiss-limited-tag">Limité à 50 pièces</div>
              </div>
              <div className="relative aspect-square">
                <Image 
                  src="/images/classic-watches.jpg" 
                  alt="Space Timer Black Hole" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-400">CH-9345M-2-CRBK</div>
                <h3 className="text-lg font-medium mt-1">SPACE TIMER BLACK HOLE</h3>
              </div>
            </div>
            
            {/* Montre 2 */}
            <div className="chronoswiss-product-card">
              <div className="p-4">
                <div className="chronoswiss-limited-tag">Limité à 50 pièces</div>
              </div>
              <div className="relative aspect-square">
                <Image 
                  src="/images/luxury-watches.jpg" 
                  alt="Space Timer Jupiter Gold" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-400">CH-9341-2-CUBK</div>
                <h3 className="text-lg font-medium mt-1">SPACE TIMER JUPITER GOLD</h3>
              </div>
            </div>
            
            {/* Montre 3 */}
            <div className="chronoswiss-product-card">
              <div className="p-4">
                <div className="chronoswiss-limited-tag">Limité à 50 pièces</div>
              </div>
              <div className="relative aspect-square">
                <Image 
                  src="/images/sport-watches.jpg" 
                  alt="Space Timer Jupiter" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-400">CH-9343-2-CUBK</div>
                <h3 className="text-lg font-medium mt-1">SPACE TIMER JUPITER</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tourbillon Collection */}
      <section className="py-16 bg-watchBlack text-white">
        <div className="container">
          <div className="flex justify-between items-center mb-10">
            <h2 className="chronoswiss-title">Tourbillon</h2>
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${i < 3 ? 'bg-watchGold' : 'bg-gray-600'}`}
                />
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Montre 1 */}
            <div className="chronoswiss-product-card">
              <div className="p-4">
                <div className="chronoswiss-limited-tag">Limité à 15 pièces</div>
              </div>
              <div className="relative aspect-square">
                <Image 
                  src="/images/luxury-watches.jpg" 
                  alt="Tourbillon Red" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-400">CH-3721R-SI</div>
                <h3 className="text-lg font-medium mt-1">TOURBILLON RED</h3>
              </div>
            </div>
            
            {/* Montre 2 */}
            <div className="chronoswiss-product-card">
              <div className="p-4">
                <div className="chronoswiss-limited-tag">Limité à 15 pièces</div>
              </div>
              <div className="relative aspect-square">
                <Image 
                  src="/images/classic-watches.jpg" 
                  alt="Tourbillon Blue" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-400">CH-3721B-SI</div>
                <h3 className="text-lg font-medium mt-1">TOURBILLON BLUE</h3>
              </div>
            </div>
            
            {/* Montre 3 */}
            <div className="chronoswiss-product-card">
              <div className="p-4">
                <div className="chronoswiss-limited-tag">Limité à 15 pièces</div>
              </div>
              <div className="relative aspect-square">
                <Image 
                  src="/images/sport-watches.jpg" 
                  alt="Tourbillon Black" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-400">CH-3721K-SI</div>
                <h3 className="text-lg font-medium mt-1">TOURBILLON BLACK</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <Button asChild className="mt-6 bg-watchBlack hover:bg-watchBlack/90 text-white" size="lg">
                <Link href="/personnaliser">Commencer la Personnalisation</Link>
              </Button>
            </div>
            <div className="relative h-[400px]">
              <Image
                src="/images/custom-watch.jpg"
                alt="Personnalisation de montre"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
