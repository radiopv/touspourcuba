import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowUpDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { differenceInYears, differenceInMonths, parseISO } from "date-fns";
import { useState } from "react";

interface ChildrenTableProps {
  children: any[];
  onViewProfile: (id: string) => void;
  onSponsorClick: (child: any) => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export const ChildrenTable = ({ children, onViewProfile, onSponsorClick }: ChildrenTableProps) => {
  const { t } = useLanguage();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  const formatAge = (birthDate: string) => {
    if (!birthDate) return t("ageNotAvailable");
    
    const today = new Date();
    const birth = parseISO(birthDate);
    const years = differenceInYears(today, birth);
    
    if (years === 0) {
      const months = differenceInMonths(today, birth);
      return `${months} ${t("months")}`;
    }
    
    return `${years} ${t("years")}`;
  };

  const sortData = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const getSortedChildren = () => {
    if (!sortConfig.key) return children;

    return [...children].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'age') {
        const aDate = parseISO(a.birth_date);
        const bDate = parseISO(b.birth_date);
        aValue = aDate.getTime();
        bValue = bDate.getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const renderSortButton = (key: string, label: string) => (
    <Button
      variant="ghost"
      onClick={() => sortData(key)}
      className="h-8 flex items-center gap-1 p-0 hover:bg-transparent"
    >
      {label}
      <ArrowUpDown className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{renderSortButton('name', t("name"))}</TableHead>
            <TableHead>{renderSortButton('age', t("age"))}</TableHead>
            <TableHead>{renderSortButton('city', t("city"))}</TableHead>
            <TableHead>{renderSortButton('is_sponsored', t("status"))}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getSortedChildren().map((child) => (
            <TableRow key={child.id}>
              <TableCell className="font-medium">{child.name}</TableCell>
              <TableCell>{formatAge(child.birth_date)}</TableCell>
              <TableCell>{child.city}</TableCell>
              <TableCell>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    !child.is_sponsored
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {child.is_sponsored ? t("sponsored") : t("available")}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSponsorClick(child)}
                  className="w-full sm:w-auto"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {child.is_sponsored ? t("editOrRemoveSponsor") : t("addSponsor")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};