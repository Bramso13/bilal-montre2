import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;
  const isAdminUser = token?.role === "ADMIN";
  const { pathname } = request.nextUrl;

  // Routes protégées qui nécessitent une authentification
  const authRoutes = ["/profile", "/commandes", "/panier"];
  // Routes d'administration qui nécessitent un rôle d'administrateur
  const adminRoutes = ["/admin"];
  // Routes publiques accessibles uniquement aux utilisateurs non authentifiés
  const publicOnlyRoutes = ["/connexion", "/inscription"];

  // Rediriger les utilisateurs non authentifiés vers la page de connexion
  if (
    authRoutes.some((route) => pathname.startsWith(route)) &&
    !isAuthenticated
  ) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Rediriger les utilisateurs non administrateurs loin des pages d'administration
  if (adminRoutes.some((route) => pathname.startsWith(route)) && !isAdminUser) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Rediriger les utilisateurs authentifiés loin des pages de connexion/inscription
  if (
    publicOnlyRoutes.some((route) => pathname.startsWith(route)) &&
    isAuthenticated
  ) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
    "/connexion",
    "/inscription",
    "/commandes/:path*",
    "/panier",
  ],
};
