import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { FeaturedTestimonials } from "./FeaturedTestimonials";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface HeroSectionProps {
  heroSection?: {
    title?: string;
    subtitle?: string;
  };
  onImageClick: () => void;
}

export const HeroSection = ({ heroSection, onImageClick }: HeroSectionProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[90vh] bg-cuba-gradient overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-golden-shimmer animate-golden-light"
      />
      <div className="container mx-auto h-full relative z-10">
        <div className="flex flex-col lg:flex-row h-full items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-1/2 h-[50vh] lg:h-full relative"
          >
            <img 
              src="/lovable-uploads/c0c5a7da-df66-4f94-91c4-b5428f6fcc0d.png"
              alt="Hero background"
              className="absolute inset-0 w-full h-full object-cover cursor-pointer rounded-lg shadow-2xl transform transition-transform duration-300 hover:scale-105"
              onClick={onImageClick}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/20 rounded-lg" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-1/2 p-6 lg:p-12"
          >
            <div className="max-w-xl mx-auto space-y-8">
              <div className="text-center lg:text-left">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-4xl lg:text-5xl font-bold text-white font-title mb-4"
                >
                  {heroSection?.title || t('heroTitle')}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="text-xl text-white/90 mb-8"
                >
                  {heroSection?.subtitle || t('heroSubtitle')}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <Button 
                    onClick={() => navigate("/become-sponsor")}
                    size="lg"
                    className="bg-cuba-gold text-black hover:bg-cuba-gold/90 transform transition-all duration-300 hover:scale-105"
                  >
                    {t('becomeSponsor')}
                  </Button>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="mt-12 bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {t('testimonials')}
                  </h3>
                  <Carousel
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent>
                      <CarouselItem className="md:basis-full">
                        <FeaturedTestimonials />
                      </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                  </Carousel>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};