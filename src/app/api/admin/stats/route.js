import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Récupérer les statistiques (admin seulement)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté et est un admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Seuls les administrateurs peuvent accéder aux statistiques.",
        },
        { status: 403 }
      );
    }

    // Récupérer les statistiques
    const [
      totalUsers,
      totalOrders,
      totalWatches,
      totalComponents,
      recentOrders,
      topWatches,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.watch.count(),
      prisma.component.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.watch.findMany({
        take: 5,
        orderBy: {
          orderItems: {
            _count: "desc",
          },
        },
        include: {
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      }),
    ]);

    // Calculer le revenu total
    const revenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    return NextResponse.json({
      stats: {
        users: totalUsers,
        orders: totalOrders,
        watches: totalWatches,
        components: totalComponents,
        revenue: revenue._sum.totalPrice || 0,
      },
      recentOrders,
      topWatches,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
