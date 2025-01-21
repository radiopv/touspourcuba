import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Eye, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface SponsoredChildrenDisplayProps {
  sponsorships: any[];
}

export const SponsoredChildrenDisplay = ({ sponsorships }: SponsoredChildrenDisplayProps) => {
  const navigate = useNavigate();
  const [selectedSponsorship, setSelectedSponsorship] = useState<{id: string, childName: string} | null>(null);
  const [removalReason, setRemovalReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const viewAlbum = (childId: string) => {
    navigate(`/children/${childId}/album`);
  };

  const openRemovalDialog = (sponsorshipId: string, childName: string) => {
    setSelectedSponsorship({ id: sponsorshipId, childName });
  };

  const closeRemovalDialog = () => {
    setSelectedSponsorship(null);
    setRemovalReason("");
  };

  const requestRemoveChild = async () => {
    if (!selectedSponsorship) return;
    if (!removalReason.trim()) {
      toast.error("Veuillez indiquer la raison du retrait");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('child_assignment_requests')
        .insert({
          sponsorship_id: selectedSponsorship.id,
          type: 'remove',
          status: 'pending',
          notes: removalReason
        });

      if (error) throw error;
      toast.success("Demande de retrait envoyée avec succès. Un administrateur examinera votre demande.");
      closeRemovalDialog();
    } catch (error) {
      console.error("Error requesting child removal:", error);
      toast.error("Erreur lors de la demande de retrait");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestAddChild = async () => {
    try {
      navigate('/children/available');
    } catch (error) {
      console.error("Error navigating to available children:", error);
      toast.error("Erreur lors de la navigation");
    }
  };

  const activeSponshorships = sponsorships?.filter(
    (sponsorship) => 
      sponsorship.status === 'active' && 
      sponsorship.children
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Enfants parrainés</h3>
        <Button
          variant="outline"
          onClick={requestAddChild}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un enfant
        </Button>
      </div>
      <div className="grid gap-4">
        {activeSponshorships?.map((sponsorship: any) => (
          <Card key={sponsorship.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={sponsorship.children.photo_url} alt={sponsorship.children.name} />
                  <AvatarFallback>{sponsorship.children.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{sponsorship.children.name}</p>
                  <p className="text-xs text-gray-500">{sponsorship.children.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => viewAlbum(sponsorship.children.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openRemovalDialog(sponsorship.id, sponsorship.children.name)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {(!activeSponshorships || activeSponshorships.length === 0) && (
          <p className="text-sm text-gray-500">Aucun enfant parrainé</p>
        )}
      </div>

      <Dialog open={!!selectedSponsorship} onOpenChange={() => selectedSponsorship && closeRemovalDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande de retrait de parrainage</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison pour laquelle vous souhaitez arrêter le parrainage de {selectedSponsorship?.childName}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Raison du retrait..."
            value={removalReason}
            onChange={(e) => setRemovalReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={closeRemovalDialog}>
              Annuler
            </Button>
            <Button 
              onClick={requestRemoveChild}
              disabled={isSubmitting || !removalReason.trim()}
            >
              {isSubmitting ? "Envoi..." : "Envoyer la demande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};