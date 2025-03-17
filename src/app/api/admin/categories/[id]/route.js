import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Récupérer une catégorie spécifique
export async function GET(
  request,
  { params }
) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier l'authentification et les droits d'administrateur
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const id = params.id;

    // Récupérer la catégorie avec le nombre de montres associées
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { watches: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Formater les données pour la réponse
    const formattedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      watchesCount: category._count.watches,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    return NextResponse.json(formattedCategory);
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la catégorie" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une catégorie
export async function PUT(
  request ,
  { params }
) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier l'authentification et les droits d'administrateur
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const id = params.id;
    const body = await request.json();
    const { name, slug, description } = body;

    // Validation des données
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Le nom et le slug sont obligatoires" },
        { status: 400 }
      );
    }

    // Vérifier si la catégorie existe
    const existingCategory = await db.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si le slug est déjà utilisé par une autre catégorie
    if (slug !== existingCategory.slug) {
      const slugExists = await db.category.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Ce slug est déjà utilisé" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour la catégorie
    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || "",
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la catégorie" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une catégorie
export async function DELETE(
  request,
  { params }
) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier l'authentification et les droits d'administrateur
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const id = params.id;

    // Vérifier si la catégorie existe
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { watches: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si la catégorie a des montres associées
    if (category._count.watches > 0) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer cette catégorie car elle contient des montres",
          watchesCount: category._count.watches,
        },
        { status: 400 }
      );
    }

    // Supprimer la catégorie
    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la catégorie" },
      { status: 500 }
    );
  }
}
