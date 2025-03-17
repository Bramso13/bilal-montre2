import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schéma de validation pour les composants
const componentSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  price: z.number().positive("Le prix doit être positif"),
  stock: z.number().int().min(0, "Le stock ne peut pas être négatif"),
  imageUrl: z.string().url("L'URL de l'image est invalide"),
  type: z.enum(["BOITIER", "CADRAN", "BRACELET", "MOUVEMENT"]),
});

// GET - Récupérer tous les composants
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est un admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent accéder aux composants" },
        { status: 403 }
      );
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type");
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
            ],
          }
        : {}),
      ...(type ? { type } : {}),
    };

    // Récupérer les composants
    const components = await prisma.component.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Compter le nombre total de composants
    const totalComponents = await prisma.component.count({
      where: whereClause,
    });

    return NextResponse.json({
      components,
      pagination: {
        total: totalComponents,
        pages: Math.ceil(totalComponents / limit),
        current: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des composants:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des composants" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau composant
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est un admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent créer des composants" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Valider les données d'entrée
    const result = componentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Données de composant invalides",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    // Créer le composant
    const component = await prisma.component.create({
      data: result.data,
    });

    return NextResponse.json({
      message: "Composant créé avec succès",
      component,
    });
  } catch (error) {
    console.error("Erreur lors de la création du composant:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du composant" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un composant
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est un admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent modifier des composants" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    // Vérifier si le composant existe
    const existingComponent = await prisma.component.findUnique({
      where: { id },
    });

    if (!existingComponent) {
      return NextResponse.json(
        { error: "Composant non trouvé" },
        { status: 404 }
      );
    }

    // Valider les données d'entrée
    const result = componentSchema.safeParse(updateData);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Données de composant invalides",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    // Mettre à jour le composant
    const updatedComponent = await prisma.component.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({
      message: "Composant mis à jour avec succès",
      component: updatedComponent,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du composant:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du composant" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un composant
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est un admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent supprimer des composants" },
        { status: 403 }
      );
    }

    const { id } = await request.json();

    // Vérifier si le composant existe
    const existingComponent = await prisma.component.findUnique({
      where: { id },
    });

    if (!existingComponent) {
      return NextResponse.json(
        { error: "Composant non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le composant
    await prisma.component.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Composant supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du composant:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression du composant" },
      { status: 500 }
    );
  }
}
