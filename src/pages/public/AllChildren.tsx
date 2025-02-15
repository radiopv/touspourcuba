import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import AvailableChildren from "./AvailableChildren";
import SponsoredChildren from "./SponsoredChildren";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AllChildren() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-cuba-warmBeige to-white">
      <div className="container mx-auto py-8 space-y-8 px-0 sm:px-4">
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 rounded-none sm:rounded-xl shadow-lg text-center mb-6 mx-0 sm:mx-4">
          <h1 className="text-2xl md:text-3xl font-bold font-title mb-3">
            Les Enfants
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto text-base sm:text-lg">
            Découvrez les enfants qui attendent votre soutien et ceux qui ont déjà trouvé une famille de cœur
          </p>
        </div>

        <Card className="mx-0 sm:mx-4 rounded-none sm:rounded-xl">
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="available" 
                className="text-base sm:text-lg py-3 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 hover:bg-orange-50 transition-colors duration-200"
              >
                Enfants disponibles
              </TabsTrigger>
              <TabsTrigger 
                value="sponsored" 
                className="text-base sm:text-lg py-3 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 hover:bg-orange-50 transition-colors duration-200"
              >
                Enfants parrainés
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="mt-4">
              <AvailableChildren />
            </TabsContent>

            <TabsContent value="sponsored" className="mt-4">
              <SponsoredChildren />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}