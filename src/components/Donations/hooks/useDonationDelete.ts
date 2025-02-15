import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useDonationDelete = (onDeleteSuccess?: () => void) => {
  const { toast } = useToast();

  const handleDelete = async (donationId: string) => {
    try {
      // Delete associated photos first
      const { error: photosError } = await supabase
        .from('donation_photos')
        .delete()
        .eq('donation_id', donationId);

      if (photosError) {
        console.error('Error deleting photos:', photosError);
        throw photosError;
      }

      // Delete associated videos
      const { error: videosError } = await supabase
        .from('donation_videos')
        .delete()
        .eq('donation_id', donationId);

      if (videosError) {
        console.error('Error deleting videos:', videosError);
        throw videosError;
      }

      // Delete donation items
      const { error: itemsError } = await supabase
        .from('donation_items')
        .delete()
        .eq('donation_id', donationId);

      if (itemsError) {
        console.error('Error deleting items:', itemsError);
        throw itemsError;
      }

      // Delete associated donors
      const { error: donorsError } = await supabase
        .from('donors')
        .delete()
        .eq('donation_id', donationId);

      if (donorsError) {
        console.error('Error deleting donors:', donorsError);
        throw donorsError;
      }

      // Finally, delete the donation
      const { error: donationError } = await supabase
        .from('donations')
        .delete()
        .eq('id', donationId);

      if (donationError) {
        console.error('Error deleting donation:', donationError);
        throw donationError;
      }

      toast({
        title: "Don supprimé",
        description: "Le don a été supprimé avec succès.",
      });

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error('Error deleting donation:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du don.",
      });
    }
  };

  return { handleDelete };
};