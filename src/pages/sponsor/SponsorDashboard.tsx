import { useState } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Share2, ChevronDown, ChevronUp, Image, Calendar, Heart, ChartBar, Book, ListChecks, ImagePlus, MessageSquarePlus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NeedNotifications } from "@/components/Dashboard/NeedNotifications";
import { ChildNeeds } from "@/components/Dashboard/ChildrenNeeds/ChildNeeds";
import { differenceInDays } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { convertJsonToNeeds } from "@/types/needs";

const SponsorDashboard = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const translations = {
    fr: {
      welcomeMessage: "Bienvenue",
      inviteFriends: "Inviter des amis",
      loginRequired: "Veuillez vous connecter pour accéder à votre tableau de bord.",
      login: "Se connecter",
      loading: "Chargement...",
      sponsorDashboard: "Mon Espace Parrain",
      shareError: "Le partage n'est pas disponible sur votre appareil",
      copySuccess: "Lien copié dans le presse-papiers !",
      copyError: "Impossible de copier le lien",
      photos: "Photos",
      testimonials: "Témoignages",
      statistics: "Statistiques",
      birthday: "Anniversaire",
      addTestimonial: "Ajouter un témoignage",
      nextBirthday: "Prochain anniversaire",
      daysLeft: "jours restants",
      needs: "Besoins",
      story: "Histoire",
      description: "Description",
      noTestimonials: "Aucun témoignage pour le moment",
      addPhoto: "Ajouter une photo",
    },
    es: {
      welcomeMessage: "Bienvenido",
      inviteFriends: "Invitar amigos",
      loginRequired: "Por favor, inicie sesión para acceder a su panel.",
      login: "Iniciar sesión",
      loading: "Cargando...",
      sponsorDashboard: "Mi Panel de Padrino",
      shareError: "El compartir no está disponible en su dispositivo",
      copySuccess: "¡Enlace copiado al portapapeles!",
      copyError: "No se pudo copiar el enlace",
      photos: "Fotos",
      testimonials: "Testimonios",
      statistics: "Estadísticas",
      birthday: "Cumpleaños",
      addTestimonial: "Agregar testimonio",
      nextBirthday: "Próximo cumpleaños",
      daysLeft: "días restantes",
      needs: "Necesidades",
      story: "Historia",
      description: "Descripción",
      noTestimonials: "No hay testimonios por el momento",
      addPhoto: "Agregar una foto",
    }
  } as const;

  const handleAddPhoto = (childId?: string) => {
    if (childId) {
      navigate(`/children/${childId}/album`);
    }
  };

  const handleAddTestimonial = (childId?: string) => {
    if (childId) {
      navigate('/testimonials/new', { state: { childId } });
    }
  };

  const { data: sponsoredChildren, isLoading } = useQuery({
    queryKey: ["sponsored-children", user?.id],
    queryFn: async () => {
      const { data: sponsorships, error } = await supabase
        .from('sponsorships')
        .select(`
          id,
          child_id,
          start_date,
          children (
            id,
            name,
            photo_url,
            city,
            birth_date,
            description,
            story,
            needs,
            age
          )
        `)
        .eq('sponsor_id', user?.id)
        .eq('status', 'active');

      if (error) throw error;
      return sponsorships;
    },
    enabled: !!user?.id
  });

  const { data: childrenPhotos } = useQuery({
    queryKey: ["children-photos", sponsoredChildren?.map(s => s.child_id)],
    queryFn: async () => {
      if (!sponsoredChildren?.length) return [];
      
      const { data, error } = await supabase
        .from('album_media')
        .select('*')
        .in('child_id', sponsoredChildren.map(s => s.child_id))
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!sponsoredChildren?.length
  });

  const { data: testimonials } = useQuery({
    queryKey: ['testimonials', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('temoignage')
        .select('*')
        .eq('sponsor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const getBirthdayCountdown = (birthDate: string) => {
    if (!birthDate) return null;
    
    const today = new Date();
    const birth = new Date(birthDate);
    const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    return differenceInDays(nextBirthday, today);
  };

  const handleShare = async () => {
    const shareData = {
      title: translations[language].inviteFriends,
      text: translations[language].inviteFriends,
      url: window.location.origin + '/become-sponsor'
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success(t.copySuccess);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error(t.copyError);
    }
  };

  const calculateSponsorshipDuration = (startDate: string) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const countUrgentNeeds = (needs: any[]) => {
    if (!Array.isArray(needs)) return 0;
    return needs.filter(need => need.is_urgent).length;
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-none rounded-lg shadow-lg">
          <p className="text-center text-gray-700">{t.loginRequired}</p>
          <Button 
            onClick={() => navigate("/login")}
            className="mt-4 mx-auto block bg-cuba-turquoise hover:bg-cuba-turquoise/90 text-white"
          >
            {t.login}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cuba-offwhite to-cuba-warmBeige p-4 md:p-6">
      <div className="container mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-800">{t.sponsorDashboard}</h2>
          <Button 
            onClick={handleShare}
            className="bg-cuba-turquoise hover:bg-cuba-turquoise/90 text-white flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {t.inviteFriends}
          </Button>
        </div>

        <NeedNotifications />

        <div className="grid gap-6">
          {sponsoredChildren?.map((sponsorship) => {
            const childPhotos = childrenPhotos?.filter(photo => 
              photo.child_id === sponsorship.children?.id
            ) || [];

            const childTestimonials = testimonials?.filter(testimonial =>
              testimonial.child_id === sponsorship.children?.id
            ) || [];

            return (
              <Card 
                key={sponsorship.id} 
                className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-4">
                        <img
                          src={sponsorship.children?.photo_url || "/placeholder.svg"}
                          alt={sponsorship.children?.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="text-left">
                          <h3 className="text-lg font-semibold">{sponsorship.children?.name}</h3>
                          <p className="text-sm text-gray-600">{sponsorship.children?.city}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-6 pb-4">
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => handleAddPhoto(sponsorship.children?.id)}
                        >
                          <ImagePlus className="w-4 h-4" />
                          {t.addPhoto}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => handleAddTestimonial(sponsorship.children?.id)}
                        >
                          <MessageSquarePlus className="w-4 h-4" />
                          {t.addTestimonial}
                        </Button>
                      </div>

                      <Tabs defaultValue="photos" className="w-full">
                        <TabsList className="grid w-full grid-cols-6 mb-4">
                          <TabsTrigger value="photos" className="flex items-center gap-2">
                            <Image className="w-4 h-4" />
                            {t.photos}
                          </TabsTrigger>
                          <TabsTrigger value="testimonials" className="flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            {t.testimonials}
                          </TabsTrigger>
                          <TabsTrigger value="statistics" className="flex items-center gap-2">
                            <ChartBar className="w-4 h-4" />
                            {t.statistics}
                          </TabsTrigger>
                          <TabsTrigger value="birthday" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {t.birthday}
                          </TabsTrigger>
                          <TabsTrigger value="needs" className="flex items-center gap-2">
                            <ListChecks className="w-4 h-4" />
                            {t.needs}
                          </TabsTrigger>
                          <TabsTrigger value="story" className="flex items-center gap-2">
                            <Book className="w-4 h-4" />
                            {t.story}
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="photos" className="space-y-4">
                          <div className="grid grid-cols-3 gap-2">
                            {childPhotos.slice(0, 3).map((photo) => (
                              <div 
                                key={photo.id} 
                                className="aspect-square relative overflow-hidden rounded-lg"
                              >
                                <img
                                  src={photo.url}
                                  alt={`Photo de ${sponsorship.children?.name}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="testimonials" className="space-y-4">
                          <div className="bg-white p-4 rounded-lg">
                            {childTestimonials.length === 0 ? (
                              <p className="text-center text-gray-500">{t.noTestimonials}</p>
                            ) : (
                              <div className="space-y-4">
                                {childTestimonials.map((testimonial) => (
                                  <div 
                                    key={testimonial.id} 
                                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                  >
                                    <p className="text-gray-600">{testimonial.content}</p>
                                    <div className="mt-2 text-sm">
                                      {testimonial.is_approved ? (
                                        <span className="text-green-600">Approuvé</span>
                                      ) : (
                                        <span className="text-yellow-600">En attente d'approbation</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="statistics" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-cuba-warmBeige/20 p-4 rounded-lg">
                              <h4 className="font-medium mb-2">Photos</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Total photos :</span>
                                  <span className="font-bold">{childPhotos.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Dernière photo :</span>
                                  <span className="font-bold">
                                    {childPhotos[0]?.created_at 
                                      ? new Date(childPhotos[0].created_at).toLocaleDateString()
                                      : 'Aucune'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-cuba-warmBeige/20 p-4 rounded-lg">
                              <h4 className="font-medium mb-2">Besoins</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Total besoins :</span>
                                  <span className="font-bold">
                                    {sponsorship.children?.needs ? convertJsonToNeeds(sponsorship.children.needs).length : 0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Besoins urgents :</span>
                                  <span className="font-bold text-cuba-coral">
                                    {sponsorship.children?.needs ? 
                                      countUrgentNeeds(convertJsonToNeeds(sponsorship.children.needs)) : 0}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-cuba-warmBeige/20 p-4 rounded-lg">
                              <h4 className="font-medium mb-2">Témoignages</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Total témoignages :</span>
                                  <span className="font-bold">
                                    {childTestimonials.length}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Dernier témoignage :</span>
                                  <span className="font-bold">
                                    {childTestimonials[0]?.created_at 
                                      ? new Date(childTestimonials[0].created_at).toLocaleDateString()
                                      : 'Aucun'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-cuba-warmBeige/20 p-4 rounded-lg">
                              <h4 className="font-medium mb-2">Durée du parrainage</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Jours écoulés :</span>
                                  <span className="font-bold">
                                    {calculateSponsorshipDuration(sponsorship.start_date)} jours
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Date de début :</span>
                                  <span className="font-bold">
                                    {sponsorship.start_date 
                                      ? new Date(sponsorship.start_date).toLocaleDateString()
                                      : 'Non disponible'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="birthday" className="space-y-4">
                          <div className="bg-cuba-warmBeige/20 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">{t.nextBirthday}</h4>
                            <p className="text-2xl font-bold text-cuba-coral">
                              {sponsorship.children?.birth_date ? 
                                getBirthdayCountdown(sponsorship.children.birth_date) : null} {t.daysLeft}
                            </p>
                          </div>
                        </TabsContent>

                        <TabsContent value="needs" className="space-y-4">
                          <div className="bg-white p-4 rounded-lg">
                            <div className="grid gap-3">
                              {sponsorship.children?.needs && convertJsonToNeeds(sponsorship.children.needs).map((need, index) => (
                                <div
                                  key={`${need.category}-${index}`}
                                  className={`p-4 rounded-lg ${
                                    need.is_urgent
                                      ? "bg-red-50 border border-red-200"
                                      : "bg-gray-50 border border-gray-200"
                                  }`}
                                >
                                  <div className="font-medium text-gray-900">
                                    {need.category}
                                    {need.is_urgent && (
                                      <span className="ml-2 text-red-600 font-bold">(!)</span>
                                    )}
                                  </div>
                                  {need.description && (
                                    <p className="mt-1 text-sm text-gray-600">
                                      {need.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="story" className="space-y-4">
                          <div className="bg-white p-4 rounded-lg space-y-6">
                            {sponsorship.children?.description && (
                              <div>
                                <h4 className="font-medium mb-2">{t.description}</h4>
                                <p className="text-gray-600">{sponsorship.children.description}</p>
                              </div>
                            )}
                            {sponsorship.children?.story && (
                              <div>
                                <h4 className="font-medium mb-2">{t.story}</h4>
                                <p className="text-gray-600">{sponsorship.children.story}</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SponsorDashboard;
