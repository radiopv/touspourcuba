import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PhotoUploadProps {
  donationId?: string;
  onUploadComplete?: () => void;
  onPhotosChange?: (files: FileList | null) => void;
}

export const PhotoUpload = ({ donationId, onUploadComplete, onPhotosChange }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      if (onPhotosChange) {
        onPhotosChange(event.target.files);
        return;
      }

      setUploading(true);

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${donationId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('donation-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('donation-photos')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('donation_photos')
        .insert({
          donation_id: donationId,
          url: publicUrl,
        });

      if (dbError) throw dbError;

      toast({
        title: "Photo ajoutée",
        description: "La photo a été ajoutée avec succès.",
      });

      onUploadComplete?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'upload.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="photo">Ajouter une photo</Label>
      <Input
        id="photo"
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      <Button disabled={uploading}>
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? "Upload en cours..." : "Upload"}
      </Button>
    </div>
  );
};