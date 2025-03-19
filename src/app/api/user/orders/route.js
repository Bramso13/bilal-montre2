import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Récupérer les commandes de l'utilisateur connecté
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour voir vos commandes" },
        { status: 401 }
      );
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Récupérer les commandes
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
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

    // Compter le nombre total de commandes
    const totalOrders = await prisma.order.count({
      where: {
        userId: session.user.id,
      },
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
