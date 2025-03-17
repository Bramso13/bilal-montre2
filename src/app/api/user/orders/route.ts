import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les commandes de l'utilisateur
    const orders = await db.order.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            watch: true,
            customWatch: true,
          },
        },
      },
    });

    // Formater les commandes pour la réponse
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      date: order.createdAt,
      status: order.status,
      totalAmount: order.totalAmount,
      items: order.items.map((item) => {
        const watchData = item.watch || item.customWatch;
        return {
          id: item.id,
          name: watchData?.name || "Montre personnalisée",
          quantity: item.quantity,
          price: item.price,
          isCustom: !!item.customWatch,
        };
      }),
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
}
