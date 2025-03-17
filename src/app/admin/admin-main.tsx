import { DashboardAnalytics } from "@/components/admin/analytics/dashboard-analytics";
import { WatchesManager } from "@/components/admin/products/watches-manager";
import { ComponentsManager } from "@/components/admin/components/components-manager";
import { OrdersManager } from "@/components/admin/orders/orders-manager";
import { UsersManager } from "@/components/admin/users/users-manager";
import { useNavigation } from "@/lib/context/NavigationContext";
import CategoriesManager from "@/components/admin/categories/categories-manager";

const AdminMain = () => {
  const { currentSection } = useNavigation();

  switch (currentSection) {
    case "dashboard":
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <DashboardAnalytics />
        </div>
      );
    case "watches":
      return <WatchesManager />;
    case "components":
      return <ComponentsManager />;
    case "orders":
      return <OrdersManager />;
    case "users":
      return <UsersManager />;
    case "categories":
      return <CategoriesManager />;
    default:
      return (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Section en construction</h2>
          <p className="text-muted-foreground">
            Cette section n est pas encore disponible.
          </p>
        </div>
      );
  }
};

export default AdminMain;
