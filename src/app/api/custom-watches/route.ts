import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";

// Schéma de validation pour la création d'une montre personnalisée
const customWatchSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  components: z.array(z.string()).min(1, "Au moins un composant est requis"),
});

// GET - Récupérer toutes les montres personnalisées de l'utilisateur connecté
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Vous devez être connecté pour accéder à vos montres personnalisées.",
        },
        { status: 401 }
      );
    }

    const customWatches = await prisma.customWatch.findMany({
      where: { userId: session.user.id },
      include: {
        components: {
          include: {
            component: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(customWatches);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des montres personnalisées:",
      error
    );
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la récupération des montres personnalisées",
      },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle montre personnalisée
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Vous devez être connecté pour créer une montre personnalisée.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Valider les données d'entrée
    const result = customWatchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Données de montre personnalisée invalides",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    const { name, components: componentIds } = result.data;

    // Vérifier que tous les composants existent
    const components = await prisma.component.findMany({
      where: {
        id: {
          in: componentIds,
        },
      },
    });

    if (components.length !== componentIds.length) {
      return NextResponse.json(
        { error: "Certains composants n'existent pas" },
        { status: 400 }
      );
    }

    // Vérifier que tous les composants sont en stock
    const outOfStockComponents = components.filter(
      (component) => component.stock <= 0
    );
    if (outOfStockComponents.length > 0) {
      return NextResponse.json(
        {
          error: "Certains composants ne sont pas en stock",
          components: outOfStockComponents.map((c) => c.name),
        },
        { status: 400 }
      );
    }

    // Calculer le prix total
    const totalPrice = components.reduce(
      (sum, component) => sum + component.price,
      0
    );

    // Créer la montre personnalisée avec ses composants
    const customWatch = await prisma.$transaction(async (tx) => {
      // Créer la montre personnalisée
      const watch = await tx.customWatch.create({
        data: {
          name,
          totalPrice,
          userId: session.user.id,
        },
      });

      // Ajouter les composants à la montre
      for (const componentId of componentIds) {
        await tx.customWatchComponent.create({
          data: {
            customWatchId: watch.id,
            componentId,
          },
        });

        // Décrémenter le stock du composant
        await tx.component.update({
          where: { id: componentId },
          data: {
            stock: {
              decrement: 1,
            },
          },
        });
      }

      return watch;
    });

    // Récupérer la montre personnalisée avec ses composants
    const customWatchWithComponents = await prisma.customWatch.findUnique({
      where: { id: customWatch.id },
      include: {
        components: {
          include: {
            component: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Montre personnalisée créée avec succès",
        customWatch: customWatchWithComponents,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Erreur lors de la création de la montre personnalisée:",
      error
    );
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la création de la montre personnalisée",
      },
      { status: 500 }
    );
  }
}
