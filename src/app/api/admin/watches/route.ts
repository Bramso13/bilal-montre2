import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Récupérer toutes les montres
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Construire la requête
    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { reference: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(categoryId ? { categoryId } : {}),
    };

    // Récupérer les montres
    const watches = await db.watch.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
      include: {
        category: true,
      },
    });

    // Compter le nombre total de montres
    const total = await db.watch.count({ where });

    // Récupérer les catégories pour les filtres
    const categories = await db.category.findMany();

    return NextResponse.json({
      watches,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        categories,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des montres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des montres" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle montre
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, stock, imageUrl, reference, categoryId } =
      body;

    // Validation des données
    if (
      !name ||
      !description ||
      !price ||
      stock === undefined ||
      !imageUrl ||
      !reference
    ) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }

    // Vérifier si la référence existe déjà
    const existingWatch = await db.watch.findUnique({
      where: { reference },
    });

    if (existingWatch) {
      return NextResponse.json(
        { error: "Une montre avec cette référence existe déjà" },
        { status: 400 }
      );
    }

    // Créer la montre
    const watch = await db.watch.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl,
        reference,
        category: { connect: { id: categoryId } },
      },
    });

    return NextResponse.json(watch, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la montre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la montre" },
      { status: 500 }
    );
  }
}
