
import NextAuth from "next-auth/next";

import { authOptions } from "@/lib/auth";

// Étendre les types de NextAuth
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}


const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
