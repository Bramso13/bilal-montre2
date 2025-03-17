export interface Order {
  id: string;
  clientName: string;
  date: Date;
  amount: number;
  status: "Livré" | "En cours" | "En attente";
}

export interface StockAlert {
  id: string;
  productName: string;
  type: "Montre" | "Composant";
  currentStock: number;
  threshold: number;
}

export interface DashboardStats {
  watches: number;
  components: number;
  orders: number;
  users: number;
}
