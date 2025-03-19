import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schéma de validation pour la création d'une montre personnalisée
const customWatchSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),

  components: z.array(z.string()),

});

// POST - Créer une nouvelle montre personnalisée
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour créer une montre personnalisée" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Valider les données d'entrée
    const result = customWatchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Données de montre invalides",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    // Vérifier si les composants existent
    const components = await prisma.component.findMany({
      where: {
        id: {
          in: result.data.components,
        },
      },
    });

    if (components.length !== result.data.components.length) {
      return NextResponse.json(
        { error: "Certains composants n'existent pas" },
        { status: 400 }
      );
    }

    // Calculer le prix total des composants
    const totalPrice = components.reduce((sum, component) => sum + component.price, 0);

    // Créer la montre personnalisée
    const customWatch = await prisma.customWatch.create({
      data: {
        name: result.data.name,
        totalPrice,
        userId: session.user.id,
        components: {
          create: result.data.components.map((componentId) => ({
            component: {
              connect: { id: componentId }
            }
          })),
        },
      },
      include: {
        components: {
          include: {
            component: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Montre personnalisée créée avec succès",
      customWatch,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la montre personnalisée:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la montre personnalisée" },
      { status: 500 }
    );
  }
}

// GET - Récupérer les montres personnalisées de l'utilisateur
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour voir vos montres personnalisées" },
        { status: 401 }
      );
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Récupérer les montres personnalisées
    const customWatches = await prisma.customWatch.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        components: true,
      },
    });

    // Compter le nombre total de montres personnalisées
    const totalCustomWatches = await prisma.customWatch.count({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      customWatches,
      pagination: {
        total: totalCustomWatches,
        pages: Math.ceil(totalCustomWatches / limit),
        current: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des montres personnalisées:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des montres personnalisées" },
      { status: 500 }
    );
  }
}
