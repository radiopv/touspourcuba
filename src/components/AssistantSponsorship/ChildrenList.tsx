import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChildrenListProps {
  children: Array<{
    id: string;
    name: string;
    age: number;
    birth_date: string;
    city: string;
    comments: string;
    created_at: string;
    description: string;
    end_date: string;
    gender: string;
    sponsorships: Array<{ id: string; sponsor: { id: string; name: string; } }>;
  }>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectChild: (id: string) => void;
  onRemoveSponsorship?: (childId: string) => void;
}

export const ChildrenList = ({
  children,
  searchTerm,
  onSearchChange,
  onSelectChild,
}: ChildrenListProps) => {
  const { t } = useLanguage();

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder={t("searchChildren")}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />
      <div className="space-y-2">
        {filteredChildren.map(child => (
          <Card key={child.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-lg font-semibold">{child.name}</span>
                <span className="text-sm text-gray-500 ml-2">{child.age} ans</span>
                <span className="text-sm text-gray-500 ml-2">• {child.city}</span>
              </div>
              <Button 
                onClick={() => onSelectChild(child.id)}
                size="sm"
                variant="outline"
              >
                {t("select")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};