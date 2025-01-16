import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import AutoplayPlugin from "embla-carousel-autoplay";

interface AlbumMedia {
  id: string;
  url: string;
  title: string | null;
  children?: {
    name: string;
  } | null;
  sponsors?: {
    name: string;
  } | null;
  created_at: string;
}

export const FeaturedAlbum = () => {
  const { data: photos, isLoading } = useQuery({
    queryKey: ["featured-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("album_media")
        .select(`
          *,
          children (name),
          sponsors (name)
        `)
        .eq("is_featured", true)
        .eq("is_approved", true)
        .limit(10);

      if (error) {
        console.error("Error fetching featured photos:", error);
        throw error;
      }

      return data as AlbumMedia[];
    },
  });

  if (isLoading || !photos?.length) {
    return null;
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        AutoplayPlugin({
          delay: 3000,
        }),
      ]}
      className="w-full max-w-4xl mx-auto"
    >
      <CarouselContent>
        {photos.map((photo) => (
          <CarouselItem key={photo.id} className="md:basis-1/3 lg:basis-1/4">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <img
                src={photo.url}
                alt={photo.title || "Photo souvenir"}
                className="object-cover w-full h-full"
              />
              {photo.title && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white">
                  <p className="text-xs truncate">{photo.title}</p>
                </div>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};