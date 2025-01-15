import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, FileEdit, Clock } from "lucide-react";
import { useState } from "react";
import { TerminationDialog } from "../TerminationDialog";

interface SponsoredChildCardProps {
  child: {
    id: string;
    name: string;
    photo_url?: string;
    age?: number | null;
  };
  sponsorshipId: string;
  onAddPhoto: () => void;
  onAddTestimonial: () => void;
}

export const SponsoredChildCard = ({
  child,
  sponsorshipId,
  onAddPhoto,
  onAddTestimonial,
}: SponsoredChildCardProps) => {
  const [showTermination, setShowTermination] = useState(false);

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border border-cuba-softOrange/20">
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={child.photo_url} alt={child.name} />
          <AvatarFallback>{child.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">{child.name}</h3>
          {child.age && (
            <p className="text-sm text-gray-500">
              {child.age} ans
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 bg-white hover:bg-cuba-warmBeige/10 transition-colors h-auto py-2"
          onClick={onAddPhoto}
        >
          <Camera className="h-4 w-4" />
          <span className="whitespace-nowrap">Ajouter une photo</span>
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 bg-white hover:bg-cuba-warmBeige/10 transition-colors h-auto py-2"
          onClick={onAddTestimonial}
        >
          <FileEdit className="h-4 w-4" />
          <span className="whitespace-nowrap">Ajouter un témoignage</span>
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 bg-white hover:bg-cuba-warmBeige/10 transition-colors h-auto py-2 sm:col-span-2"
          onClick={() => setShowTermination(true)}
        >
          <Clock className="h-4 w-4" />
          <span className="whitespace-nowrap">Mettre fin au parrainage</span>
        </Button>
      </div>

      <TerminationDialog
        isOpen={showTermination}
        onClose={() => setShowTermination(false)}
        sponsorshipId={sponsorshipId}
        childName={child.name}
        onTerminationComplete={() => window.location.reload()}
      />
    </Card>
  );
};