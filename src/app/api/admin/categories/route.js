import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Schéma de validation pour la création d'une catégorie
const categorySchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  slug: z.string().min(2, "Le slug doit contenir au moins 2 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  imageUrl: z.string().url("L'URL de l'image est invalide").optional(),
});

// GET - Récupérer toutes les catégories avec pagination et recherche
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier l'authentification et les droits d'administrateur
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Construire la requête de recherche
    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    // Récupérer les catégories avec le nombre de montres associées
    const categories = await db.category.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
      skip,
      take: limit,
      include: {
        _count: {
          select: { watches: true },
        },
      },
    });

    // Compter le nombre total de catégories pour la pagination
    const totalCategories = await db.category.count({
      where: whereClause,
    });

    return NextResponse.json({
      categories,
      pagination: {
        total: totalCategories,
        pages: Math.ceil(totalCategories / limit),
        current: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier l'authentification et les droits d'administrateur
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();

    // Valider les données d'entrée
    const result = categorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Données de catégorie invalides",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    // Vérifier si le slug est déjà utilisé
    const existingCategory = await db.category.findUnique({
      where: { slug: result.data.slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé par une autre catégorie" },
        { status: 400 }
      );
    }

    // Créer la catégorie
    const category = await db.category.create({
      data: result.data,
    });

    return NextResponse.json({
      message: "Catégorie créée avec succès",
      category,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}
