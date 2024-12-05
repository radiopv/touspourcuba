import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { HeroSection } from "@/components/Home/HeroSection";
import { UrgentNeedsSection } from "@/components/Home/UrgentNeedsSection";
import { SponsorMemoriesSection } from "@/components/Home/SponsorMemoriesSection";
import { SponsorshipStats } from "@/components/Dashboard/AdvancedStats/SponsorshipStats";
import { UserEngagementStats } from "@/components/Dashboard/AdvancedStats/UserEngagementStats";
import { Heart, Handshake, ChartBar } from "lucide-react";

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section avec gradient cubain */}
      <section className="relative bg-cuba-gradient py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="w-full md:w-1/2 text-white space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold">
                {t("changeALife")}
              </h1>
              <p className="text-xl md:text-2xl">
                {t("sponsorshipDescription")}
              </p>
              <Button 
                onClick={() => navigate("/children")}
                size="lg"
                className="bg-secondary hover:bg-secondary-hover text-white"
              >
                {t("becomeSponsor")}
              </Button>
            </div>
            <div className="w-full md:w-1/2">
              <img 
                src="/placeholder.svg" 
                alt="Children" 
                className="rounded-lg shadow-xl animate-fade-in"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Impact avec statistiques */}
      <section className="py-16 bg-cuba-offwhite">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t("ourImpact")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <SponsorshipStats />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <Handshake className="w-12 h-12 mx-auto mb-4 text-primary" />
              <UserEngagementStats />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <ChartBar className="w-12 h-12 mx-auto mb-4 text-accent" />
              <div className="mt-4">
                <Button 
                  onClick={() => navigate("/children")}
                  variant="outline"
                  className="w-full"
                >
                  {t("seeAllChildren")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Besoins Urgents */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t("urgentNeeds")}</h2>
          <UrgentNeedsSection />
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="py-16 bg-beach-gradient">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t("sponsorMemories")}</h2>
          <SponsorMemoriesSection />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-sunset-gradient text-white text-center">
        <div className="container mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-bold">{t("joinUs")}</h2>
          <p className="max-w-2xl mx-auto text-lg">
            {t("joinUsDescription")}
          </p>
          <Button
            onClick={() => navigate("/children")}
            size="lg"
            className="bg-white text-secondary hover:bg-gray-100"
          >
            {t("becomeSponsor")}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;