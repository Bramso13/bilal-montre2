"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";

import {
  NavigationProvider,
  useNavigation,
} from "@/lib/context/NavigationContext";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminMain from "./admin-main";
import { Separator } from "@/components/ui/separator";

export default function AdminPage() {
  return (
    <NavigationProvider>
      <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <SidebarProvider>
          <AdminSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 w-full flex-row justify-between">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 p-5">
              <AdminMain />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </NavigationProvider>
  );
}

// Fonction pour obtenir le titre de la page
function getPageTitle(section: string): string {
  switch (section) {
    case "dashboard":
      return "Tableau de bord";
    case "watches":
      return "Gestion des montres";
    case "components":
      return "Gestion des composants";
    case "orders":
      return "Gestion des commandes";
    case "users":
      return "Gestion des utilisateurs";
    default:
      return "Administration";
  }
}
