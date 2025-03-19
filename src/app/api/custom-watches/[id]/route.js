

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à cette ressource" },
        { status: 401 }
      );
    }

    const customWatch = await prisma.customWatch.findUnique({
      where: {
        id: params.id,
      },
      include: {
        components: {
          include: {
            component: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!customWatch) {
      return NextResponse.json(
        { error: "Montre personnalisée non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur est autorisé à voir cette montre
    if (customWatch.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à voir cette montre" },
        { status: 403 }
      );
    }

    return NextResponse.json(customWatch);
  } catch (error) {
    console.error("Erreur lors de la récupération de la montre personnalisée:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de la montre personnalisée" },
      { status: 500 }
    );
  }
}
