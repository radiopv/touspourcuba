import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SponsorshipAccordion } from "./SponsorshipAccordion";
import { SearchInput } from "@/components/ui/search-input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

interface SponsorsListProps {
  sponsors: any[];
  isLoading: boolean;
}

export const SponsorsList = ({ sponsors: initialSponsors, isLoading }: SponsorsListProps) => {
  const [sponsors, setSponsors] = useState(initialSponsors);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const { t } = useLanguage();

  const filterAndSortSponsors = (sponsors: any[], isActive: boolean) => {
    let filtered = sponsors.filter(sponsor => {
      const searchString = `${sponsor.name} ${sponsor.email} ${sponsor.city}`.toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();
      return sponsor.is_active === isActive && searchString.includes(searchTermLower);
    });

    return filtered.sort((a, b) => {
      if (sortOrder === "recent") {
        const latestA = Math.max(...(a.sponsorships?.map((s: any) => new Date(s.start_date).getTime()) || [0]));
        const latestB = Math.max(...(b.sponsorships?.map((s: any) => new Date(s.start_date).getTime()) || [0]));
        return latestB - latestA;
      } else if (sortOrder === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  };

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="active">{t("activeSponsors")}</TabsTrigger>
        <TabsTrigger value="inactive">{t("inactiveSponsors")}</TabsTrigger>
      </TabsList>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchInput
            placeholder={t("searchByNameEmailCity")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{t("mostRecent")}</SelectItem>
            <SelectItem value="name">{t("name")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TabsContent value="active">
        <div className="space-y-6">
          {filterAndSortSponsors(sponsors, true).map((sponsor) => (
            <Card key={sponsor.id} className="p-6">
              <SponsorshipAccordion
                sponsor={sponsor}
                onUpdate={() => {
                  setSponsors(prevSponsors =>
                    prevSponsors.map(s =>
                      s.id === sponsor.id
                        ? { ...s, ...sponsor }
                        : s
                    )
                  );
                }}
              />
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="inactive">
        <div className="space-y-6">
          {filterAndSortSponsors(sponsors, false).map((sponsor) => (
            <Card key={sponsor.id} className="p-6">
              <SponsorshipAccordion
                sponsor={sponsor}
                onUpdate={() => {
                  setSponsors(prevSponsors =>
                    prevSponsors.map(s =>
                      s.id === sponsor.id
                        ? { ...s, ...sponsor }
                        : s
                    )
                  );
                }}
              />
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};