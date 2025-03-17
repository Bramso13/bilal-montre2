import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";

// Schéma de validation pour la création/mise à jour d'une montre
const watchSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  price: z.number().positive("Le prix doit être positif"),
  stock: z.number().int().nonnegative("Le stock ne peut pas être négatif"),
  imageUrl: z.string().url("L'URL de l'image est invalide"),
  brand: z.string().default("Seiko"),
  reference: z
    .string()
    .min(3, "La référence doit contenir au moins 3 caractères"),
});

// GET - Récupérer toutes les montres
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = url.searchParams.get("limit")
      ? parseInt(url.searchParams.get("limit")!)
      : undefined;

    const watches = await prisma.watch.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      watches.map((watch) => ({
        ...watch,
        type: "watch",
      }))
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des montres:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des montres" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle montre (admin seulement)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté et est un admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Seuls les administrateurs peuvent créer des montres.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Valider les données d'entrée
    const result = watchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Données de montre invalides",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    // Vérifier si la référence existe déjà
    const existingWatch = await prisma.watch.findUnique({
      where: { reference: result.data.reference },
    });

    if (existingWatch) {
      return NextResponse.json(
        { error: "Cette référence de montre existe déjà" },
        { status: 400 }
      );
    }

    // Créer la montre
    const watch = await prisma.watch.create({
      data: result.data,
    });

    return NextResponse.json(
      { message: "Montre créée avec succès", watch },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de la montre:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la montre" },
      { status: 500 }
    );
  }
}
