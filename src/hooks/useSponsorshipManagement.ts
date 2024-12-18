import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SponsorshipWithDetails, GroupedSponsorship } from "@/integrations/supabase/types/sponsorship";
import { TableNames } from "@/integrations/supabase/types/database-tables";
import { useLanguage } from "@/contexts/LanguageContext";

export const useSponsorshipManagement = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: sponsorships, isLoading: sponsorshipsLoading } = useQuery({
    queryKey: ['sponsorships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TableNames.SPONSORSHIPS)
        .select(`
          *,
          sponsors (
            id,
            name,
            email,
            photo_url,
            is_active
          ),
          children (
            id,
            name,
            photo_url,
            age
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Grouper les parrainages par parrain
      const groupedData = (data as SponsorshipWithDetails[]).reduce<GroupedSponsorship[]>((acc, curr) => {
        const existingGroup = acc.find(g => g.sponsor.id === curr.sponsors.id);
        
        if (existingGroup) {
          existingGroup.sponsorships.push({
            id: curr.id,
            child: curr.children,
            start_date: curr.start_date,
            status: curr.status
          });
        } else {
          acc.push({
            sponsor: curr.sponsors,
            sponsorships: [{
              id: curr.id,
              child: curr.children,
              start_date: curr.start_date,
              status: curr.status
            }]
          });
        }
        
        return acc;
      }, []);

      return groupedData;
    }
  });

  const { data: allChildren, isLoading: childrenLoading } = useQuery({
    queryKey: ['all-children'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TableNames.CHILDREN)
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const createSponsorship = useMutation({
    mutationFn: async ({ childId, sponsorId }: { childId: string; sponsorId: string }) => {
      const { error } = await supabase
        .from(TableNames.SPONSORSHIPS)
        .insert({
          child_id: childId,
          sponsor_id: sponsorId,
          start_date: new Date().toISOString(),
          status: 'active'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorships'] });
      queryClient.invalidateQueries({ queryKey: ['all-children'] });
      toast.success(t("sponsorship.success.created"));
    },
    onError: () => {
      toast.error(t("sponsorship.error.create"));
    }
  });

  const deleteSponsorship = useMutation({
    mutationFn: async (sponsorshipId: string) => {
      const { error } = await supabase
        .from(TableNames.SPONSORSHIPS)
        .delete()
        .eq('id', sponsorshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorships'] });
      queryClient.invalidateQueries({ queryKey: ['all-children'] });
      toast.success(t("sponsorship.success.deleted"));
    },
    onError: () => {
      toast.error(t("sponsorship.error.delete"));
    }
  });

  const reassignChild = useMutation({
    mutationFn: async ({ childId, newSponsorId }: { childId: string; newSponsorId: string }) => {
      const { error } = await supabase
        .from(TableNames.SPONSORSHIPS)
        .update({ 
          sponsor_id: newSponsorId,
          updated_at: new Date().toISOString()
        })
        .eq('child_id', childId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorships'] });
      toast.success(t("sponsorship.success.reassigned"));
    },
    onError: () => {
      toast.error(t("sponsorship.error.reassign"));
    }
  });

  return {
    sponsorships,
    allChildren,
    isLoading: sponsorshipsLoading || childrenLoading,
    createSponsorship,
    deleteSponsorship,
    reassignChild
  };
};