"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

// Types
export type Section = {
  id: string;
  title: string;
  icon?: ReactNode;
  href: string;
  subsections?: Section[];
};

export type NavigationContextType = {
  currentSection: string;
  currentSubsection: string | null;
  setCurrentSection: (section: string) => void;
  setCurrentSubsection: (subsection: string | null) => void;
  sections: Section[];
};

// Sections de navigation pour l'admin
const adminSections: Section[] = [
  {
    id: "dashboard",
    title: "Tableau de bord",
    href: "/admin",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 mr-2"
      >
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    id: "watches",
    title: "Montres",
    href: "/admin/montres",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 mr-2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    subsections: [
      {
        id: "all-watches",
        title: "Toutes les montres",
        href: "/admin/montres",
      },
      {
        id: "add-watch",
        title: "Ajouter une montre",
        href: "/admin/montres/ajouter",
      },
    ],
  },
  {
    id: "components",
    title: "Composants",
    href: "/admin/composants",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 mr-2"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.29 7 12 12 20.71 7" />
        <line x1="12" x2="12" y1="22" y2="12" />
      </svg>
    ),
    subsections: [
      {
        id: "all-components",
        title: "Tous les composants",
        href: "/admin/composants",
      },
      {
        id: "add-component",
        title: "Ajouter un composant",
        href: "/admin/composants/ajouter",
      },
    ],
  },
  {
    id: "orders",
    title: "Commandes",
    href: "/admin/commandes",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 mr-2"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    id: "users",
    title: "Utilisateurs",
    href: "/admin/utilisateurs",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 mr-2"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

// Création du contexte
const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

// Provider du contexte
export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentSection, setCurrentSection] = useState<string>("dashboard");
  const [currentSubsection, setCurrentSubsection] = useState<string | null>(
    null
  );

  const handleSetCurrentSection = (section: string) => {
    setCurrentSection(section);

    // Réinitialiser la sous-section lorsqu'on change de section
    setCurrentSubsection(null);

    // Si la section a des sous-sections, définir la première comme active par défaut
    const selectedSection = adminSections.find((s) => s.id === section);
    if (
      selectedSection?.subsections &&
      selectedSection.subsections.length > 0
    ) {
      setCurrentSubsection(selectedSection.subsections[0].id);
    }
  };

  const value = {
    currentSection,
    currentSubsection,
    setCurrentSection,
    setCurrentSubsection,
    sections: adminSections,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

// Hook pour utiliser le contexte
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
