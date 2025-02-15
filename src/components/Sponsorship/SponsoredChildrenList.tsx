import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { convertJsonToNeeds } from "@/types/needs";
import { useLanguage } from "@/contexts/LanguageContext";
import { differenceInYears, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SponsoredChildrenListProps {
  children: any[];
}

const formatAge = (birthDate: string) => {
  if (!birthDate) return "Âge inconnu";
  
  const today = new Date();
  const birth = parseISO(birthDate);
  const years = differenceInYears(today, birth);
  
  return `${years} ans`;
};

export const SponsoredChildrenList = ({ children }: SponsoredChildrenListProps) => {
  const { t } = useLanguage();

  // Fetch album photos for all children
  const { data: albumPhotos } = useQuery({
    queryKey: ['album-photos', children.map(child => child.id)],
    queryFn: async () => {
      if (!children.length) return [];
      
      const { data, error } = await supabase
        .from('album_media')
        .select('*')
        .in('child_id', children.map(child => child.id))
        .eq('type', 'image')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching album photos:', error);
        return [];
      }

      return data || [];
    },
    enabled: children.length > 0
  });

  // Group photos by child
  const photosByChild = albumPhotos?.reduce((acc, photo) => {
    if (!acc[photo.child_id]) {
      acc[photo.child_id] = [];
    }
    acc[photo.child_id].push(photo);
    return acc;
  }, {} as Record<string, any[]>) || {};

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {children.map((child) => (
        <Card 
          key={child.id} 
          className="overflow-hidden bg-gradient-to-br from-white to-cuba-warmBeige border-cuba-softOrange/20 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row gap-4 p-4">
            {/* Photo principale */}
            <div className="w-full md:w-1/2 aspect-square flex items-center justify-center bg-white/50 rounded-lg overflow-hidden">
              <img
                src={child.photo_url || "/placeholder.svg"}
                alt={child.name}
                className="h-full w-auto object-contain"
              />
            </div>

            {/* Informations à droite de la photo */}
            <div className="w-full md:w-1/2 space-y-2">
              <h3 className="font-title text-xl text-cuba-deepOrange">{child.name}</h3>
              <p className="text-sm text-gray-600">{formatAge(child.birth_date)}</p>
              <p className="text-sm text-gray-600">{child.city}</p>
              {child.sponsor_name && (
                <div className="mt-2 pt-2 border-t border-cuba-softOrange/20">
                  <p className="text-sm text-gray-600">
                    Parrainé par: <span className="font-medium">{child.sponsor_name}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Album Photos Grid */}
            {photosByChild[child.id]?.length > 0 && (
              <div className="bg-white/60 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2 text-cuba-warmGray">Album photos</h4>
                <div className="grid grid-cols-3 gap-2">
                  {photosByChild[child.id].slice(0, 3).map((photo: any) => (
                    <div key={photo.id} className="aspect-square rounded-md overflow-hidden">
                      <img
                        src={photo.url}
                        alt="Photo album"
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {child.description && (
              <div className="bg-white/60 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1 text-cuba-warmGray">Description</h4>
                <p className="text-sm text-gray-700">{child.description}</p>
              </div>
            )}

            {/* Story */}
            {child.story && (
              <div className="bg-white/60 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-1 text-cuba-warmGray">Histoire</h4>
                <p className="text-sm text-gray-700 italic">{child.story}</p>
              </div>
            )}

            {/* Needs Section avec couleurs douces */}
            <div className="pt-2 border-t border-cuba-softOrange/20">
              <h4 className="font-medium text-sm mb-2 text-cuba-warmGray">Besoins</h4>
              <div className="grid gap-2">
                {convertJsonToNeeds(child.needs).map((need: any, index: number) => (
                  <div
                    key={`${need.category}-${index}`}
                    className={`px-3 py-2 rounded-lg ${
                      need.is_urgent
                        ? "bg-red-600 text-white border border-red-700"
                        : "bg-orange-50 text-orange-800 border border-orange-200"
                    }`}
                  >
                    <div className="font-medium">
                      {need.is_urgent && (
                        <span className="font-bold mr-2">URGENT</span>
                      )}
                      {need.category}
                      {need.is_urgent && (
                        <span className="ml-1 font-bold">(!)</span>
                      )}
                    </div>
                    {need.description && (
                      <p className={`text-xs mt-1 ${need.is_urgent ? 'text-red-100' : 'text-gray-600'} italic`}>
                        {need.description}
                      </p>
                    )}
                  </div>
                ))}
                {(!Array.isArray(child.needs) || child.needs.length === 0) && (
                  <p className="text-sm text-gray-500">Aucun besoin enregistré</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};