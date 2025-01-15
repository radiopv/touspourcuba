import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeroSection } from "@/components/Home/HeroSection";
import { ImpactStats } from "@/components/Home/ImpactStats";

interface HomepageModule {
  id: string;
  module_type: string;
  content: {
    title?: string;
    subtitle?: string;
  };
  settings: {
    title: string;
    showTotalSponsors: boolean;
    showTotalChildren: boolean;
    showTotalDonations: boolean;
    animateNumbers: boolean;
    backgroundStyle: string;
  };
  is_active: boolean;
  order_index: number;
}

export default function Home() {
  const { data: modules } = useQuery({
    queryKey: ['homepage-modules'],
    queryFn: async () => {
      const { data } = await supabase
        .from('homepage_modules')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      return data as HomepageModule[];
    }
  });

  const handleImageClick = () => {
    console.log("Image clicked");
  };

  return (
    <div className="min-h-screen">
      {modules?.map((module) => {
        switch (module.module_type) {
          case 'hero':
            return (
              <HeroSection 
                key={module.id} 
                heroSection={module.content}
                onImageClick={handleImageClick}
              />
            );
          case 'impact_stats':
            return (
              <ImpactStats 
                key={module.id}
                settings={{
                  title: "Notre Impact",
                  showTotalSponsors: true,
                  showTotalChildren: true,
                  showTotalDonations: true,
                  animateNumbers: true,
                  backgroundStyle: "gradient",
                  ...module.settings
                }}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}