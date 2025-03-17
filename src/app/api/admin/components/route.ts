import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Récupérer tous les composants
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type");
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
            ],
          }
        : {}),
      ...(type ? { type } : {}),
    };

    // Récupérer les composants
    const components = await db.component.findMany({
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // Compter le nombre total de composants
    const total = await db.component.count();

    // Récupérer les types de composants pour les filtres
    const types = Object.values(db.component.fields.type);

    return NextResponse.json({
      components,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        types,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des composants:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des composants" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau composant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, stock, imageUrl, type } = body;

    // Validation des données
    if (
      !name ||
      !description ||
      !price ||
      stock === undefined ||
      !imageUrl ||
      !type
    ) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }

    // // Vérifier si le type est valide
    // const validTypes = Object.values(db.component.fields.type);
    // if (!validTypes.includes(type)) {
    //   return NextResponse.json(
    //     { error: "Type de composant invalide" },
    //     { status: 400 }
    //   );
    // }

    // Créer le composant
    const component = await db.component.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl,
        type,
      },
    });

    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du composant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du composant" },
      { status: 500 }
    );
  }
}
// PUT - Mettre à jour un composant existant
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, price, stock, imageUrl, type } = body;

    // Vérifier si le composant existe
    const existingComponent = await db.component.findFirst({
      where: { id },
    });

    if (!existingComponent) {
      return NextResponse.json(
        { error: "Composant non trouvé" },
        { status: 404 }
      );
    }

    // // Vérifier si le type est valide
    // const validTypes = Object.values(db.component.fields.type);
    // if (!validTypes.includes(type)) {
    //   return NextResponse.json(
    //     { error: "Type de composant invalide" },
    //     { status: 400 }
    //   );
    // }

    // Mettre à jour le composant
    const updatedComponent = await db.component.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl,
        type,
      },
    });

    return NextResponse.json(updatedComponent);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du composant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du composant" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un composant existant
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    // Vérifier si le composant existe
    const existingComponent = await db.component.findFirst({
      where: { id },
    });

    if (!existingComponent) {
      return NextResponse.json(
        { error: "Composant non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le composant
    await db.component.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Composant supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du composant:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du composant" },
      { status: 500 }
    );
  }
}
