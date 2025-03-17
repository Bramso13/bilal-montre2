"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="mr-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Bilal Montre</span>
          </Link>
        </div>
        <nav className="flex-1 flex items-center justify-between">
          <div className="flex gap-6 text-sm">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/")
                  ? "text-foreground font-medium"
                  : "text-foreground/60"
              }`}
            >
              Accueil
            </Link>
            <Link
              href="/montres"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/montres")
                  ? "text-foreground font-medium"
                  : "text-foreground/60"
              }`}
            >
              Montres
            </Link>
            <Link
              href="/personnalisation"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/personnalisation")
                  ? "text-foreground font-medium"
                  : "text-foreground/60"
              }`}
            >
              Personnalisation
            </Link>
            <Link
              href="/a-propos"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/a-propos")
                  ? "text-foreground font-medium"
                  : "text-foreground/60"
              }`}
            >
              À propos
            </Link>
            <Link
              href="/contact"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/contact")
                  ? "text-foreground font-medium"
                  : "text-foreground/60"
              }`}
            >
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <CartDrawer />

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user?.name && (
                        <p className="font-medium">{session.user.name}</p>
                      )}
                      {session.user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon profil</span>
                    </Link>
                  </DropdownMenuItem>
                  {session.user?.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Administration</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" onClick={() => signIn()}>
                Connexion
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
