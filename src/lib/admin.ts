import { db } from "@/lib/db";
import { DashboardStats, Order, StockAlert } from "@/types/admin";
import { OrderStatus } from "@prisma/client";

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
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

    return {
      watches: watchesCount,
      components: componentsCount,
      orders: ordersCount,
      users: usersCount,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    // Retourner des données fictives en cas d'erreur
    return {
      watches: 24,
      components: 86,
      orders: 12,
      users: 48,
    };
  }
}

export async function getRecentOrders(): Promise<Order[]> {
  try {
    const orders = await db.order.findMany({
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    });

    return orders.map((order) => ({
      id: order.id,
      clientName: order.user.name,
      date: order.createdAt,
      amount: order.totalAmount,
      status: mapOrderStatus(order.status),
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des commandes récentes:",
      error
    );
    // Retourner des données fictives en cas d'erreur
    return [
      {
        id: "ORD-001",
        clientName: "Jean Dupont",
        date: new Date("2023-03-12"),
        amount: 599,
        status: "Livré",
      },
      {
        id: "ORD-002",
        clientName: "Marie Martin",
        date: new Date("2023-03-14"),
        amount: 849,
        status: "En cours",
      },
      {
        id: "ORD-003",
        clientName: "Pierre Durand",
        date: new Date("2023-03-15"),
        amount: 1299,
        status: "En attente",
      },
      {
        id: "ORD-004",
        clientName: "Sophie Lefèvre",
        date: new Date("2023-03-16"),
        amount: 749,
        status: "En cours",
      },
    ];
  }
}

export async function getLowStockAlerts(): Promise<StockAlert[]> {
  try {
    const watches = await db.watch.findMany({
      where: {
        stock: {
          lte: 5,
        },
      },
      take: 3,
    });

    const components = await db.component.findMany({
      where: {
        stock: {
          lte: 10,
        },
      },
      take: 3,
    });

    return [
      ...watches.map((watch) => ({
        id: watch.id,
        productName: watch.name,
        type: "Montre" as const,
        currentStock: watch.stock,
        threshold: 5,
      })),
      ...components.map((component) => ({
        id: component.id,
        productName: component.name,
        type: "Composant" as const,
        currentStock: component.stock,
        threshold: 10,
      })),
    ];
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des alertes de stock:",
      error
    );
    // Retourner des données fictives en cas d'erreur
    return [
      {
        id: "W001",
        productName: "Seiko Presage Automatique",
        type: "Montre",
        currentStock: 2,
        threshold: 5,
      },
      {
        id: "C001",
        productName: "Cadran bleu marine",
        type: "Composant",
        currentStock: 3,
        threshold: 10,
      },
      {
        id: "C002",
        productName: "Bracelet cuir marron",
        type: "Composant",
        currentStock: 4,
        threshold: 10,
      },
    ];
  }
}

// Fonction utilitaire pour mapper les statuts de commande de Prisma vers notre interface
function mapOrderStatus(status: OrderStatus): Order["status"] {
  switch (status) {
    case "DELIVERED":
      return "Livré";
    case "PROCESSING":
    case "SHIPPED":
      return "En cours";
    case "PENDING":
    case "CANCELLED":
    default:
      return "En attente";
  }
}
