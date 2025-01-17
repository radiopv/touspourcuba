import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInYears, parseISO } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { convertJsonToNeeds } from "@/types/needs";
import { useAuth } from "@/components/Auth/AuthProvider";
import { ArrowLeft, Heart, AlertTriangle } from "lucide-react";

const ChildDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const { data: child, isLoading, error } = useQuery({
    queryKey: ["child", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  const formatAge = (birthDate: string) => {
    if (!birthDate) return '';
    const years = differenceInYears(new Date(), parseISO(birthDate));
    return `${years} ans`;
  };

  const handleSponsorshipRequest = async () => {
    if (!user) {
      navigate(`/become-sponsor?child=${id}`);
      return;
    }

    try {
      const { error } = await supabase
        .from('sponsorship_requests')
        .insert({
          child_id: id,
          full_name: user.name,
          email: user.email,
          city: user.city,
          status: 'pending',
          sponsor_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée",
        description: "Votre demande de parrainage est en cours d'examen",
      });
    } catch (error) {
      console.error('Erreur lors de la demande de parrainage:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la demande de parrainage",
      });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Card className="p-6 text-center">
          <p className="text-red-500">Erreur lors du chargement des détails de l'enfant</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const needs = child?.needs ? convertJsonToNeeds(child.needs) : [];
  const urgentNeeds = needs.filter(need => need.is_urgent);
  const regularNeeds = needs.filter(need => !need.is_urgent);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Left Column - Photo and Sponsorship Button */}
        <div className="md:col-span-5 space-y-6">
          <Card className="overflow-hidden border-cuba-softOrange/20">
            <div className="aspect-square relative">
              <img
                src={child?.photo_url || "/placeholder.svg"}
                alt={child?.name}
                className="w-full h-full object-cover"
              />
            </div>
          </Card>
          
          {!child?.is_sponsored && (
            <Button 
              onClick={handleSponsorshipRequest}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cuba-coral to-cuba-coral/90 hover:from-cuba-coral/90 hover:to-cuba-coral text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-lg"
              size="lg"
            >
              <Heart className="w-6 h-6" />
              Parrainer {child?.name}
            </Button>
          )}
        </div>

        {/* Right Column - Child Information */}
        <div className="md:col-span-7 space-y-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-cuba-coral/20">
            <div className="space-y-4">
              <div className="border-b border-cuba-softOrange/20 pb-4">
                <h1 className="text-3xl font-bold text-cuba-coral mb-2">{child?.name}</h1>
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Âge:</span>
                    <span>{child?.birth_date ? formatAge(child.birth_date) : "Non renseigné"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Ville:</span>
                    <span>{child?.city || "Non renseignée"}</span>
                  </div>
                </div>
              </div>

              {child?.description && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-cuba-coral">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{child.description}</p>
                </div>
              )}

              {child?.story && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-cuba-coral">Histoire</h3>
                  <p className="text-gray-700 leading-relaxed italic">{child.story}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Needs Section */}
          {needs.length > 0 && (
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-cuba-coral/20">
              <h3 className="text-xl font-semibold mb-4 text-cuba-coral">Besoins</h3>
              
              {/* Urgent Needs */}
              {urgentNeeds.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="text-red-500 w-5 h-5" />
                    <h4 className="font-medium text-red-500">Besoins urgents</h4>
                  </div>
                  <div className="grid gap-3">
                    {urgentNeeds.map((need, index) => (
                      <div
                        key={index}
                        className="bg-red-50 border border-red-100 rounded-lg p-4"
                      >
                        <span className="font-medium text-red-700">{need.category}</span>
                        {need.description && (
                          <p className="text-sm text-red-600 mt-1">{need.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Needs */}
              {regularNeeds.length > 0 && (
                <div className="grid gap-3">
                  {regularNeeds.map((need, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border border-gray-100 rounded-lg p-4"
                    >
                      <span className="font-medium text-gray-700">{need.category}</span>
                      {need.description && (
                        <p className="text-sm text-gray-600 mt-1">{need.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildDetails;