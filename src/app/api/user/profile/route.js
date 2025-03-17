import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schéma de validation pour la mise à jour du profil
const updateProfileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
  email: z.string().email("Email invalide").optional(),
});

// GET - Récupérer le profil de l'utilisateur connecté
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à votre profil" },
        { status: 401 }
      );
    }

    // Récupérer le profil de l'utilisateur avec ses statistiques
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            customWatches: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour le profil de l'utilisateur connecté
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour modifier votre profil" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Valider les données d'entrée
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Données de profil invalides",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    // Vérifier si l'email est unique
    if (result.data.email && result.data.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: result.data.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé par un autre utilisateur" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le profil
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: result.data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Profil mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
