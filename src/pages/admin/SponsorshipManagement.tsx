import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { SponsorsList } from "@/components/Sponsors/SponsorsList";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const SponsorshipManagement = () => {
  const { t } = useLanguage();
  
  const { data: sponsors, isLoading: sponsorsLoading } = useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select(`
          *,
          sponsorships (
            id,
            child_id,
            start_date,
            end_date,
            status,
            children (
              id,
              name,
              age,
              city,
              photo_url,
              needs
            )
          )
        `)
        .order('name');

      if (error) {
        console.error("Error fetching sponsors:", error);
        throw error;
      }
      return data;
    }
  });

  if (sponsorsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">{t("sponsorshipManagement")}</h1>
      <Card className="p-6">
        <SponsorsList sponsors={sponsors || []} isLoading={sponsorsLoading} />
      </Card>
    </div>
  );
};

export default SponsorshipManagement;