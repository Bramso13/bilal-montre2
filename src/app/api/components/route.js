import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

import { z } from "zod";
import { authOptions } from "@/lib/auth";

// Schéma de validation pour la création/mise à jour d'un composant
const componentSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  type: z.enum(["CASE", "DIAL", "HANDS", "STRAP", "MOVEMENT", "CRYSTAL", "CROWN", "OTHER"]),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  price: z.number().positive("Le prix doit être positif"),
  stock: z.number().int().nonnegative("Le stock ne peut pas être négatif"),
  imageUrl: z.string().url("L'URL de l'image est invalide"),
});

// GET - Récupérer tous les composants ou filtrer par type
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const limit = url.searchParams.get("limit")
      ? parseInt(url.searchParams.get("limit"))
      : undefined;

    const components = await prisma.component.findMany({
      where: type ? { type: type } : undefined,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(components);
  } catch (error) {
    console.error("Erreur lors de la récupération des composants:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la récupération des composants",
      },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau composant (admin seulement)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté et est un admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Seuls les administrateurs peuvent créer des composants.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    console.log(body, "body");
    // Valider les données d'entrée
    const result = componentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Données de composant invalides",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    // Créer le composant
    const component = await prisma.component.create({
      data: {
        ...result.data,
        type: result.data.type,
      },
    });

    return NextResponse.json(
      { message: "Composant créé avec succès", component },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création du composant:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du composant" },
      { status: 500 }
    );
  }
}
