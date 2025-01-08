import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface CardActionsProps {
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onLearnMore: (e: React.MouseEvent) => void;
  translations: any;
}

export const CardActions = ({ 
  editing, 
  onEdit, 
  onSave, 
  onCancel, 
  onLearnMore,
  translations 
}: CardActionsProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {editing ? (
        <>
          <Button 
            className="w-full sm:w-3/4 bg-green-600 hover:bg-green-700 text-white"
            onClick={onSave}
          >
            {translations.save}
          </Button>
          <Button 
            className="w-full sm:w-3/4 bg-gray-100 hover:bg-gray-200 text-gray-900"
            onClick={onCancel}
          >
            {translations.cancel}
          </Button>
        </>
      ) : (
        <>
          <Button 
            className="w-full sm:w-3/4 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200" 
            variant="outline"
            onClick={onEdit}
          >
            {translations.edit}
          </Button>
          <Button
            className="w-full sm:w-3/4 flex items-center gap-2 bg-primary hover:bg-primary/90 text-white"
            onClick={onLearnMore}
          >
            <Info className="h-4 w-4" />
            {translations.learnMore}
          </Button>
        </>
      )}
    </div>
  );
};