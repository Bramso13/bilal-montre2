import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schéma de validation pour la mise à jour du statut d'une commande
const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"], {
    errorMap: () => ({ message: "Statut de commande invalide" }),
  }),
});

// PATCH - Mettre à jour le statut d'une commande (admin seulement)
export async function PATCH(req, { params }) {
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

    // Vérifier si la commande existe
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour le statut de la commande
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: result.data.status,
      },
    });

    return NextResponse.json({
      message: "Statut de la commande mis à jour avec succès",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de la commande:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du statut de la commande" },
      { status: 500 }
    );
  }
}
