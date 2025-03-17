import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Récupérer toutes les commandes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
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
              { id: { contains: search } },
              { user: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
    };

    // Récupérer les commandes
    const orders = await db.order.findMany({
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
      include: {
        user: true,
        items: {
          include: {
            watch: true,
            customWatch: {
              include: {
                components: true,
              },
            },
          },
        },
      },
    });

    // Compter le nombre total de commandes
    const total = await db.order.count();

    // Récupérer les statuts de commande pour les filtres
    const statuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        clientName: order.user.name,
        date: order.createdAt,
        amount: order.totalAmount,
        status: order.status,
        itemsCount: order.items.length,
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          product: item.watch
            ? {
                id: item.watch.id,
                name: item.watch.name,
                type: "Montre",
                imageUrl: item.watch.imageUrl,
                components: [],
              }
            : item.customWatch
            ? {
                id: item.customWatch.id,
                name: item.customWatch.name,
                type: "Montre personnalisée",
                imageUrl: "/images/custom-watch.jpg",
                components: item.customWatch.components,
              }
            : null,
        })),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        statuses,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour le statut d'une commande
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    // Validation des données
    if (!id || !status) {
      return NextResponse.json(
        { error: "L'ID et le statut sont obligatoires" },
        { status: 400 }
      );
    }

    // Vérifier si la commande existe
    const existingOrder = await db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si le statut est valide
    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Statut de commande invalide" },
        { status: 400 }
      );
    }

    // Mettre à jour la commande
    const order = await db.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la commande" },
      { status: 500 }
    );
  }
}
