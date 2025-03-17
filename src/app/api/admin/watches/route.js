import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schéma de validation pour la création d'une montre
const watchSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  price: z.number().positive("Le prix doit être positif"),
  stock: z.number().int().nonnegative("Le stock ne peut pas être négatif"),
  imageUrl: z.string().url("L'URL de l'image est invalide"),
  brand: z.string(),
  reference: z.string().min(3, "La référence doit contenir au moins 3 caractères"),
  categoryId: z.string().optional(),
});

// GET - Récupérer toutes les montres avec pagination et recherche
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté et est un admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Seuls les administrateurs peuvent accéder aux montres.",
        },
        { status: 403 }
      );
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Construire la requête de recherche
    const whereClause = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { brand: { contains: search, mode: "insensitive" } },
              { reference: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(categoryId ? { categoryId } : {}),
    };

    // Récupérer les montres
    const watches = await prisma.watch.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        category: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    // Compter le nombre total de montres
    const totalWatches = await prisma.watch.count({
      where: whereClause,
    });

    return NextResponse.json({
      watches,
      pagination: {
        total: totalWatches,
        pages: Math.ceil(totalWatches / limit),
        current: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des montres:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des montres" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle montre
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté et est un admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Seuls les administrateurs peuvent créer des montres.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Valider les données d'entrée
    const result = watchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Données de montre invalides",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    // Vérifier si la référence est unique
    const existingWatch = await prisma.watch.findUnique({
      where: { reference: result.data.reference },
    });

    if (existingWatch) {
      return NextResponse.json(
        { error: "Cette référence est déjà utilisée par une autre montre" },
        { status: 400 }
      );
    }

    // Vérifier si la catégorie existe
    if (result.data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: result.data.categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: "La catégorie spécifiée n'existe pas" },
          { status: 400 }
        );
      }
    }

    // Créer la montre
    const watch = await prisma.watch.create({
      data: result.data,
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      message: "Montre créée avec succès",
      watch,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la montre:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la montre" },
      { status: 500 }
    );
  }
}
