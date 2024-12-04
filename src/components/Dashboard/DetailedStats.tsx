import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const DetailedStats = () => {
  const { data: dailyStats, isLoading: dailyLoading, error: dailyError } = useQuery({
    queryKey: ['daily-donations'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_daily_donation_trends');
      if (error) throw error;
      return data;
    }
  });

  const { data: cityStats, isLoading: cityLoading, error: cityError } = useQuery({
    queryKey: ['city-donations'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_city_donation_stats');
      if (error) throw error;
      return data;
    }
  });

  const { data: sponsorshipStats, isLoading: sponsorshipLoading, error: sponsorshipError } = useQuery({
    queryKey: ['sponsorship-stats'],
    queryFn: async () => {
      const { data: sponsorships, error } = await supabase
        .from('sponsorships')
        .select('status, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const stats = {
        active: sponsorships?.filter(s => s.status === 'active').length || 0,
        pending: sponsorships?.filter(s => s.status === 'pending').length || 0,
        ended: sponsorships?.filter(s => s.status === 'ended').length || 0
      };

      return stats;
    }
  });

  const renderError = (message: string) => (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <div className="ml-2">{message}</div>
    </Alert>
  );

  const renderSkeleton = () => (
    <div className="h-[300px] w-full">
      <Skeleton className="h-full w-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Évolution des dons</h3>
          <div className="h-[300px]">
            {dailyError ? renderError("Erreur lors du chargement des données") : 
             dailyLoading ? renderSkeleton() : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="donations" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition géographique</h3>
          <div className="h-[300px]">
            {cityError ? renderError("Erreur lors du chargement des données") :
             cityLoading ? renderSkeleton() : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cityStats}
                    dataKey="donations"
                    nameKey="city"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {cityStats?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Statistiques des parrainages</h3>
          <div className="space-y-4">
            {sponsorshipError ? renderError("Erreur lors du chargement des données") :
             sponsorshipLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center p-3 bg-green-100 rounded">
                  <span>Parrainages actifs</span>
                  <span className="font-bold">{sponsorshipStats?.active}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-100 rounded">
                  <span>En attente</span>
                  <span className="font-bold">{sponsorshipStats?.pending}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
                  <span>Terminés</span>
                  <span className="font-bold">{sponsorshipStats?.ended}</span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};