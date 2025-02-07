import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

const FAQ = () => {
  const { t } = useLanguage();

  const { data: faqItems, isLoading } = useQuery({
    queryKey: ["faq-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-0 sm:px-4 space-y-4">
        <Skeleton className="h-12 w-48 mx-auto" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cuba-warmBeige/20 to-cuba-offwhite">
      <div className="container mx-auto px-0 sm:px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-title text-center mb-8 text-cuba-coral">
            {t("faq")}
          </h1>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-none sm:rounded-xl shadow-lg p-4 sm:p-8 border-0 sm:border sm:border-cuba-softOrange/20">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems?.map((item) => (
                <AccordionItem 
                  key={item.id} 
                  value={item.id}
                  className="border border-cuba-coral/20 rounded-none sm:rounded-lg overflow-hidden transition-all duration-200 hover:border-cuba-coral/40 bg-white/50"
                >
                  <AccordionTrigger className="px-4 py-3 text-lg font-title hover:no-underline hover:text-cuba-coral">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 text-gray-600 prose max-w-none">
                    <div className="whitespace-pre-wrap">
                      {item.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;