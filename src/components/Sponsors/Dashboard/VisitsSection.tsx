import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { fr, es } from "date-fns/locale";
import { Hotel, Calendar, Gift, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVisitDelete } from "./hooks/useVisitDelete";

interface Visit {
  id: string;
  start_date: string;
  end_date: string;
  hotel_name?: string;
  wants_to_visit_child?: boolean;
  wants_donation_pickup?: boolean;
  notes?: string;
}

interface VisitsSectionProps {
  visits: Visit[];
  onVisitDeleted?: () => void;
}

export const VisitsSection = ({ visits, onVisitDeleted }: VisitsSectionProps) => {
  const { language } = useLanguage();
  const { handleDelete } = useVisitDelete(onVisitDeleted);

  const translations = {
    fr: {
      noVisits: "Aucune visite prévue",
      hotel: "Hôtel",
      from: "Du",
      to: "au",
      willVisitChild: "Souhaite visiter son filleul",
      hasDonations: "A des dons à remettre",
      deleteVisit: "Supprimer cette visite"
    },
    es: {
      noVisits: "No hay visitas programadas",
      hotel: "Hotel",
      from: "Del",
      to: "al",
      willVisitChild: "Desea visitar a su ahijado",
      hasDonations: "Tiene donaciones para entregar",
      deleteVisit: "Eliminar esta visita"
    }
  };

  const t = translations[language as keyof typeof translations];
  const dateLocale = language === 'fr' ? fr : es;

  if (!visits?.length) {
    return <p className="text-gray-600">{t.noVisits}</p>;
  }

  return (
    <div className="space-y-4">
      {visits.map((visit) => (
        <div key={visit.id} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cuba-turquoise" />
              <p className="font-medium">
                {t.from} {format(new Date(visit.start_date), 'PPP', { locale: dateLocale })}
                {' '}{t.to}{' '}
                {format(new Date(visit.end_date), 'PPP', { locale: dateLocale })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDelete(visit.id)}
              title={t.deleteVisit}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {visit.hotel_name && (
            <div className="flex items-center gap-2 text-gray-600">
              <Hotel className="w-4 h-4" />
              <p>{t.hotel}: {visit.hotel_name}</p>
            </div>
          )}

          {visit.wants_to_visit_child && (
            <div className="flex items-center gap-2 text-cuba-coral">
              <User className="w-4 h-4" />
              <p>{t.willVisitChild}</p>
            </div>
          )}

          {visit.wants_donation_pickup && (
            <div className="flex items-center gap-2 text-cuba-pink">
              <Gift className="w-4 h-4" />
              <p>{t.hasDonations}</p>
            </div>
          )}

          {visit.notes && (
            <p className="text-gray-600 mt-2">{visit.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
};