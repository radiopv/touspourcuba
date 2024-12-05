import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Need } from "@/types/needs";
import { useLanguage } from "@/contexts/LanguageContext";
import { logActivity } from "@/utils/activity-logger";
import { useAuth } from "@/components/Auth/AuthProvider";

export const DetailedStats = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const { data: urgentNeeds, isLoading: urgentLoading, error: urgentError } = useQuery({
    queryKey: ['urgent-needs'],
    queryFn: async () => {
      console.log('Fetching urgent needs...');
      const { data, error } = await supabase
        .from('children')
        .select('id, name, needs')
        .not('needs', 'is', null);
      
      if (error) {
        console.error('Error fetching urgent needs:', error);
        throw error;
      }

      if (user) {
        await logActivity(user.id, "A consulté les besoins urgents");
      }

      // Filter children with urgent needs and log the process
      const childrenWithUrgentNeeds = data.filter(child => {
        if (!child.needs) return false;
        
        try {
          const needs = typeof child.needs === 'string' ? JSON.parse(child.needs) : child.needs;
          console.log('Processing child:', child.name, 'needs:', needs);
          
          if (!Array.isArray(needs)) {
            console.log('Needs is not an array for child:', child.name);
            return false;
          }
          
          const hasUrgentNeeds = needs.some((need: Need) => {
            const isUrgent = need.is_urgent === true;
            if (isUrgent) {
              console.log('Found urgent need for child:', child.name, 'need:', need);
            }
            return isUrgent;
          });
          
          return hasUrgentNeeds;
        } catch (e) {
          console.error('Error processing needs for child:', child.name, e);
          return false;
        }
      });

      console.log('Total children with urgent needs:', childrenWithUrgentNeeds.length);
      return childrenWithUrgentNeeds;
    }
  });

  const renderError = (message: string) => (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <div className="ml-2">{message}</div>
    </Alert>
  );

  const renderSkeleton = () => (
    <div className="h-[300px] w-full">
      <Skeleton className="h-full w-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('urgentNeeds')}</h3>
          <div className="h-[300px]">
            {urgentError ? renderError(t('error')) : 
             urgentLoading ? renderSkeleton() : (
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {urgentNeeds?.map((child) => {
                    const needs = typeof child.needs === 'string' 
                      ? JSON.parse(child.needs) 
                      : child.needs;
                    
                    const urgentNeeds = needs.filter((need: Need) => need.is_urgent);

                    return (
                      <div key={child.id} className="p-3 bg-red-50 rounded-lg">
                        <p className="font-medium text-gray-900">{child.name}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {urgentNeeds.map((need: Need, index: number) => (
                            <Badge 
                              key={`${need.category}-${index}`}
                              variant="destructive"
                            >
                              {need.category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {(!urgentNeeds || urgentNeeds.length === 0) && (
                    <div className="text-center text-gray-500">
                      {t('noUrgentNeeds')}
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};