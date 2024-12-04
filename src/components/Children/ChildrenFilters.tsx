import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChildrenFiltersProps {
  searchTerm: string;
  selectedCity: string;
  selectedGender: string;
  selectedAge: string;
  selectedStatus: string;
  onSearchChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onAgeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  cities: string[];
  ages: number[];
}

export const ChildrenFilters = ({
  searchTerm,
  selectedCity,
  selectedGender,
  selectedAge,
  selectedStatus,
  onSearchChange,
  onCityChange,
  onGenderChange,
  onAgeChange,
  onStatusChange,
  cities,
  ages,
}: ChildrenFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Rechercher un enfant..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>
      <div className="flex gap-2 flex-wrap md:flex-nowrap">
        <Select value={selectedCity} onValueChange={onCityChange}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Ville" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">Toutes les villes</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedGender} onValueChange={onGenderChange}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="M">Masculin</SelectItem>
            <SelectItem value="F">Féminin</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedAge.toString()} onValueChange={onAgeChange}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Âge" />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-[300px]">
            <SelectItem value="all">Tous les âges</SelectItem>
            {ages.map((age) => (
              <SelectItem key={age} value={age.toString()}>
                {age} ans
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="available">Disponible</SelectItem>
            <SelectItem value="sponsored">Parrainé</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="urgent">Besoins urgents</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};