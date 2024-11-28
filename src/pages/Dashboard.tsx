import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorAlert } from "@/components/ErrorAlert";
import { toast } from "sonner";
import { convertJsonToNeeds } from "@/types/needs";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { ChildrenNeeds } from "@/components/Dashboard/ChildrenNeeds";
import { SponsorshipList } from "@/components/Sponsorship/SponsorshipList";
import { SponsorshipStats } from "@/components/Sponsorship/SponsorshipStats";
import { DashboardStats } from "@/types/dashboard";

interface RawDashboardStats {
  children: {
    total: number;
    sponsored: number;
    available: number;
  };
  sponsors: number;
  donations: {
    total: number;
    people_helped: number;
  };
  cities: number;
}

const Dashboard = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: rawData, error } = await supabase.rpc('get_dashboard_statistics');
      if (error) throw error;
      
      // Calculate urgent needs count from children data
      const { data: childrenData } = await supabase
        .from('children')
        .select('needs');
      
      const urgentNeedsCount = childrenData?.reduce((count, child) => {
        const needs = convertJsonToNeeds(child.needs);
        return count + needs.filter(need => need.is_urgent).length;
      }, 0) || 0;

      // Cast the raw data to our expected type
      const rawStats = rawData as unknown as RawDashboardStats;

      // Ensure we have a properly typed object
      const typedStats: DashboardStats = {
        children: {
          total: rawStats.children?.total || 0,
          sponsored: rawStats.children?.sponsored || 0,
          available: rawStats.children?.available || 0,
          urgent_needs: urgentNeedsCount
        },
        sponsors: rawStats.sponsors || 0,
        donations: {
          total: rawStats.donations?.total || 0,
          people_helped: rawStats.donations?.people_helped || 0
        },
        cities: rawStats.cities || 0
      };

      return typedStats;
    },
    retry: 1,
    meta: {
      errorMessage: "Erreur lors du chargement des statistiques",
      onError: (error: Error) => {
        console.error('Query error:', error);
        toast.error("Erreur lors du chargement des statistiques");
      }
    }
  });

  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('id, name, needs');
      if (error) throw error;
      return data.map(child => ({
        ...child,
        needs: convertJsonToNeeds(child.needs)
      }));
    }
  });

  // Souscription aux changements en temps réel
  useEffect(() => {
    const channel = supabase
      .channel('children-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'children'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['children'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          toast.success("Les besoins ont été mis à jour");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (statsError) {
    return (
      <div className="space-y-6">
        <ErrorAlert 
          message="Une erreur est survenue lors du chargement des statistiques" 
          retry={() => refetchStats()}
        />
      </div>
    );
  }

  if (statsLoading || childrenLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader stats={stats} />
      
      <ChildrenNeeds 
        children={children || []} 
        onNeedsUpdate={() => {
          queryClient.invalidateQueries({ queryKey: ['children'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }}
      />

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Gestion des Parrainages</h2>
        <SponsorshipStats />
        <SponsorshipList />
      </div>
    </div>
  );
};

export default Dashboard;