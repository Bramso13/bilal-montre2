import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schéma de validation pour la création d'une commande
const orderSchema = z.object({
  userId: z.string(),
  items: z.array(
    z.object({
      watchId: z.string(),
      quantity: z.number().int().positive("La quantité doit être positive"),
    })
  ),
});

// GET - Récupérer toutes les commandes (admin seulement)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté et est un admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Seuls les administrateurs peuvent accéder aux commandes.",
        },
        { status: 403 }
      );
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Construire la requête de recherche
    const whereClause = {
      ...(search
        ? {
            OR: [
              {
                user: {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
              { orderNumber: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
    };

    // Récupérer les commandes
    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            watch: true,
          },
        },
      },
    });

    // Compter le nombre total de commandes
    const totalOrders = await prisma.order.count({
      where: whereClause,
    });

    return NextResponse.json({
      orders,
      pagination: {
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit),
        current: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des commandes" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle commande (admin seulement)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté et est un admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Seuls les administrateurs peuvent créer des commandes.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Valider les données d'entrée
    const result = orderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Données de commande invalides",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: result.data.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier le stock des montres
    const watches = await prisma.watch.findMany({
      where: {
        id: {
          in: result.data.items.map((item) => item.watchId),
        },
      },
    });

    if (watches.length !== result.data.items.length) {
      return NextResponse.json(
        { error: "Certaines montres n'existent pas" },
        { status: 400 }
      );
    }

    const outOfStockWatches = result.data.items.filter((item) => {
      const watch = watches.find((w) => w.id === item.watchId);
      return watch && watch.stock < item.quantity;
    });

    if (outOfStockWatches.length > 0) {
      return NextResponse.json(
        { error: "Certaines montres ne sont pas en stock" },
        { status: 400 }
      );
    }

    // Calculer le prix total
    const totalPrice = result.data.items.reduce((sum, item) => {
      const watch = watches.find((w) => w.id === item.watchId);
      return sum + watch.price * item.quantity;
    }, 0);

    // Créer la commande et mettre à jour les stocks
    const order = await prisma.$transaction(async (tx) => {
      // Créer la commande
      const newOrder = await tx.order.create({
        data: {
          userId: result.data.userId,
          totalPrice,
          orderItems: {
            create: result.data.items.map((item) => ({
              watchId: item.watchId,
              quantity: item.quantity,
              price: watches.find((w) => w.id === item.watchId).price,
            })),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              watch: true,
            },
          },
        },
      });

      // Mettre à jour les stocks
      for (const item of result.data.items) {
        await tx.watch.update({
          where: { id: item.watchId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      message: "Commande créée avec succès",
      order,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la commande" },
      { status: 500 }
    );
  }
}
