import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";
import { Watch, CustomWatch } from "@prisma/client";

// Schéma de validation pour la création d'une commande
const orderItemSchema = z
  .object({
    watchId: z.string().optional(),
    customWatchId: z.string().optional(),
    quantity: z.number().int().positive("La quantité doit être positive"),
  })
  .refine((data) => data.watchId || data.customWatchId, {
    message: "Vous devez spécifier soit watchId, soit customWatchId",
  });

const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Au moins un article est requis"),
});

// Types pour les articles de commande
interface OrderItemToProcess {
  watchId?: string;
  customWatchId?: string;
  quantity: number;
  price: number;
  watch?: Watch;
  customWatch?: CustomWatch;
}

// GET - Récupérer toutes les commandes de l'utilisateur connecté
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Vous devez être connecté pour accéder à vos commandes.",
        },
        { status: 401 }
      );
    }

    // Si l'utilisateur est un admin, il peut voir toutes les commandes
    const where =
      session.user.role === "ADMIN" ? {} : { userId: session.user.id };

    const orders = await prisma.order.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la récupération des commandes",
      },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle commande
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté
    if (!session) {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Vous devez être connecté pour créer une commande.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

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

    const { items } = result.data;

    // Vérifier la disponibilité des articles et calculer le prix total
    let totalAmount = 0;
    const itemsToProcess: OrderItemToProcess[] = [];

    for (const item of items) {
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
            {
              error: `La montre ${watch.name} n'est pas disponible en quantité suffisante`,
            },
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
            {
              error: `La montre personnalisée avec l'ID ${item.customWatchId} n'existe pas ou ne vous appartient pas`,
            },
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

    // Créer la commande avec ses articles
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

    // Récupérer la commande avec ses articles
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

    return NextResponse.json(
      { message: "Commande créée avec succès", order: orderWithItems },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la commande" },
      { status: 500 }
    );
  }
}
