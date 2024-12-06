import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Children } from "@/integrations/supabase/types/children";

interface SponsorDialogProps {
  child: Children['Row'];
  sponsors: any[];
  isOpen: boolean;
  onClose: () => void;
}

export const SponsorDialog = ({ child, sponsors, isOpen, onClose }: SponsorDialogProps) => {
  const [selectedSponsor, setSelectedSponsor] = useState<string>(child.sponsor_id || "");
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const handleSponsorUpdate = async (childId: string, sponsorId: string | null) => {
    try {
      console.log('Updating sponsor with:', { childId, sponsorId });
      
      const updates: Partial<Children['Update']> = {
        is_sponsored: !!sponsorId,
        sponsor_id: sponsorId,
        sponsor_name: sponsors?.find(s => s.id === sponsorId)?.name || null,
        sponsor_email: sponsors?.find(s => s.id === sponsorId)?.email || null,
      };

      console.log('Updates object:', updates);

      const { error } = await supabase
        .from('children')
        .update(updates)
        .eq('id', childId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ['children'] });
      toast.success(sponsorId ? t("success") : t("success"));
      onClose();
    } catch (error) {
      console.error('Error updating sponsor:', error);
      toast.error(t("error"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {child.is_sponsored ? t("edit") : t("addChild")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select
            value={selectedSponsor}
            onValueChange={setSelectedSponsor}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectMessage")} />
            </SelectTrigger>
            <SelectContent>
              {child.is_sponsored && (
                <SelectItem value="remove_sponsor">{t("delete")}</SelectItem>
              )}
              {sponsors?.map((sponsor) => (
                <SelectItem key={sponsor.id} value={sponsor.id}>
                  {sponsor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={() => handleSponsorUpdate(child.id, selectedSponsor === "remove_sponsor" ? null : selectedSponsor)}
              disabled={!selectedSponsor}
            >
              {t("confirm")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};