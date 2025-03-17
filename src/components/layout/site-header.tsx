"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCartStore } from "@/lib/store/cart-store";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCartStore();

  return (
    <header className="w-full text-white" style={{background: 'linear-gradient(315deg, #003366 0%, #242124 74%)'}}>
      <div className="container mx-auto">
        {/* Top bar avec logo et contrôles */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="font-serif text-2xl font-bold">
            Seiko Élégance
          </Link>

          {/* Navigation principale */}
        <nav className="hidden md:flex items-center justify-center border-t border-gray-800 py-3">
          <div className="flex items-center gap-8">
            <Link
              href="/montres"
              className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-watchGold ${
                pathname === "/montres" ? "text-watchGold" : "text-white"
              }`}
            >
              Montres
            </Link>
            <Link
              href="/personnaliser"
              className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-watchGold ${
                pathname === "/personnaliser" ? "text-watchGold" : "text-white"
              }`}
            >
              Personnaliser
            </Link>
            <Link
              href="/garantie"
              className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-watchGold ${
                pathname === "/garantie" ? "text-watchGold" : "text-white"
              }`}
            >
              Garantie & Service
            </Link>
            
          </div>
        </nav>
        
        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-watchBlack border-t border-gray-800 py-4 px-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/montres"
                className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-watchGold ${
                  pathname === "/montres" ? "text-watchGold" : "text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Montres
              </Link>
              <Link
                href="/composants"
                className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-watchGold ${
                  pathname === "/composants" ? "text-watchGold" : "text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Composants
              </Link>
              <Link
                href="/personnaliser"
                className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-watchGold ${
                  pathname === "/personnaliser" ? "text-watchGold" : "text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Personnaliser
              </Link>
              <Link
                href="/garantie"
                className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-watchGold ${
                  pathname === "/garantie" ? "text-watchGold" : "text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Garantie & Service
              </Link>
              
              
              <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Sélecteur de devise */}
                  <div className="relative">
                    <select className="appearance-none bg-transparent border border-gray-600 rounded px-2 py-1 text-sm">
                      <option>EUR</option>
                      <option>USD</option>
                    </select>
                  </div>
                  
                  {/* Sélecteur de langue */}
                  <div className="relative">
                    <select className="appearance-none bg-transparent border border-gray-600 rounded px-2 py-1 text-sm">
                      <option>FR</option>
                      <option>EN</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Icône compte */}
                  <Link href="/profile">
                    <span className="sr-only">Compte</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </Link>
                  
                  {/* Icône panier */}
                  <Link href="/cart" className="relative">
                    <span className="sr-only">Panier</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-watchGold text-[10px] font-medium text-white">
                      {totalItems}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
          
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-4">
              {/* Icône compte */}
              <Link href="/profile">
                <span className="sr-only">Compte</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
              
              {/* Icône panier */}
              <Link href="/cart" className="relative">
                <span className="sr-only">Panier</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-watchGold text-[10px] font-medium text-white">
                  0
                </span>
              </Link>
            </div>
          </div>
          
          {/* Menu burger mobile */}
          <Button 
            variant="outline" 
            size="icon" 
            className="md:hidden border-gray-600 text-white hover:bg-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
            <span className="sr-only">Menu</span>
          </Button>
        </div>
        
        
      </div>
    </header>
  );
}
