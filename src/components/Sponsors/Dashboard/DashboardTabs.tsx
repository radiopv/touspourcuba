import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { DashboardActions } from "./DashboardActions";
import { PhotoAlbumSection } from "./PhotoAlbumSection";
import { VisitsSection } from "./VisitsSection";
import { ImportantDatesCard } from "./ImportantDatesCard";
import { StatisticsSection } from "./StatisticsSection";
import { PlannedVisitForm } from "./PlannedVisitForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SponsoredChildSection } from "./SponsoredChildSection";

interface DashboardTabsProps {
  sponsorships: any[];
  userId: string;
  plannedVisits: any[];
}

export const DashboardTabs = ({ sponsorships, userId, plannedVisits }: DashboardTabsProps) => {
  const birthDates = sponsorships.map(s => ({
    childName: s.children.name,
    birthDate: s.children.birth_date
  }));

  const { refetch: refetchVisits } = useQuery({
    queryKey: ["planned-visits", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planned_visits")
        .select("*")
        .eq("sponsor_id", userId)
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Tabs defaultValue="actions" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="actions">Actions</TabsTrigger>
        <TabsTrigger value="gallery">Album Photos</TabsTrigger>
        <TabsTrigger value="visits">Visites Prévues</TabsTrigger>
        <TabsTrigger value="statistics">Statistiques</TabsTrigger>
      </TabsList>

      <TabsContent value="actions">
        <DashboardActions />
      </TabsContent>

      <TabsContent value="gallery">
        <Card className="p-6">
          {sponsorships.map((sponsorship) => (
            <PhotoAlbumSection
              key={sponsorship.id}
              childId={sponsorship.children.id}
              sponsorId={userId}
              childName={sponsorship.children.name}
            />
          ))}
        </Card>
      </TabsContent>

      <TabsContent value="visits">
        <div className="space-y-6">
          <PlannedVisitForm 
            sponsorId={userId} 
            onVisitPlanned={refetchVisits}
          />
          <Card className="p-6">
            <ImportantDatesCard
              plannedVisits={plannedVisits?.filter(v => v.sponsor_id === userId)}
              birthDates={birthDates}
            />
          </Card>
          <Card className="p-6">
            <VisitsSection visits={plannedVisits} />
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="statistics">
        <StatisticsSection />
      </TabsContent>
    </Tabs>
  );
};