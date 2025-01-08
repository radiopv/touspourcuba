import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchInput } from "@/components/ui/search-input";
import { Search, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SponsorsListProps {
  sponsors: any[];
  isLoading: boolean;
  onRemoveChild?: (sponsorshipId: string) => void;
}

export const SponsorsList = ({ 
  sponsors: initialSponsors, 
  isLoading,
  onRemoveChild 
}: SponsorsListProps) => {
  const [sponsors, setSponsors] = useState(initialSponsors);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const { t } = useLanguage();

  const handleVerificationChange = async (sponsorId: string, checked: boolean) => {
    try {
      const { error } = await supabase
        .from('sponsors')
        .update({ is_verified: checked })
        .eq('id', sponsorId);

      if (error) throw error;
      
      setSponsors(prevSponsors =>
        prevSponsors.map(s =>
          s.id === sponsorId
            ? { ...s, is_verified: checked }
            : s
        )
      );
    } catch (error) {
      console.error('Error updating sponsor verification:', error);
    }
  };

  const handleStatusChange = async (sponsorId: string, field: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from('sponsors')
        .update({ [field]: value })
        .eq('id', sponsorId);

      if (error) throw error;
      
      setSponsors(prevSponsors =>
        prevSponsors.map(s =>
          s.id === sponsorId
            ? { ...s, [field]: value }
            : s
        )
      );
    } catch (error) {
      console.error('Error updating sponsor status:', error);
    }
  };

  const handleAddChild = async (sponsorId: string, childId: string) => {
    try {
      // Check if child is already sponsored
      const { data: existingSponsorship, error: checkError } = await supabase
        .from('sponsorships')
        .select('id')
        .eq('child_id', childId)
        .eq('status', 'active')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingSponsorship) {
        toast.error(t("childAlreadySponsored"));
        return;
      }

      // Create new sponsorship
      const { error } = await supabase
        .from('sponsorships')
        .insert({
          sponsor_id: sponsorId,
          child_id: childId,
          status: 'active',
          start_date: new Date().toISOString()
        });

      if (error) throw error;

      toast.success(t("sponsorshipCreated"));
    } catch (error) {
      console.error('Error adding child:', error);
      toast.error(t("errorAddingChild"));
    }
  };

  const filterAndSortSponsors = (sponsors: any[], isActive: boolean) => {
    let filtered = sponsors.filter(sponsor => {
      const searchString = `${sponsor.name} ${sponsor.email}`.toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();
      const hasChildren = sponsor.sponsorships?.length > 0;
      return searchString.includes(searchTermLower) && 
             (isActive ? hasChildren : !hasChildren);
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
            placeholder={t("searchByNameEmail")}
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={sponsor.photo_url} alt={sponsor.name} />
                    <AvatarFallback>{sponsor.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{sponsor.name}</h3>
                    <p className="text-sm text-gray-500">{sponsor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Vérifié</span>
                    <Checkbox
                      checked={sponsor.is_verified}
                      onCheckedChange={(checked) => handleVerificationChange(sponsor.id, checked as boolean)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Statut</span>
                    <Switch
                      checked={sponsor.is_active}
                      onCheckedChange={(checked) => handleStatusChange(sponsor.id, 'is_active', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Enfants parrainés</h4>
                <div className="grid gap-4">
                  {/* Use Set to ensure unique children */}
                  {Array.from(new Set(sponsor.sponsorships?.map((s: any) => s.child_id))).map((childId: string) => {
                    const sponsorship = sponsor.sponsorships?.find((s: any) => s.child_id === childId);
                    const child = sponsorship?.children;
                    
                    return child ? (
                      <div key={sponsorship.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={child.photo_url} alt={child.name} />
                            <AvatarFallback>{child.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium cursor-pointer hover:text-primary" 
                               onClick={() => onRemoveChild?.(sponsorship.id)}>
                              {child.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {child.age} ans
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onRemoveChild?.(sponsorship.id)}
                        >
                          Retirer
                        </Button>
                      </div>
                    ) : null;
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {/* Handle adding child */}}
                  >
                    <UserPlus className="h-4 w-4" />
                    Ajouter un enfant
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="inactive">
        <div className="space-y-6">
          {filterAndSortSponsors(sponsors, false).map((sponsor) => (
            <Card key={sponsor.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={sponsor.photo_url} alt={sponsor.name} />
                    <AvatarFallback>{sponsor.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{sponsor.name}</h3>
                    <p className="text-sm text-gray-500">{sponsor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Vérifié</span>
                    <Checkbox
                      checked={sponsor.is_verified}
                      onCheckedChange={(checked) => handleVerificationChange(sponsor.id, checked as boolean)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Statut</span>
                    <Switch
                      checked={sponsor.is_active}
                      onCheckedChange={(checked) => handleStatusChange(sponsor.id, 'is_active', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Enfants parrainés</h4>
                <p className="text-sm text-gray-500">Aucun enfant parrainé</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {/* Handle adding child */}}
                >
                  <UserPlus className="h-4 w-4" />
                  Ajouter un enfant
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
