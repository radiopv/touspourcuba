import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { SponsorshipConversionStats, UserEngagementStats } from "@/types/statistics";

export const StatisticsSection = () => {
  const { data: sponsorshipStats, isLoading: isLoadingSponsorship } = useQuery<SponsorshipConversionStats>({
    queryKey: ['sponsorship-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_sponsorship_conversion_stats');
      if (error) throw error;
      return data as unknown as SponsorshipConversionStats;
    }
  });

  const { data: engagementStats, isLoading: isLoadingEngagement } = useQuery<UserEngagementStats>({
    queryKey: ['engagement-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_engagement_stats');
      if (error) throw error;
      return data as unknown as UserEngagementStats;
    }
  });

  if (isLoadingSponsorship || isLoadingEngagement) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Statistiques des Parrainages</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {sponsorshipStats?.conversion_rate}%
            </p>
            <p className="text-sm text-gray-600">Taux de Conversion</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {sponsorshipStats?.avg_duration_days} jours
            </p>
            <p className="text-sm text-gray-600">Durée Moyenne</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {sponsorshipStats?.active_sponsorships}
            </p>
            <p className="text-sm text-gray-600">Parrainages Actifs</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Engagement des Parrains</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {engagementStats?.active_sponsors}
            </p>
            <p className="text-sm text-gray-600">Parrains Actifs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {engagementStats?.activity_rate}%
            </p>
            <p className="text-sm text-gray-600">Taux d'Activité</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {engagementStats?.total_assistants}
            </p>
            <p className="text-sm text-gray-600">Assistants</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {engagementStats?.cities_coverage}
            </p>
            <p className="text-sm text-gray-600">Villes Couvertes</p>
          </div>
        </div>
      </Card>
    </div>
  );
};