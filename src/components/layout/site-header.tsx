"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCartStore } from "@/lib/store/cart-store";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCartStore();

  return (
    <header className="w-full text-white" style={{ background: "black" }}>
      <div className="container mx-auto">
        {/* Top bar avec logo et contrôles */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/">
            <Image
              src="/images/logoBrand.png"
              alt="Logo"
              width={50}
              height={50}
            />
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
                  pathname === "/personnaliser"
                    ? "text-watchGold"
                    : "text-white"
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
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:text-watchGold"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full p-0 border-none bg-watchBlack text-white"
            >
              <div className="flex flex-col h-full">
                {/* Header du menu */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                  <h2 className="text-xl font-semibold text-watchGold">Menu</h2>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-watchGold"
                    >
                      <X className="h-6 w-6" />
                      <span className="sr-only">Fermer</span>
                    </Button>
                  </SheetTrigger>
                </div>

                {/* Corps du menu */}
                <div className="flex-1 overflow-y-auto py-6 px-6">
                  <nav className="space-y-8">
                    {/* Navigation principale */}
                    <div className="space-y-6">
                      <Link
                        href="/montres"
                        className={`block text-2xl font-medium transition-colors hover:text-watchGold ${
                          pathname === "/montres"
                            ? "text-watchGold"
                            : "text-white"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Montres
                      </Link>
                      <Link
                        href="/composants"
                        className={`block text-2xl font-medium transition-colors hover:text-watchGold ${
                          pathname === "/composants"
                            ? "text-watchGold"
                            : "text-white"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Composants
                      </Link>
                      <Link
                        href="/personnaliser"
                        className={`block text-2xl font-medium transition-colors hover:text-watchGold ${
                          pathname === "/personnaliser"
                            ? "text-watchGold"
                            : "text-white"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Personnaliser
                      </Link>
                      <Link
                        href="/garantie"
                        className={`block text-2xl font-medium transition-colors hover:text-watchGold ${
                          pathname === "/garantie"
                            ? "text-watchGold"
                            : "text-white"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Garantie & Service
                      </Link>
                    </div>

                    {/* Liens secondaires */}
                    <div className="space-y-4 text-sm">
                      <Link
                        href="/about"
                        className="block text-gray-400 hover:text-white transition-colors"
                      >
                        À propos
                      </Link>
                      <Link
                        href="/contact"
                        className="block text-gray-400 hover:text-white transition-colors"
                      >
                        Contact
                      </Link>
                    </div>
                  </nav>
                </div>

                {/* Footer du menu */}
                <div className="border-t border-gray-800 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Sélecteur de devise */}
                      <select className="bg-transparent border border-gray-600 rounded px-3 py-2 text-sm focus:border-watchGold focus:outline-none">
                        <option>EUR</option>
                        <option>USD</option>
                      </select>

                      {/* Sélecteur de langue */}
                      <select className="bg-transparent border border-gray-600 rounded px-3 py-2 text-sm focus:border-watchGold focus:outline-none">
                        <option>FR</option>
                        <option>EN</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-6">
                      <Link
                        href="/profile"
                        className="text-white hover:text-watchGold transition-colors"
                      >
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
                          className="h-6 w-6"
                        >
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </Link>

                      <Link
                        href="/cart"
                        className="relative text-white hover:text-watchGold transition-colors"
                      >
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
                          className="h-6 w-6"
                        >
                          <circle cx="8" cy="21" r="1" />
                          <circle cx="19" cy="21" r="1" />
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                        {totalItems > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-watchGold text-xs font-medium text-white">
                            {totalItems}
                          </span>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

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
        </div>
      </div>
    </header>
  );
}
