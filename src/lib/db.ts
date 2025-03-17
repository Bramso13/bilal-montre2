import { PrismaClient } from "@prisma/client";

// PrismaClient est attaché au global object en développement pour éviter
// d'épuiser la limite de connexions à la base de données.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
