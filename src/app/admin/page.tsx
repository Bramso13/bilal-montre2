"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";

import {
  NavigationProvider,
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
