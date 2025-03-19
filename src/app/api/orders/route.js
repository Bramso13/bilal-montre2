import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schéma de validation pour les articles de commande
const orderItemSchema = z.object({
  watchId: z.string().optional(),
  customWatchId: z.string().optional(),
  quantity: z.number().int().positive("La quantité doit être positive"),
}).refine(data => data.watchId || data.customWatchId, {
  message: "Vous devez spécifier soit watchId, soit customWatchId"
});

// Schéma de validation pour la commande
const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Au moins un article est requis"),
});

// GET - Récupérer les commandes de l'utilisateur connecté
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à vos commandes" },
        { status: 401 }
      );
    }

    // Si l'utilisateur est un admin, il peut voir toutes les commandes
    const where = session.user.role === "ADMIN" ? {} : { userId: session.user.id };

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Récupérer les commandes
    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
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
        orderItems: {
          include: {
            watch: true,
            customWatch: {
              include: {
                components: {
                  include: {
                    component: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Compter le nombre total de commandes
    const totalOrders = await prisma.order.count({ where });

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

// POST - Créer une nouvelle commande
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour créer une commande" },
        { status: 401 }
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

    // Vérifier et traiter chaque article
    let totalAmount = 0;
    const itemsToProcess = [];

    for (const item of result.data.items) {
      if (item.watchId) {
        // Vérifier si la montre existe et est en stock
        const watch = await prisma.watch.findUnique({
          where: { id: item.watchId },
        });

        if (!watch) {
          return NextResponse.json(
            { error: `La montre avec l'ID ${item.watchId} n'existe pas` },
            { status: 400 }
          );
        }

        if (watch.stock < item.quantity) {
          return NextResponse.json(
            { error: `La montre ${watch.name} n'est pas disponible en quantité suffisante` },
            { status: 400 }
          );
        }

        totalAmount += watch.price * item.quantity;
        itemsToProcess.push({
          ...item,
          price: watch.price,
          watch,
        });
      } else if (item.customWatchId) {
        // Vérifier si la montre personnalisée existe et appartient à l'utilisateur
        const customWatch = await prisma.customWatch.findUnique({
          where: {
            id: item.customWatchId,
            userId: session.user.id,
          },
        });

        if (!customWatch) {
          return NextResponse.json(
            { error: `La montre personnalisée avec l'ID ${item.customWatchId} n'existe pas ou ne vous appartient pas` },
            { status: 400 }
          );
        }

        totalAmount += customWatch.totalPrice * item.quantity;
        itemsToProcess.push({
          ...item,
          price: customWatch.totalPrice,
          customWatch,
        });
      }
    }

    // Créer la commande et mettre à jour les stocks dans une transaction
    const order = await prisma.$transaction(async (tx) => {
      // Créer la commande
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          status: "PENDING",
        },
      });

      // Ajouter les articles à la commande
      for (const item of itemsToProcess) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            quantity: item.quantity,
            price: item.price,
            watchId: item.watchId,
            customWatchId: item.customWatchId,
          },
        });

        // Si c'est une montre standard, décrémenter le stock
        if (item.watchId) {
          await tx.watch.update({
            where: { id: item.watchId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return newOrder;
    });

    // Récupérer la commande complète avec ses articles
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            watch: true,
            customWatch: {
              include: {
                components: {
                  include: {
                    component: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Commande créée avec succès",
      order: orderWithItems,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la commande" },
      { status: 500 }
    );
  }
}
