import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { z } from "zod";

// Schéma de validation pour la mise à jour d'un composant
const updateComponentSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .optional(),
  type: z
    .enum(["DIAL", "HANDS", "CASE", "BEZEL", "BRACELET", "MOVEMENT", "OTHER"], {
      errorMap: () => ({ message: "Type de composant invalide" }),
    })
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
});

// GET - Récupérer un composant spécifique
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const component = await prisma.component.findUnique({
      where: { id },
    });

    if (!component) {
      return NextResponse.json(
        { error: "Composant non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(component);
  } catch (error) {
    console.error("Erreur lors de la récupération du composant:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération du composant" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un composant (admin seulement)
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
            "Non autorisé. Seuls les administrateurs peuvent modifier des composants.",
        },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();

    // Valider les données d'entrée
    const result = updateComponentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Données de composant invalides",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    // Vérifier si le composant existe
    const existingComponent = await prisma.component.findUnique({
      where: { id },
    });

    if (!existingComponent) {
      return NextResponse.json(
        { error: "Composant non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le composant
    const updatedComponent = await prisma.component.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({
      message: "Composant mis à jour avec succès",
      component: updatedComponent,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du composant:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du composant" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un composant (admin seulement)
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
            "Non autorisé. Seuls les administrateurs peuvent supprimer des composants.",
        },
        { status: 403 }
      );
    }

    const { id } = params;

    // Vérifier si le composant existe
    const existingComponent = await prisma.component.findUnique({
      where: { id },
    });

    if (!existingComponent) {
      return NextResponse.json(
        { error: "Composant non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si le composant est utilisé dans des montres personnalisées
    const usedInCustomWatches = await prisma.customWatchComponent.findFirst({
      where: { componentId: id },
    });

    if (usedInCustomWatches) {
      return NextResponse.json(
        {
          error:
            "Ce composant est utilisé dans des montres personnalisées et ne peut pas être supprimé",
        },
        { status: 400 }
      );
    }

    // Supprimer le composant
    await prisma.component.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Composant supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du composant:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression du composant" },
      { status: 500 }
    );
  }
}
