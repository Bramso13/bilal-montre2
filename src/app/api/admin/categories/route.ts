import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Récupérer toutes les catégories avec pagination et recherche
export async function GET(request: Request) {
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

    // Formater les données pour la réponse
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      watchesCount: category._count.watches,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    return NextResponse.json({
      categories: formattedCategories,
      pagination: {
        total: totalCategories,
        page,
        limit,
        totalPages: Math.ceil(totalCategories / limit),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier l'authentification et les droits d'administrateur
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les données de la requête
    const body = await request.json();
    const { name, slug, description } = body;

    // Validation des données
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Le nom et le slug sont obligatoires" },
        { status: 400 }
      );
    }

    // Vérifier si le slug est déjà utilisé
    const existingCategory = await db.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé" },
        { status: 400 }
      );
    }

    // Créer la catégorie
    const category = await db.category.create({
      data: {
        name,
        slug,
        description: description || "",
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}
