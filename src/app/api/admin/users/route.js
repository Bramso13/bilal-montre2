import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schéma de validation pour la mise à jour d'un utilisateur
const updateUserSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
  email: z.string().email("Email invalide").optional(),
  role: z.enum(["USER", "ADMIN"], {
    errorMap: () => ({ message: "Rôle invalide" }),
  }).optional(),
});

// GET - Récupérer tous les utilisateurs (admin seulement)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté et est un admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Seuls les administrateurs peuvent accéder aux utilisateurs.",
        },
        { status: 403 }
      );
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Construire la requête de recherche
    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    // Récupérer les utilisateurs
    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    // Compter le nombre total d'utilisateurs
    const totalUsers = await prisma.user.count({
      where: whereClause,
    });

    return NextResponse.json({
      users,
      pagination: {
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
        current: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un utilisateur (admin seulement)
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté et est un admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Seuls les administrateurs peuvent modifier les utilisateurs.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "L'ID de l'utilisateur est requis" },
        { status: 400 }
      );
    }

    // Valider les données d'entrée
    const result = updateUserSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Données d'utilisateur invalides",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si l'email est unique
    if (result.data.email && result.data.email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email: result.data.email },
      });

      if (userWithEmail) {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé par un autre utilisateur" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
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
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de l'utilisateur" },
      { status: 500 }
    );
  }
}
