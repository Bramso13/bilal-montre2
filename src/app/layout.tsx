import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";

import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/layout/site-header";
import { SessionProvider } from "next-auth/react";
import Providers from "@/providers/provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Seiko Élégance - Montres Personnalisées",
  description:
    "Découvrez notre collection de montres Seiko personnalisables. Créez votre montre unique avec nos composants exclusifs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <Providers>
          <SiteHeader />
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
