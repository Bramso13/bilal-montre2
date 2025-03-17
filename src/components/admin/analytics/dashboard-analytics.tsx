"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueChart } from "./revenue-chart";
import { SalesByCategoryChart } from "./sales-by-category-chart";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardAnalyticsProps {
  className?: string;
}

export function DashboardAnalytics({ className }: DashboardAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    monthlyRevenue: { month: number; revenue: number }[];
    salesByCategory: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/stats");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statistiques");
        }
        const result = await response.json();
        setData({
          monthlyRevenue: result.monthlyRevenue || [],
          salesByCategory: result.salesByCategory || {},
        });
      } catch (err) {
        console.error("Erreur:", err);
        setError("Impossible de charger les données d'analyse");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-red-500">{error}</div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-6">Analyse des ventes</h2>
      <Tabs defaultValue="revenue">
        <TabsList className="mb-4">
          <TabsTrigger value="revenue">Revenus mensuels</TabsTrigger>
          <TabsTrigger value="categories">Ventes par catégorie</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <RevenueChart data={data?.monthlyRevenue || []} />
          )}
        </TabsContent>
        <TabsContent value="categories">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <SalesByCategoryChart data={data?.salesByCategory || {}} />
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
