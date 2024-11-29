import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { DonationDialog } from "./DonationDialog";
import { DonationDetails } from "./DonationDetails";
import { DonationCardHeader } from "./DonationCardHeader";
import { DonationCardMedia } from "./DonationCardMedia";

interface DonationCardProps {
  donation: {
    id: string;
    assistant_name: string;
    city: string;
    people_helped: number;
    donation_date: string;
    status: string;
    comments: string | null;
  };
  onDelete?: () => void;
  isAdmin?: boolean;
}

export const DonationCard = ({ donation, onDelete, isAdmin = false }: DonationCardProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  const { data: donationPhotos, refetch: refetchPhotos } = useQuery({
    queryKey: ['donation-photos', donation.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donation_photos')
        .select('*')
        .eq('donation_id', donation.id);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: donationVideos, refetch: refetchVideos } = useQuery({
    queryKey: ['donation-videos', donation.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donation_videos')
        .select('*')
        .eq('donation_id', donation.id);
      
      if (error) throw error;
      return data;
    }
  });

  const handleSaveEdit = async (editedDonation: any) => {
    try {
      const { error } = await supabase
        .from('donations')
        .update({
          city: editedDonation.city,
          people_helped: editedDonation.people_helped,
          assistant_name: editedDonation.assistant_name,
          comments: editedDonation.comments
        })
        .eq('id', donation.id);

      if (error) throw error;

      toast({
        title: "Don modifié",
        description: "Les modifications ont été enregistrées avec succès.",
      });

      setShowEditDialog(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du don.",
      });
    }
  };

  const handleDeleteDonation = async () => {
    try {
      const { error } = await supabase
        .from('donations')
        .delete()
        .eq('id', donation.id);

      if (error) throw error;

      toast({
        title: "Don supprimé",
        description: "Le don a été supprimé avec succès.",
      });

      onDelete?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du don.",
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <DonationCardHeader
          donation={donation}
          isAdmin={isAdmin}
          onEdit={() => setShowEditDialog(true)}
          onDelete={handleDeleteDonation}
        />

        <DonationDetails donation={donation} />
        
        {donation.comments && (
          <div>
            <p className="text-gray-500">Commentaires</p>
            <p className="text-sm">{donation.comments}</p>
          </div>
        )}

        <DonationCardMedia
          donationId={donation.id}
          photos={donationPhotos || []}
          videos={donationVideos || []}
          onPhotosUpdate={refetchPhotos}
          onVideosUpdate={refetchVideos}
        />

        <DonationDialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          donation={donation}
          onSave={handleSaveEdit}
        />
      </div>
    </Card>
  );
};