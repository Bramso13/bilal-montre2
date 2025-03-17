import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { z } from "zod";

// Schéma de validation pour la mise à jour d'une montre
const updateWatchSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .optional(),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .optional(),
  price: z.number().positive("Le prix doit être positif").optional(),
  stock: z
    .number()
    .int()
    .nonnegative("Le stock ne peut pas être négatif")
    .optional(),
  imageUrl: z.string().url("L'URL de l'image est invalide").optional(),
  brand: z.string().optional(),
  reference: z
    .string()
    .min(3, "La référence doit contenir au moins 3 caractères")
    .optional(),
});

// GET - Récupérer une montre spécifique
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const watch = await prisma.watch.findUnique({
      where: { id },
    });

    if (!watch) {
      return NextResponse.json(
        { error: "Montre non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(watch);
  } catch (error) {
    console.error("Erreur lors de la récupération de la montre:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de la montre" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une montre (admin seulement)
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
            "Non autorisé. Seuls les administrateurs peuvent modifier des montres.",
        },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();

    // Valider les données d'entrée
    const result = updateWatchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Données de montre invalides",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    // Vérifier si la montre existe
    const existingWatch = await prisma.watch.findUnique({
      where: { id },
    });

    if (!existingWatch) {
      return NextResponse.json(
        { error: "Montre non trouvée" },
        { status: 404 }
      );
    }

    // Si la référence est modifiée, vérifier qu'elle n'existe pas déjà
    if (
      result.data.reference &&
      result.data.reference !== existingWatch.reference
    ) {
      const watchWithSameReference = await prisma.watch.findUnique({
        where: { reference: result.data.reference },
      });

      if (watchWithSameReference) {
        return NextResponse.json(
          { error: "Cette référence de montre existe déjà" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour la montre
    const updatedWatch = await prisma.watch.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({
      message: "Montre mise à jour avec succès",
      watch: updatedWatch,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la montre:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de la montre" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une montre (admin seulement)
export async function DELETE(
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
            "Non autorisé. Seuls les administrateurs peuvent supprimer des montres.",
        },
        { status: 403 }
      );
    }

    const { id } = params;

    // Vérifier si la montre existe
    const existingWatch = await prisma.watch.findUnique({
      where: { id },
    });

    if (!existingWatch) {
      return NextResponse.json(
        { error: "Montre non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la montre
    await prisma.watch.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Montre supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la montre:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression de la montre" },
      { status: 500 }
    );
  }
}
