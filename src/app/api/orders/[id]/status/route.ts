import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { z } from "zod";

// Schéma de validation pour la mise à jour du statut d'une commande
const updateOrderStatusSchema = z.object({
  status: z.enum(
    ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
    {
      errorMap: () => ({ message: "Statut de commande invalide" }),
    }
  ),
});

// PATCH - Mettre à jour le statut d'une commande (admin seulement)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté et est un admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Seuls les administrateurs peuvent modifier le statut des commandes.",
        },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();

    // Valider les données d'entrée
    const result = updateOrderStatusSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Données de statut invalides",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    const { status } = result.data;

    // Vérifier si la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Si la commande est annulée, remettre les articles en stock
    if (status === "CANCELLED" && existingOrder.status !== "CANCELLED") {
      await prisma.$transaction(async (tx) => {
        // Mettre à jour le statut de la commande
        await tx.order.update({
          where: { id },
          data: { status },
        });

        // Récupérer les articles de la commande
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: id },
          include: {
            watch: true,
          },
        });

        // Remettre les montres en stock
        for (const item of orderItems) {
          if (item.watchId) {
            await tx.watch.update({
              where: { id: item.watchId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }
      });

      return NextResponse.json({
        message: "Commande annulée et stock remis à jour avec succès",
      });
    }

    // Sinon, mettre simplement à jour le statut
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      message: "Statut de la commande mis à jour avec succès",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du statut de la commande:",
      error
    );
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la mise à jour du statut de la commande",
      },
      { status: 500 }
    );
  }
}
