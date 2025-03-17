import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Récupérer les statistiques
    const watchesCount = await db.watch.count();
    const componentsCount = await db.component.count();
    const ordersCount = await db.order.count({
      where: {
        status: {
          in: ["PENDING", "PROCESSING"],
        },
      },
    });
    const usersCount = await db.user.count();

    // Récupérer les commandes récentes
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        items: true,
      },
    });

    // Récupérer les alertes de stock bas
    const lowStockWatches = await db.watch.findMany({
      where: {
        stock: {
          lte: 5,
        },
      },
      take: 3,
    });

    const lowStockComponents = await db.component.findMany({
      where: {
        stock: {
          lte: 10,
        },
      },
      take: 3,
    });

    // Calculer les revenus mensuels
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const month = i + 1;
        const startDate = new Date(currentYear, i, 1);
        const endDate = new Date(currentYear, i + 1, 0);

        const orders = await db.order.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: {
              in: ["DELIVERED", "SHIPPED", "PROCESSING"],
            },
          },
          select: {
            totalAmount: true,
          },
        });

        const revenue = orders.reduce(
          (sum, order) => sum + order.totalAmount,
          0
        );
        return { month, revenue };
      })
    );

    // Calculer les ventes par catégorie
    const watches = await db.watch.findMany({
      include: {
        orderItems: true,
      },
    });

    const salesByCategory: Record<string, number> = {};
    watches.forEach((watch) => {
      const category = watch.categoryId || "Sans catégorie";
      if (!salesByCategory[category]) {
        salesByCategory[category] = 0;
      }
      salesByCategory[category] += watch.orderItems.length;
    });

    return NextResponse.json({
      stats: {
        watches: watchesCount,
        components: componentsCount,
        orders: ordersCount,
        users: usersCount,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        clientName: order.user.name,
        date: order.createdAt,
        amount: order.totalAmount,
        status: order.status,
        itemsCount: order.items.length,
      })),
      lowStock: [
        ...lowStockWatches.map((watch) => ({
          id: watch.id,
          name: watch.name,
          type: "Montre",
          stock: watch.stock,
          threshold: 5,
        })),
        ...lowStockComponents.map((component) => ({
          id: component.id,
          name: component.name,
          type: "Composant",
          stock: component.stock,
          threshold: 10,
        })),
      ],
      monthlyRevenue,
      salesByCategory,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
